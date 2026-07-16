// Admin portal API client for TNIHPL Hostel Management Admin.
import { API_BASE } from "./api";

const ADMIN_TOKEN_KEY = "tnihpl_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
export function setAdminToken(t: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, t);
}
export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function authedAdmin<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (res.status === 401 || res.status === 403) {
    clearAdminToken();
    throw new Error("Session expired. Please sign in again.");
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminDashboard = {
  pendingRegistrations: number;
  activeStays: number;
  openServiceRequests: number;
  occupancyPercent: number;
  unpaidBillsAmount: number;
  unpaidBillsCount: number;
  cashInMtd: number;
  pendingExpenses: number;
  pendingRefunds: number;
  totalHostels: number;
  totalBeds: number;
  activeAgreements: number;
  monthlyRecurring: number;
  bedStatus: { available: number; occupied: number; other: number };
  occupancyByHostel: { hostelName: string; total: number; occupied: number; percent: number }[];
};

export type AdminRegistration = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  registeredAt: string;
  approvalStatus: number; // 1 Pending, 2 Approved, 3 Rejected
  hostelId: string | null;
  hostelName: string | null;
};

export type AdminStay = {
  stayId: string;
  bookingId: string;
  hostelId: string;
  hostelName: string | null;
  residentName: string | null;
  roomNumber: string | null;
  bedCode: string | null;
  checkIn: string | null;
  actualCheckOut: string | null;
  status: number; // 1 Reserved, 2 Active, 3 CheckedOut, 4 Cancelled
};

export type AdminServiceRequest = {
  id: string;
  residentName: string | null;
  type: string | null;
  problemDescription: string | null;
  priority: number;
  status: number;
  requestedDate: string;
  completedDate: string | null;
  daysOpen: number;
};

export type AdminFeedback = {
  id: string;
  residentName: string | null;
  hostelName: string | null;
  monthYear: string | null;
  feedbackType: string | null;
  overallRating: number;
  submittedAt: string;
};

export type AdminReview = {
  id: string;
  residentName: string | null;
  reviewText: string;
  showOnWebsite: boolean;
  createdAt: string;
};

export type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  category: string | null;
  publishedAt: string;
};

export type AdminBooking = {
  id: string;
  bookingId: string;
  contactName: string | null;
  companyName: string | null;
  hostelName: string | null;
  checkIn: string | null;
  status: number; // 1 Reserved, 2 Active, 3 CheckedOut, 4 Cancelled
};

export type AdminCompany = {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

export type AdminBill = {
  id: string;
  invoiceNumber: string;
  billTitle: string | null;
  billType: number;
  billAmount: number;
  balance: number;
  billStatus: number;
  billDate: string;
  dueDate: string | null;
  residentName: string | null;
};

export type AdminRefund = {
  id: string;
  refundId: string;
  residentName: string | null;
  totalRefundAmount: number;
  amountToPay: number;
  reason: number;
  refundStatus: number;
  settlementStatus: number;
  createdAt: string;
};

export type AdminExpense = {
  id: string;
  title: string;
  amount: number;
  expenseType: string | null;
  hostelName: string | null;
  status: number; // 1 Pending, 2 Approved, 3 Rejected
  incurredAt: string;
};

export type AdminHostel = {
  id: string;
  code: string;
  name: string;
  locationName: string | null;
  displayInWebsite: boolean;
  soldOut: boolean;
  totalBeds: number;
  availableBeds: number;
};

export type AdminRoom = {
  id: string;
  roomNumber: string;
  hostelId: string;
  hostelName: string | null;
  totalBeds: number;
  occupiedBeds: number;
};

export type AdminRoomTariff = {
  id: string;
  hostelName: string | null;
  roomTypeName: string | null;
  bedTypeName: string | null;
  monthlyRent: number;
  depositAmount: number;
};

export type AdminHostelManager = {
  id: string;
  name: string;
  email: string;
  hostelName: string | null;
};

export type AdminRoomType = {
  id: string;
  name: string;
  description: string | null;
};

export type AdminBedType = {
  id: string;
  name: string;
  description: string | null;
};

export type AdminAmenity = {
  id: string;
  name: string;
  icon: string | null;
};

export type AdminLocation = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

export type AdminEmployee = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  hostelName: string | null;
};

export type AdminExpenseType = {
  id: string;
  name: string;
};

export type AdminRejectionReason = {
  id: string;
  reason: string;
};

export type AdminRentSetting = {
  id: string;
  dailyStayAdvance: number;
  hostelId: string | null;
  hostelName: string | null;
};

export type AdminGalleryItem = {
  id: string;
  title: string | null;
  imageUrl: string;
  hostelName: string | null;
  displayOrder: number;
};

export type AdminNewsEvent = {
  id: string;
  title: string;
  body: string;
  publishedAt: string;
};

