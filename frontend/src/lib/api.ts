export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include', // httpOnly session cookie
    headers: {
      'X-Requested-With': 'golden-snitch', // CSRF guard header (verified server-side)
      ...(init.body && !(init.headers as any)?.['Content-Type']
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(init.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (res.status === 401 && !path.startsWith('/api/auth/')) {
    window.dispatchEvent(new Event('auth:expired'));
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code ?? 'ERROR',
      data?.error?.message ?? `HTTP ${res.status}`,
    );
  }

  return data as T;
}
