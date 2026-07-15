// Loads the Razorpay Checkout SDK on demand. Returns true once window.Razorpay is available.
const SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

export type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RazorpayCtor = new (options: any) => { open: () => void; on: (evt: string, cb: (e: unknown) => void) => void };

export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as unknown as { Razorpay?: RazorpayCtor }).Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function getRazorpay(): RazorpayCtor | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay ?? null;
}
