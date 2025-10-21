import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getDataSource } from "./database";
import { Payment, PaymentStatus, PaymentMethod } from "../entities/Payment";

export const runtime = "nodejs";

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Verify Paystack webhook signature
export function verifyPaystackWebhook(
  payload: string,
  signature: string,
  secret: string = PAYSTACK_SECRET_KEY!
): boolean {
  const hash = createHmac("sha512", secret).update(payload).digest("hex");

  return hash === signature;
}

// Initialize payment and create database record
export async function initializePayment(data: {
  email: string;
  amount: number; // Amount in kobo (smallest currency unit)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
  userId: string;
  description?: string;
}) {
  try {
    const dataSource = await getDataSource();
    const paymentRepository = dataSource.getRepository(Payment);

    // Create payment record in database
    const payment = paymentRepository.create({
      userId: data.userId,
      amount: fromKobo(data.amount), // Convert from kobo to Naira
      currency: "NGN",
      status: PaymentStatus.PENDING,
      method: PaymentMethod.CARD,
      description: data.description || "Payment via Paystack",
      transactionId: data.reference,
    });

    await paymentRepository.save(payment);

    // Initialize payment with Paystack
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          amount: data.amount,
          reference: data.reference || payment.id, // Use payment ID as reference if not provided
          callback_url: data.callback_url,
          metadata: {
            ...data.metadata,
            paymentId: payment.id,
            userId: data.userId,
          },
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      // Update payment status to failed if Paystack initialization fails
      payment.status = PaymentStatus.FAILED;
      await paymentRepository.save(payment);
      throw new Error(result.message || "Failed to initialize payment");
    }

    // Update transaction ID if it was auto-generated
    if (!data.reference) {
      payment.transactionId = result.data.reference;
      await paymentRepository.save(payment);
    }

    return {
      ...result,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Paystack initialization error:", error);
    throw error;
  }
}

// Verify payment and update database record
export async function verifyPayment(reference: string) {
  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to verify payment");
    }

    // Update payment status in database
    const dataSource = await getDataSource();
    const paymentRepository = dataSource.getRepository(Payment);
    const payment = await paymentRepository.findOne({
      where: { transactionId: reference },
    });

    if (payment) {
      if (result.data.status === "success") {
        payment.status = PaymentStatus.COMPLETED;
      } else if (result.data.status === "failed") {
        payment.status = PaymentStatus.FAILED;
      }
      // Update amount if it differs (in case of partial payments)
      if (result.data.amount) {
        payment.amount = fromKobo(result.data.amount);
      }
      await paymentRepository.save(payment);
    }

    return result;
  } catch (error) {
    console.error("Paystack verification error:", error);
    throw error;
  }
}

// Get transaction details
export async function getTransaction(id: string) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to get transaction");
    }

    return result;
  } catch (error) {
    console.error("Paystack transaction fetch error:", error);
    throw error;
  }
}

// List transactions
export async function listTransactions(params?: {
  reference?: string;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    const queryParams = new URLSearchParams();
    if (params?.reference) queryParams.append("reference", params.reference);
    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.perPage)
      queryParams.append("perPage", params.perPage.toString());

    const url = `${PAYSTACK_BASE_URL}/transaction?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to list transactions");
    }

    return result;
  } catch (error) {
    console.error("Paystack list transactions error:", error);
    throw error;
  }
}

// Charge authorization (for recurring payments)
export async function chargeAuthorization(data: {
  authorization_code: string;
  email: string;
  amount: number;
  reference?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/charge_authorization`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorization_code: data.authorization_code,
          email: data.email,
          amount: data.amount,
          reference: data.reference,
          metadata: data.metadata,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to charge authorization");
    }

    return result;
  } catch (error) {
    console.error("Paystack charge authorization error:", error);
    throw error;
  }
}

// Create customer
export async function createCustomer(data: {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create customer");
    }

    return result;
  } catch (error) {
    console.error("Paystack create customer error:", error);
    throw error;
  }
}

// Get customer
export async function getCustomer(emailOrId: string) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/customer/${emailOrId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to get customer");
    }

    return result;
  } catch (error) {
    console.error("Paystack get customer error:", error);
    throw error;
  }
}

// Create plan (for subscriptions)
export async function createPlan(data: {
  name: string;
  amount: number;
  interval: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  description?: string;
  send_invoices?: boolean;
  send_sms?: boolean;
  currency?: string;
}) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/plan`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create plan");
    }

    return result;
  } catch (error) {
    console.error("Paystack create plan error:", error);
    throw error;
  }
}

// Create subscription
export async function createSubscription(data: {
  customer: string;
  plan: string;
  authorization?: string;
  start_date?: string;
}) {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/subscription`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to create subscription");
    }

    return result;
  } catch (error) {
    console.error("Paystack create subscription error:", error);
    throw error;
  }
}

// Webhook event types
export const PAYSTACK_WEBHOOK_EVENTS = {
  CHARGE_SUCCESS: "charge.success",
  SUBSCRIPTION_CREATE: "subscription.create",
  SUBSCRIPTION_DISABLE: "subscription.disable",
  INVOICE_CREATE: "invoice.create",
  INVOICE_UPDATE: "invoice.update",
  TRANSFER_SUCCESS: "transfer.success",
  TRANSFER_FAILED: "transfer.failed",
} as const;

// Handle Paystack webhook and update payment status
export async function handlePaystackWebhook(event: string, data: any) {
  try {
    const dataSource = await getDataSource();
    const paymentRepository = dataSource.getRepository(Payment);

    console.log(`Processing Paystack webhook: ${event}`, data);

    switch (event) {
      case PAYSTACK_WEBHOOK_EVENTS.CHARGE_SUCCESS:
        const payment = await paymentRepository.findOne({
          where: { transactionId: data.reference },
        });

        if (payment) {
          payment.status = PaymentStatus.COMPLETED;
          payment.amount = fromKobo(data.amount);
          await paymentRepository.save(payment);
          console.log(`Payment ${payment.id} marked as completed`);
        }
        break;

      case PAYSTACK_WEBHOOK_EVENTS.SUBSCRIPTION_CREATE:
        // Handle subscription creation
        console.log("Subscription created:", data);
        break;

      case PAYSTACK_WEBHOOK_EVENTS.SUBSCRIPTION_DISABLE:
        // Handle subscription disable
        console.log("Subscription disabled:", data);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { success: true, event };
  } catch (error) {
    console.error("Paystack webhook handling error:", error);
    throw error;
  }
}

export type PaystackWebhookEvent =
  (typeof PAYSTACK_WEBHOOK_EVENTS)[keyof typeof PAYSTACK_WEBHOOK_EVENTS];

// Utility function to convert amount to kobo (Nigerian Naira)
export function toKobo(amount: number): number {
  return Math.round(amount * 100);
}

// Utility function to convert kobo to Naira
export function fromKobo(kobo: number): number {
  return kobo / 100;
}

// Utility function to generate reference
export function generateReference(prefix: string = "TXN"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}
