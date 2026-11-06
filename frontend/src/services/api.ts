import type { OrderItem, OrderResponse, Product } from "../types";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000";

const TIMEOUT_MS = 8000;

const CONNECTION_ERROR =
  "No se pudo conectar con el servidor. Revisá que esté encendido.";
const GENERIC_ERROR = "Ocurrió un error al procesar la solicitud.";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit;

function detailToMessage(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    // FastAPI puede devolver una lista de textos (handler personalizado)
    // o una lista de objetos con la propiedad "msg" (respuesta estándar).
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return null;
      })
      .filter((message): message is string => Boolean(message));

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  return null;
}

async function errorMessageFromResponse(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (data && typeof data === "object" && "detail" in data) {
      const message = detailToMessage((data as { detail: unknown }).detail);
      if (message) {
        return message;
      }
    }
    return GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const externalSignal = options.signal;
  let timedOut = false;

  const abortFromOutside = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", abortFromOutside, { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const headers = new Headers(options.headers);
    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    let response: Response;

    try {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (error) {
      if (externalSignal?.aborted && !timedOut) {
        throw error;
      }
      throw new ApiError(CONNECTION_ERROR);
    }

    if (!response.ok) {
      throw new ApiError(
        await errorMessageFromResponse(response),
        response.status,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError(GENERIC_ERROR);
    }
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortFromOutside);
  }
}

export function getProducts(
  category?: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<Product[]>(`/api/products${query}`, { signal });
}

export function getProductById(
  id: number,
  signal?: AbortSignal,
): Promise<Product> {
  return request<Product>(`/api/products/${id}`, { signal });
}

export function createOrder(
  items: OrderItem[],
  signal?: AbortSignal,
): Promise<OrderResponse> {
  return request<OrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify({ items }),
    signal,
  });
}
