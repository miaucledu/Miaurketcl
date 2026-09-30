const API = import.meta.env.VITE_API_URL || "http://localhost:3003";

export async function apiCall(method, url, token, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${url}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || "Error");
  return data;
}