export type AdminMaintenance = {
  id: string;
  roomNumber: string | null;
  hostelName: string | null;
  date: string;
  status: number;
};

export type AdminReport = {
  cashInByMonth: { month: string; amount: number }[];
  occupancyByHostel: { hostelName: string; total: number; available: number; occupied: number; occupancy: string }[];
  stayStatus: { status: string; count: number }[];
  feedbackSummary: { category: string; avg: number }[];
  feedbackOverall: number;
  feedbackCount: number;
};

// ─── Status Maps ──────────────────────────────────────────────────────────────

export const ADMIN_REGISTRATION_STATUS: Record<number, string> = {
  1: "Pending",
  2: "Approved",
  3: "Rejected",
};

export const ADMIN_STAY_STATUS: Record<number, string> = {
  1: "Reserved",
  2: "Active",
  3: "Checked out",
  4: "Cancelled",
};

export const ADMIN_BILL_STATUS: Record<number, string> = {
  1: "Unpaid",
  2: "Paid",
  3: "Partially paid",
  4: "Cancelled",
};

export const ADMIN_BILL_TYPE: Record<number, string> = {
  1: "Deposit",
  2: "Rent",
  3: "Other",
};

export const ADMIN_REFUND_STATUS: Record<number, string> = {
  1: "Awaiting check-out",
  2: "Confirmed",
  3: "Transfer initiated",
  4: "Settled",
  5: "Rejected",
};

export const ADMIN_REQUEST_STATUS: Record<number, string> = {
  1: "Open",
  2: "In progress",
  3: "Resolved",
  4: "Closed",
};

export const ADMIN_REQUEST_PRIORITY: Record<number, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

// ─── API client ───────────────────────────────────────────────────────────────

