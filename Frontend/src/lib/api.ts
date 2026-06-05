import axios, { type AxiosInstance } from "axios";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import type { WhatsAppSSEEvent } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: API_URL,
});

export const useApi = () => {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const instance: AxiosInstance = axios.create({ baseURL: API_URL });
    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, [getToken]);

  return { client, getToken };
};

export async function streamWhatsAppQR(
  token: string,
  onEvent: (event: WhatsAppSSEEvent) => void,
  signal: AbortSignal
) {
  const response = await fetch(`${API_URL}/whatsapp/qr`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `WhatsApp connection failed (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response stream");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          onEvent(JSON.parse(line.slice(6)) as WhatsAppSSEEvent);
        } catch {
          // ignore malformed SSE payloads
        }
      }
    }
  }
}
