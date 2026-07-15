// Resident self-service portal API client (Resident Portal R1).
import { API_BASE } from "./api";

const TOKEN_KEY = "tnihpl_resident_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function authed<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token ?? ""}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    clearToken();
    throw new Error("Your session has expired. Please sign in again.");
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      message = (await res.json()).error ?? message;
    } catch {}
    throw new Error(message);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export type ResidentProfile = {
  contactId: string;
  name: string;
  email: string;
  mobile: string;
  residentType: string | null;
  hostelId: string | null;
  approvalStatus: number;
};

export type ResidentStay = {
  stayId: string;
  bookingId: string;
  hostelId: string;
  hostelName: string | null;
  roomNumber: string | null;
  bedCode: string | null;
  typeOfStay: string | null;
  checkIn: string | null;
  actualCheckOut: string | null;
  status: number; // 1 Reserved, 2 Active, 3 CheckedOut, 4 Cancelled
  lateCheckOut: boolean;
};

export const STAY_STATUS: Record<number, string> = {
  1: "Reserved",
  2: "Active",
  3: "Checked out",
  4: "Cancelled",
};

export type ResidentBillListItem = {
  id: string;
  invoiceNumber: string;
  billTitle: string | null;
  billType: number; // 1 Deposit, 2 Rent, 3 Other
  billAmount: number;
  balance: number;
  billStatus: number; // 1 Unpaid, 2 Paid, 3 PartiallyPaid, 4 Cancelled
  billDate: string;
  dueDate: string | null;
};

export type ResidentBill = ResidentBillListItem & {
  billDescription: string | null;
  deposit: number;
  rent: number;
  gstAmount: number;
  billAmountInWords: string | null;
  isGstExempted: boolean;
  receiptDate: string | null;
  paidAmount: number;
  modeOfPayment: string | null;
  txnId: string | null;
  paymentLinkUrl: string | null;
  hostelName: string | null;
  residentName: string;
  residentEmail: string;
  residentMobile: string | null;
};

export type ResidentPayment = {
  billId: string;
  invoiceNumber: string;
  billTitle: string | null;
  paidAmount: number;
  mode: string | null;
  txnId: string | null;
  transactionDate: string | null;
};

export type ResidentCheckout = {
  keyId: string; // empty => sandbox demo (no real Razorpay popup)
  orderId: string;
  amountPaise: number;
  currency: string;
  invoiceNumber: string;
  billTitle: string | null;
  residentName: string;
  residentEmail: string;
  residentMobile: string | null;
};

export const BILL_STATUS: Record<number, string> = { 1: "Unpaid", 2: "Paid", 3: "Partially paid", 4: "Cancelled" };
export const BILL_TYPE: Record<number, string> = { 1: "Deposit", 2: "Rent", 3: "Other" };

export type ResidentServiceRequest = {
  id: string;
  type: string | null;
  problemDescription: string | null;
  priority: number; // 1 Low, 2 Medium, 3 High
  status: number; // 1 Open, 2 InProgress, 3 Resolved, 4 Closed
  requestedDate: string;
  completedDate: string | null;
  daysOpen: number;
  comments: string | null;
};

export const REQUEST_STATUS: Record<number, string> = { 1: "Open", 2: "In progress", 3: "Resolved", 4: "Closed" };
export const REQUEST_PRIORITY: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };

export type ResidentRefund = {
  id: string;
  refundId: string;
  reason: number; // 1 Checkout, 2 Cancel, 3 Rejection
  stayedDays: number;
  advancePaid: number;
  totalDeductions: number;
  totalRefundAmount: number;
  amountToPay: number;
  refundStatus: number; // 1 Draft, 2 Confirmed, 3 Initiated, 4 Settled, 5 Rejected
  settlementStatus: number; // 1 Pending, 2 Settled, 3 Failed
  refundRejectionReason: string | null;
  bankAccountMasked: string | null;
  bankHolderName: string | null;
  bankName: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  canSubmitBankDetails: boolean;
  hostelName: string | null;
  createdAt: string;
};

export const REFUND_STATUS: Record<number, string> = { 1: "Awaiting check-out", 2: "Confirmed — bank details needed", 3: "Transfer initiated", 4: "Settled", 5: "Rejected" };
export const REFUND_REASON: Record<number, string> = { 1: "Check-out", 2: "Cancellation", 3: "Rejection" };

