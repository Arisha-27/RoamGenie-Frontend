// src/lib/api.ts

// ---------------------------------------------
// BASE URL
// ---------------------------------------------
export const API_BASE =
  import.meta.env.VITE_API_BASE || "https://roamgenie-backend.onrender.com";
// ---------------------------------------------
// POST JSON helper
// ---------------------------------------------
async function postJSON(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();

  if (!res.ok) {
    try {
      return Promise.reject(JSON.parse(text));
    } catch {
      return Promise.reject({ error: text || `HTTP ${res.status}` });
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------------------------------------------
// TYPES
// ---------------------------------------------

export interface TripLogPayload {
  user_id?: string;
  departure_city?: string;
  destination: string;
  theme?: string;
  activities?: string;
  days?: number;
  departure_date?: string | null;
  return_date?: string | null;
  budget_preference?: string;
  travel_class?: string;
}

export interface GeneratePayload {
  user_id?: string;
  departure_city: string;
  destination: string;
  days: number;
  theme?: string;
  activities?: string;
  budget_preference?: string;
  travel_class?: string;
  departure_date?: string | null;
  return_date?: string | null;
}

export interface ModifyPayload {
  user_id?: string;
  current_itinerary: string;
  modification_prompt: string;
  context?: any;
}

export interface PackagePayload {
  user_id?: string;
  itinerary: string;
  context: any;
}

export interface ContactPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  source?: string;
}

// ---------------------------------------------
// API FUNCTIONS
// ---------------------------------------------

export async function logSearch(payload: TripLogPayload) {
  return postJSON("/api/log_search", payload);
}

export async function generateItinerary(payload: GeneratePayload) {
  return postJSON("/api/generate_itinerary", payload);
}

export async function modifyItinerary(payload: ModifyPayload) {
  return postJSON("/api/modify_itinerary", payload);
}

export async function finalizePackages(payload: PackagePayload) {
  return postJSON("/api/finalize_packages", payload);
}

export async function sendContact(payload: ContactPayload) {
  return postJSON("/api/contact", payload);
}

export async function uploadPassport(file: File) {
  const form = new FormData();
  form.append("file", file, file.name);

  const res = await fetch(`${API_BASE}/api/scan_passport`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}

// ---------------------------------------------
// ADMIN AUTH
// ---------------------------------------------

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid email or password");
  }

  return res.json();
}

export async function signUp(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }

  return res.json();
}

// ---------------------------------------------
// CAMPAIGNS (NEW)
// ---------------------------------------------
export async function getCampaign(theme: string) {
  const res = await fetch(`${API_BASE}/api/campaign/${theme.toLowerCase()}`);
  return res.json();
}