export const adminApi = {
  login: async (email: string, password: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      let msg = "Invalid credentials.";
      try {
        msg = (await res.json()).error ?? msg;
      } catch {}
      throw new Error(msg);
    }
    const body = (await res.json()) as { accessToken: string };
    setAdminToken(body.accessToken);
  },

  // Dashboard
  dashboard: () => authedAdmin<AdminDashboard>("/admin/dashboard"),

  // Reports
  reports: () => authedAdmin<AdminReport>("/admin/reports"),

  // Tenancy
  registrations: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminRegistration>>(`/admin/registrations?${q}`);
  },
  registration: (id: string) => authedAdmin<AdminRegistration>(`/admin/registrations/${id}`),
  approveRegistration: (id: string) =>
    authedAdmin<void>(`/admin/registrations/${id}/approve`, { method: "POST" }),
  rejectRegistration: (id: string, reason: string) =>
    authedAdmin<void>(`/admin/registrations/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  stays: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminStay>>(`/admin/stays?${q}`);
  },
  stay: (id: string) => authedAdmin<AdminStay>(`/admin/stays/${id}`),

  serviceRequests: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminServiceRequest>>(`/admin/service-requests?${q}`);
  },

  feedbacks: (params?: { page?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    return authedAdmin<PagedResult<AdminFeedback>>(`/admin/feedbacks?${q}`);
  },

  reviews: (params?: { page?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    return authedAdmin<PagedResult<AdminReview>>(`/admin/reviews?${q}`);
  },
  toggleReviewVisibility: (id: string, show: boolean) =>
    authedAdmin<void>(`/admin/reviews/${id}/visibility`, {
      method: "PUT",
      body: JSON.stringify({ showOnWebsite: show }),
    }),

  announcements: (params?: { page?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    return authedAdmin<PagedResult<AdminAnnouncement>>(`/admin/announcements?${q}`);
  },
  createAnnouncement: (body: { title: string; body: string; category: string | null }) =>
    authedAdmin<{ id: string }>("/admin/announcements", { method: "POST", body: JSON.stringify(body) }),
  deleteAnnouncement: (id: string) =>
    authedAdmin<void>(`/admin/announcements/${id}`, { method: "DELETE" }),

  // Corporate
  bookings: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminBooking>>(`/admin/bookings?${q}`);
  },

  companies: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminCompany>>(`/admin/companies?${q}`);
  },

  // Finance
  bills: (params?: { page?: number; search?: string; year?: number; month?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    if (params?.year) q.set("year", String(params.year));
    if (params?.month) q.set("month", String(params.month));
    return authedAdmin<PagedResult<AdminBill>>(`/admin/bills?${q}`);
  },
  runMonthlyBilling: (year: number, month: number) =>
    authedAdmin<void>("/admin/bills/run-monthly", {
      method: "POST",
      body: JSON.stringify({ year, month }),
    }),

  refunds: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminRefund>>(`/admin/refunds?${q}`);
  },

  expenses: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminExpense>>(`/admin/expenses?${q}`);
  },

  // Inventory
  hostels: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminHostel>>(`/admin/hostels?${q}`);
  },
  createHostel: (body: { name: string; code: string; locationId?: string | null; description?: string | null }) =>
    authedAdmin<{ id: string }>("/admin/hostels", { method: "POST", body: JSON.stringify(body) }),
  deleteHostel: (id: string) =>
    authedAdmin<void>(`/admin/hostels/${id}`, { method: "DELETE" }),

  rooms: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminRoom>>(`/admin/rooms?${q}`);
  },
  createRoom: (body: { roomNumber: string; hostelId: string }) =>
    authedAdmin<{ id: string }>("/admin/rooms", { method: "POST", body: JSON.stringify(body) }),

  roomTariffs: (params?: { page?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    return authedAdmin<PagedResult<AdminRoomTariff>>(`/admin/room-tariffs?${q}`);
  },

  hostelManagers: (params?: { page?: number }) =>
    authedAdmin<PagedResult<AdminHostelManager>>(`/admin/hostel-managers?page=${params?.page ?? 1}`),

  // Catalog
  roomTypes: () => authedAdmin<AdminRoomType[]>("/admin/room-types"),
  createRoomType: (body: { name: string; description: string | null }) =>
    authedAdmin<{ id: string }>("/admin/room-types", { method: "POST", body: JSON.stringify(body) }),
  deleteRoomType: (id: string) =>
    authedAdmin<void>(`/admin/room-types/${id}`, { method: "DELETE" }),

  bedTypes: () => authedAdmin<AdminBedType[]>("/admin/bed-types"),
  createBedType: (body: { name: string; description: string | null }) =>
    authedAdmin<{ id: string }>("/admin/bed-types", { method: "POST", body: JSON.stringify(body) }),
  deleteBedType: (id: string) =>
    authedAdmin<void>(`/admin/bed-types/${id}`, { method: "DELETE" }),

  amenities: () => authedAdmin<AdminAmenity[]>("/admin/amenities"),
  createAmenity: (body: { name: string; icon: string | null }) =>
    authedAdmin<{ id: string }>("/admin/amenities", { method: "POST", body: JSON.stringify(body) }),
  deleteAmenity: (id: string) =>
    authedAdmin<void>(`/admin/amenities/${id}`, { method: "DELETE" }),

  locations: () => authedAdmin<AdminLocation[]>("/admin/locations"),
  createLocation: (body: { name: string; city: string | null; state: string | null }) =>
    authedAdmin<{ id: string }>("/admin/locations", { method: "POST", body: JSON.stringify(body) }),
  deleteLocation: (id: string) =>
    authedAdmin<void>(`/admin/locations/${id}`, { method: "DELETE" }),

  // Content
  gallery: (params?: { page?: number }) =>
    authedAdmin<PagedResult<AdminGalleryItem>>(`/admin/gallery?page=${params?.page ?? 1}`),
  newsEvents: (params?: { page?: number }) =>
    authedAdmin<PagedResult<AdminNewsEvent>>(`/admin/news-events?page=${params?.page ?? 1}`),
  maintenance: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminMaintenance>>(`/admin/maintenance?${q}`);
  },

  // Administration
  employees: (params?: { page?: number }) =>
    authedAdmin<PagedResult<AdminEmployee>>(`/admin/employees?page=${params?.page ?? 1}`),
  expenseTypes: () => authedAdmin<AdminExpenseType[]>("/admin/expense-types"),
  createExpenseType: (body: { name: string }) =>
    authedAdmin<{ id: string }>("/admin/expense-types", { method: "POST", body: JSON.stringify(body) }),
  deleteExpenseType: (id: string) =>
    authedAdmin<void>(`/admin/expense-types/${id}`, { method: "DELETE" }),

  rejectionReasons: () => authedAdmin<AdminRejectionReason[]>("/admin/rejection-reasons"),
  createRejectionReason: (body: { reason: string }) =>
    authedAdmin<{ id: string }>("/admin/rejection-reasons", { method: "POST", body: JSON.stringify(body) }),
  deleteRejectionReason: (id: string) =>
    authedAdmin<void>(`/admin/rejection-reasons/${id}`, { method: "DELETE" }),

  rentSettings: (params?: { page?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.search) q.set("search", params.search);
    return authedAdmin<PagedResult<AdminRentSetting>>(`/admin/rent-settings?${q}`);
  },
  createRentSetting: (body: { dailyStayAdvance: number; hostelId: string | null }) =>
    authedAdmin<{ id: string }>("/admin/rent-settings", { method: "POST", body: JSON.stringify(body) }),
  deleteRentSetting: (id: string) =>
    authedAdmin<void>(`/admin/rent-settings/${id}`, { method: "DELETE" }),
};
