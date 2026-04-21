import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SESEventRecord, SESHandler, SESMail } from 'aws-lambda';
import crypto from 'crypto';
import { AddressObject, Attachment, simpleParser } from 'mailparser';
import { WebhookAttachment, WebhookPayload } from './types';

const region = process.env.Region,
  s3Client = new S3Client({ region: process.env.REGION });

const WEBHOOK_URL = process.env.WEBHOOK_URL,
  HMAC_SECRET = process.env.HMAC_SECRET,
  bucketName = process.env.MAIL_S3_BUCKET,
  bucketPrefix = process.env.MAIL_S3_PREFIX || '',
  MAX_ATTACHMENT = 1 * 1024 * 1024; // 1 MB

interface FileDict {
  file: Uint8Array;
  path: string;
}

export const handler: SESHandler = async (event) => {
  const messageId = event.Records[0].ses.mail.messageId,
    recipientEmail = event.Records[0].ses.receipt.recipients[0].toLowerCase(),
    record = event.Records[0];

  console.log(`Received message ID: ${messageId}`);
  console.log(`Recipient: ${recipientEmail}`);

  const fileDict = await getMessageFromS3(messageId),
    payload = await generateWebhookPayload(fileDict, record);

  await sendToWebhook(payload);

  console.log('Webhook sent successfully!');
};

async function getMessageFromS3(messageId: string): Promise<FileDict> {
  const key = bucketPrefix ? `${bucketPrefix}/${messageId}` : messageId;

  if (!bucketName) {
    throw new Error('❌ RECEIPT_BUCKET environment variable is not set');
  }

  const object = await s3Client.send(new GetObjectCommand({ Bucket: bucketName, Key: key }));
  if (!object.Body) throw new Error('❌ Empty S3 object body');

  const file = await object.Body.transformToByteArray();

  const url = `https://s3.console.aws.amazon.com/s3/object/${bucketName}/${key}?region=${region}`;

  return { file, path: url };
}

function createWebhookSignature(data: string): string {
  if (!HMAC_SECRET) {
    throw new Error('❌ Missing HMAC_SECRET variable');
  }

  return crypto.createHmac('sha256', HMAC_SECRET).update(data).digest('hex');
}

async function generateWebhookPayload(fileDict: FileDict, record: SESEventRecord): Promise<WebhookPayload> {
  const { ses } = record,
    { mail, receipt } = ses;

  const parsed = await simpleParser(Buffer.from(fileDict.file)),
    sanitizedAttachments = (parsed.attachments || []).filter((att: Attachment) => att.size <= MAX_ATTACHMENT);

  if (!bucketName) {
    throw new Error('❌ RECEIPT_BUCKET environment variable is not set');
  }

  return {
    messageId: mail.messageId,
    from: parsed.from?.text || mail.source,
    to: mail.destination.join(','),
    cc: getAddressText(parsed.cc),
    bcc: getAddressText(parsed.bcc),
    subject: parsed.subject || '(No Subject)',
    htmlBody: parsed.html || null,
    textBody: parsed.text || null,
    receivedAt: new Date(mail.timestamp).toISOString(),
    headers: normalizeHeaders(parsed.headers),
    s3Bucket: bucketName,
    s3Key: fileDict.path,
    attachments: mapAttachments(sanitizedAttachments),
    inReplyTo: parsed.inReplyTo || null,
    references: parsed.references || null,
    spamStatus: receipt.spamVerdict.status,
    virusStatus: receipt.virusVerdict.status,
    spfStatus: receipt.spfVerdict.status,
    dkimStatus: receipt.dkimVerdict.status,
    dmarcStatus: receipt.dmarcVerdict.status,
  };
}

async function sendToWebhook(payload: WebhookPayload) {
  if (!WEBHOOK_URL) {
    throw new Error('❌ Missing WEBHOOK_URL variable');
  }

  const signature = createWebhookSignature(JSON.stringify(payload)),
    controller = new AbortController(),
    timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'User-Agent': 'AWS-Lambda-Email-Processor/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`❌ Webhook returned ${response.status}: ${text}`);
    }
    return true;
  } catch (err) {
    throw new Error(`❌ Webhook request failed: ${String(err)}`);
  } finally {
    clearTimeout(timeout);
  }
}

/////////////////////////////////////////////////////////////

// Helper Functions Below

/////////////////////////////////////////////////////////////

function getAddressText(field: AddressObject | AddressObject[] | undefined): string | null {
  if (!field) return null;

  if (Array.isArray(field)) {
    return field.map((f) => f.text).join(', ');
  }

  return field.text;
}

function normalizeHeaders(headersMap: Map<string, any>): Record<string, string> {
  const obj: Record<string, string> = {};
  headersMap.forEach((value, key) => {
    if (value === null || value === undefined) {
      obj[key] = '';
    } else if (Array.isArray(value)) {
      // join arrays (e.g. multiple Received headers)
      obj[key] = value.map((v) => v.toString()).join(', ');
    } else {
      obj[key] = value.toString();
    }
  });
  return obj;
}

function mapAttachments(attachments: Attachment[]): WebhookAttachment[] {
  return attachments.map((att) => ({
    filename: att.filename ?? null, // undefined -> null
    contentType: att.contentType,
    size: att.size,
    content: att.content.toString('base64'), // Buffer -> base64 string
  }));
}