// Stay-change kinds (match the API enum)
export const STAY_CHANGE_KIND: Record<number, string> = { 1: "Vacate notice", 2: "Room change", 3: "Stay extension" };

export type ResidentAnnouncement = { id: string; title: string; body: string; category: string | null; publishedAt: string };
export type ResidentFoodPreference = { foodOpted: boolean; mealType: string | null; mealTime: string | null };
export type ResidentReview = { id: string; reviewText: string; showOnWebsite: boolean; createdAt: string };
export type ResidentDocument = { kind: string; label: string; onFile: boolean };
export type FeedbackRatings = {
  safetySecurity: number; hygiene: number; amenities: number; staffBehaviour: number; foodQuality: number; overall: number;
};

export const resident = {
  sendOtp: (email: string) =>
    fetch(`${API_BASE}/resident/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  login: async (email: string, code: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/resident/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (!res.ok) {
      let msg = "Invalid or expired code.";
      try {
        msg = (await res.json()).error ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const body = (await res.json()) as { accessToken: string };
    setToken(body.accessToken);
  },

  profile: () => authed<ResidentProfile>("/me/profile"),
  stay: () => authed<ResidentStay>("/me/stay"),

  bills: () => authed<ResidentBillListItem[]>("/me/bills"),
  bill: (id: string) => authed<ResidentBill>(`/me/bills/${id}`),
  payments: () => authed<ResidentPayment[]>("/me/payments"),
  payNow: (id: string) => authed<{ url: string; linkId: string }>(`/me/bills/${id}/pay-now`, { method: "POST" }),
  checkout: (id: string) => authed<ResidentCheckout>(`/me/bills/${id}/checkout`, { method: "POST" }),
  verifyPayment: (id: string, body: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) =>
    authed<void>(`/me/bills/${id}/verify`, { method: "POST", body: JSON.stringify(body) }),

  serviceRequests: () => authed<ResidentServiceRequest[]>("/me/service-requests"),
  serviceRequest: (id: string) => authed<ResidentServiceRequest>(`/me/service-requests/${id}`),
  createServiceRequest: (body: { type: string | null; problemDescription: string; priority: number }) =>
    authed<{ id: string }>("/me/service-requests", { method: "POST", body: JSON.stringify(body) }),

  createStayChange: (body: { kind: number; note: string | null }) =>
    authed<{ id: string }>("/me/stay-requests", { method: "POST", body: JSON.stringify(body) }),
  refunds: () => authed<ResidentRefund[]>("/me/refunds"),
  refund: (id: string) => authed<ResidentRefund>(`/me/refunds/${id}`),
  submitBankDetails: (id: string, body: { accountNumber: string; holderName: string; bankName: string | null; ifsc: string; branch: string | null }) =>
    authed<void>(`/me/refunds/${id}/bank-details`, { method: "POST", body: JSON.stringify(body) }),

  // R5: extras
  announcements: () => authed<ResidentAnnouncement[]>("/me/announcements"),
  foodPreference: () => authed<ResidentFoodPreference>("/me/food-preference"),
  updateFoodPreference: (body: ResidentFoodPreference) =>
    authed<void>("/me/food-preference", { method: "PUT", body: JSON.stringify(body) }),
  submitFeedback: (body: { feedbackType: string | null; monthYear: string | null; ratings: FeedbackRatings }) =>
    authed<{ id: string }>("/me/feedback", { method: "POST", body: JSON.stringify(body) }),
  reviews: () => authed<ResidentReview[]>("/me/reviews"),
  submitReview: (reviewText: string) =>
    authed<{ id: string }>("/me/reviews", { method: "POST", body: JSON.stringify({ reviewText }) }),
  documents: () => authed<ResidentDocument[]>("/me/documents"),

  uploadDocument: async (kind: string, file: File): Promise<void> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/me/documents/${kind}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken() ?? ""}` }, // no Content-Type — browser sets the multipart boundary
      body: form,
    });
    if (res.status === 401 || res.status === 403) {
      clearToken();
      throw new Error("Your session has expired. Please sign in again.");
    }
    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try {
        message = (await res.json()).error ?? message;
      } catch {}
      throw new Error(message);
    }
  },

  // Returns an object URL for the resident's own document (fetched with the auth header).
  documentUrl: async (kind: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/me/documents/${kind}`, {
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Could not open the document.");
    return URL.createObjectURL(await res.blob());
  },
};
