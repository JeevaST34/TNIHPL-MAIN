import Link from "next/link";

// Sandbox payment landing. The NullPaymentGateway points its "links" here; in production the
// real Razorpay-hosted Payment Link handles the transaction and the webhook settles the bill.
export default async function PayPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 text-center border border-slate-200 shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 text-3xl font-extrabold shadow-sm mb-4">
          ₹
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Complete Your Payment</h1>
        <p className="text-slate-600 text-base mb-3">
          This is a sandbox payment page for invoice <span className="font-mono font-bold text-slate-900">{ref}</span>.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          In production, you will be seamlessly directed to a secure 256-bit encrypted Razorpay Payment Gateway link, and your stay invoice will be automatically marked settled.
        </p>
        <Link href="/" className="btn-lc-send w-full inline-block text-center">
          <i className="fa-solid fa-arrow-left mr-2"></i> Return to Home
        </Link>
      </div>
    </main>
  );
}
