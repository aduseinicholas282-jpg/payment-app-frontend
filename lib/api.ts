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
  createdAt: string;
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

export function getMyTransactions(token: string) {
  return request<{ payments: Payment[]; total: number }>(
    "/api/payments/my-transactions",
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
