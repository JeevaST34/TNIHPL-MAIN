// Corporate Portal API client — company contact self-service (login only, no employee logins).
import { API_BASE } from "./api";

const TOKEN_KEY = "tnihpl_corporate_token";

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

// Mirrors TNIHPL.Domain.Corporate.CorporateStatus.
export const RESERVATION_STATUS: Record<number, string> = {
  1: "Pending approval",
  2: "Approved",
  3: "Rejected",
  4: "Closed",
};

export type CompanyProfile = {
  companyId: string;
  companyName: string;
  contactName: string;
  email: string;
  mobile: string | null;
  reservationId: string | null;
  reservationCode: string | null;
  status: number | null; // CorporateStatus: 1 PendingApproval, 2 Approved, 3 Rejected, 4 Closed
  hostelId: string | null;
  totalBeds: number;
  occupiedBeds: number;
  agreementExpiryDate: string | null;
};

export type CompanyAnnouncement = { id: string; title: string; body: string; category: string | null; publishedAt: string };

export type CompanyBillListItem = {
  id: string;
  invoiceNumber: string;
  billType: number; // 1 Deposit, 2 Rent, 3 Other
  billTitle: string | null;
  billAmount: number;
  amountInWords: string | null;
  billStatus: number; // 1 Unpaid, 2 Paid, 3 PartiallyPaid, 4 Cancelled
  billDate: string;
  dueDate: string | null;
  periodYear: number | null;
  periodMonth: number | null;
  paidAmount: number;
  balance: number;
};

export const BILL_STATUS: Record<number, string> = { 1: "Unpaid", 2: "Paid", 3: "Partially paid", 4: "Cancelled" };
export const BILL_TYPE: Record<number, string> = { 1: "Deposit", 2: "Rent", 3: "Other" };

export type CompanyCheckout = {
  keyId: string; // empty => sandbox demo (no real Razorpay popup)
  orderId: string;
  amountPaise: number;
  currency: string;
  invoiceNumber: string;
  billTitle: string | null;
  companyName: string;
  contactEmail: string;
  contactMobile: string | null;
};

export type CompanyServiceRequest = {
  id: string;
  type: string | null;
  problemDescription: string | null;
  priority: number; // 1 Low, 2 Medium, 3 High
  status: number; // 1 Open, 2 InProgress, 3 Resolved, 4 Closed
  requestedDate: string;
  completedDate: string | null;
  daysOpen: number;
  comments: string | null;
  roomNumber: string | null;
  pictures: string | null;
};

export const REQUEST_STATUS: Record<number, string> = { 1: "Open", 2: "In progress", 3: "Resolved", 4: "Closed" };
export const REQUEST_PRIORITY: Record<number, string> = { 1: "Low", 2: "Medium", 3: "High" };

export const corporatePortal = {
  sendOtp: (email: string) =>
    fetch(`${API_BASE}/corporate-portal/otp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  login: async (email: string, code: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/corporate-portal/login`, {
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

  profile: () => authed<CompanyProfile>("/company-me/profile"),
  rooms: () => authed<string[]>("/company-me/rooms"),
  announcements: () => authed<CompanyAnnouncement[]>("/company-me/announcements"),

  bills: () => authed<CompanyBillListItem[]>("/company-me/bills"),
  bill: (id: string) => authed<CompanyBillListItem>(`/company-me/bills/${id}`),
  checkout: (id: string) => authed<CompanyCheckout>(`/company-me/bills/${id}/checkout`, { method: "POST" }),
  verifyPayment: (id: string, body: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) =>
    authed<void>(`/company-me/bills/${id}/verify`, { method: "POST", body: JSON.stringify(body) }),

  serviceRequests: () => authed<CompanyServiceRequest[]>("/company-me/service-requests"),
  createServiceRequest: (body: { roomNumber: string; type: string | null; problemDescription: string; priority: number; pictures?: string | null }) =>
    authed<{ id: string }>("/company-me/service-requests", { method: "POST", body: JSON.stringify(body) }),

  uploadServiceRequestPhoto: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/company-me/service-requests/photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken() ?? ""}` },
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
    const body = (await res.json()) as { key: string };
    return body.key;
  },
};
