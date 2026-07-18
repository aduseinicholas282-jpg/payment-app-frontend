const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface Payment {
  _id: string;
  email: string;
  amount: number;
  reference: string;
  status: "pending" | "success" | "failed" | "refunded";
  channel?: string;
  currency?: string;
  gatewayResponse?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  user?: { name: string; email: string } | string;
}

export interface PaginatedPayments {
  payments: Payment[];
  total: number;
  page: number;
  pages: number;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || "Something went wrong", res.status);
  }
  return data as T;
}

export { ApiError };

export function register(name: string, email: string, password: string) {
  return request<{ token: string; user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string) {
  return request<User>("/api/auth/me", {}, token);
}

export function initializePayment(
  token: string,
  email: string,
  amount: number
) {
  return request<{ authorization_url: string; access_code: string; reference: string }>(
    "/api/payments/initialize",
    { method: "POST", body: JSON.stringify({ email, amount }) },
    token
  );
}

export function getMyTransactions(token: string, status?: string, page = 1) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (page) params.set("page", String(page));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<PaginatedPayments>(
    `/api/payments/my-transactions${query}`,
    {},
    token
  );
}

export function verifyPayment(token: string, reference: string) {
  return request<{ status: string; payment: Payment }>(
    `/api/payments/verify/${reference}`,
    {},
    token
  );
}

export function getAdminTransactions(
  token: string,
  filters: { status?: string; email?: string; page?: number } = {}
) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.email) params.set("email", filters.email);
  if (filters.page) params.set("page", String(filters.page));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request<PaginatedPayments>(`/api/admin/transactions${query}`, {}, token);
}

export function refundPayment(token: string, reference: string) {
  return request<{ message: string; payment: Payment }>(
    `/api/admin/refund/${reference}`,
    { method: "POST" },
    token
  );
}

export function forgotPassword(email: string) {
  return request<{ message: string; devResetUrl?: string }>(
    "/api/auth/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) }
  );
}

export function resetPassword(token: string, password: string) {
  return request<{ message: string }>(`/api/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export interface Stats {
  totalPaid: number;
  totalTransactions: number;
  byStatus: { pending: number; success: number; failed: number; refunded: number };
  successRate: number;
  totalUsers?: number;
}

export function getMyStats(token: string) {
  return request<Stats>("/api/payments/stats", {}, token);
}

export function getAdminStats(token: string) {
  return request<Stats>("/api/admin/stats", {}, token);
}
