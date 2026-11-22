// pure headless razorpay checkout client helper
// manages dynamic script injection, order creation via /api/donate/order,
// razorpay modal orchestration, and backend verification via /api/donate/verify.

export interface RazorpayPaymentSuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  theme?: {
    color: string;
  };
  handler: (response: RazorpayPaymentSuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

// dynamically appends the official razorpay script to the dom if not already present
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="checkout.razorpay.com"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface StartDonationParams {
  amountInMinorUnits: number;
  currency: string;
  onSuccess?: (payment: RazorpayPaymentSuccessResponse) => void;
  onFailure?: (error: Error) => void;
  onDismiss?: () => void;
}

// initiates donation flow by querying /api/donate/order and launching the razorpay popup
export async function startRazorpayDonation({
  amountInMinorUnits,
  currency,
  onSuccess,
  onFailure,
  onDismiss,
}: StartDonationParams): Promise<void> {
  try {
    const scriptLoaded = await loadRazorpayCheckoutScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error("Razorpay SDK could not be loaded. Check your internet connection.");
    }

    const orderRes = await fetch("/api/donate/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: amountInMinorUnits, currency }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok || !orderData.id || !orderData.key) {
      throw new Error(orderData.error || "Failed to initialize payment order.");
    }

    const checkout = new window.Razorpay({
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      order_id: orderData.id,
      name: "ColorWall",
      description: "Support ColorWall",
      theme: { color: "#008bea" },
      handler: async (response) => {
        try {
          const verifyRes = await fetch("/api/donate/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.verified) {
            onSuccess?.(response);
          } else {
            throw new Error("Payment signature verification failed on the server.");
          }
        } catch (err) {
          onFailure?.(err instanceof Error ? err : new Error(String(err)));
        }
      },
      modal: {
        ondismiss: () => {
          onDismiss?.();
        },
      },
    });

    checkout.on("payment.failed", () => {
      onFailure?.(new Error("Payment failed. Please try again or use another payment method."));
    });

    checkout.open();
  } catch (err) {
    onFailure?.(err instanceof Error ? err : new Error(String(err)));
  }
}
