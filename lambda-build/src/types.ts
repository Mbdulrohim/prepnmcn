export interface WebhookAttachment {
  filename: string | null;
  contentType: string;
  size: number;
  content: string;
}

export interface WebhookPayload {
  messageId: string;
  from: string;
  to: string;
  cc: string | null;
  bcc: string | null;
  subject: string;
  htmlBody: string | null;
  textBody: string | null;
  receivedAt: string; // ISO timestamp
  headers: Record<string, string>; // normalized headers
  s3Bucket: string;
  s3Key: string;
  attachments: WebhookAttachment[];
  inReplyTo: string | null;
  references: string[] | string | null; // mailparser returns string|string[]
  //   spamScore: number; // you are assigning 0 or 5
  spamStatus: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED' | 'DISABLED';
  virusStatus: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED' | 'DISABLED';
  spfStatus: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED' | 'DISABLED';
  dkimStatus: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED' | 'DISABLED';
  dmarcStatus: 'PASS' | 'FAIL' | 'GRAY' | 'PROCESSING_FAILED' | 'DISABLED';
}
