// Thin client over the TNIHPL public API. Base URL is configurable; defaults to the dev API.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:5080/api/v1";

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
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  websiteHostels: () =>
    http<Hostel[]>("/public/hostels", { cache: "no-store" }),

  availability: (hostelId: string) =>
    http<Availability>(`/public/availability?hostelId=${hostelId}`),

  sendOtp: (email: string, purpose: "registration" | "feedback") =>
    http<void>("/public/otp/send", { method: "POST", body: JSON.stringify({ email, purpose }) }),

  submitRegistration: (payload: Record<string, unknown>) =>
    http<{ id: string }>("/public/registrations", { method: "POST", body: JSON.stringify(payload) }),

  submitPreBooking: (payload: {
    name: string;
    phone: string;
    email: string;
    preferredLocation?: string;
    message?: string;
  }) => http<{ id: string }>("/public/pre-bookings", { method: "POST", body: JSON.stringify(payload) }),

  uploadFile: async (file: File, folder = "registrations"): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/public/uploads?folder=${folder}`, { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const body = (await res.json()) as { key: string };
    return body.key;
  },
};
