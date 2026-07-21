// Thin client over the TNIHPL public API. Base URL is configurable; in production
// we default to the same-origin /api/v1 route so Vercel rewrites it correctly.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "/api/v1";

export type Hostel = {
  id: string;
  name: string;
  code: string;
  locationName: string | null;
  description: string | null;
  displayInWebsite: boolean;
  soldOut: boolean;
  amenityIds: string[];
};

export type Availability = {
  hostelId: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
};

// Mirrors TNIHPL.Domain.Corporate.CorporateDocumentType (backend/src/TNIHPL.Domain/Corporate/CorporateDocument.cs).
export type CorporateDocumentType =
  | "IncorporationOrConsentToOperate"
  | "EmployeeStrengthProof"
  | "AnnualTurnoverProof"
  | "GstinCertificate"
  | "SignatoryIdProof";

export type CompanyWritePayload = {
  companyCode?: string | null;
  name: string;
  gstin?: string | null;
  state?: string | null;
  contactName?: string | null;
  mobile?: string | null;
  email: string;
  address?: string | null;
  corporateCode?: string | null;
  recentPhoto?: string | null;
  addressProof?: string | null;
};

export type CreateCorporateReservationPayload = {
  companyId: string;
  hostelId: string;
  roomTypeId?: string | null;
  bedTypeId?: string | null;
  totalBeds: number;
  checkInDate?: string | null;
  agreementDate?: string | null;
  agreementExpiryDate?: string | null;
  initialAdvanceAmount: number;
  monthlyRentDiscount: number;
  isGstExempted: boolean;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  uploadAgreementDocument?: string | null;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error ?? body.title ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export const api = {
  websiteHostels: () =>
    http<Hostel[]>("/public/hostels", { cache: "no-store" }),

  availability: (hostelId: string) =>
    http<Availability>(`/public/availability?hostelId=${hostelId}`),

  sendOtp: (email: string, purpose: "registration" | "feedback") =>
    http<void>("/public/otp/send", {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    }),

  submitRegistration: (payload: Record<string, unknown>) =>
    http<{ id: string }>("/public/registrations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  submitPreBooking: (payload: {
    name: string;
    phone: string;
    email: string;
    preferredLocation?: string;
    message?: string;
  }) =>
    http<{ id: string }>("/public/pre-bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadFile: async (file: File, folder = "registrations"): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/public/uploads?folder=${folder}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error("Upload failed");
    const body = (await res.json()) as { key: string };
    return body.key;
  },

  // ---- Corporate public intake (no admin login required) ----

  createCompany: (payload: CompanyWritePayload) =>
    http<{ id: string }>("/public/companies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sendCompanyOtp: (companyId: string) =>
    http<void>(`/public/companies/${companyId}/send-otp`, { method: "POST" }),

  verifyCompanyEmail: (companyId: string, code: string) =>
    http<void>(`/public/companies/${companyId}/verify-email`, {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  uploadCompanyDocument: async (
    companyId: string,
    type: CorporateDocumentType,
    file: File,
  ): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${API_BASE}/public/companies/${companyId}/documents?type=${type}`,
      { method: "POST", body: form },
    );
    if (!res.ok) throw new Error("Document upload failed");
    const body = (await res.json()) as { id: string };
    return body.id;
  },

  createCorporateReservation: (payload: CreateCorporateReservationPayload) =>
    http<{ id: string }>("/public/corporate-reservations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  uploadEmployeeRoster: async (
    reservationId: string,
    file: File,
  ): Promise<{ count: number }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(
      `${API_BASE}/public/corporate-reservations/${reservationId}/employees`,
      { method: "POST", body: form },
    );
    if (!res.ok) {
      let message = "Employee roster upload failed.";
      try {
        const body = await res.json();
        message = body.error ?? message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    return (await res.json()) as { count: number };
  },
};
