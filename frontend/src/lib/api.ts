const API_BASE = "/api/v1";

interface ApiError {
  code: string;
  message: string;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  }

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      this.setTokens(json.data.access_token, json.data.refresh_token);
      return true;
    } catch {
      return false;
    }
  }

  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        res = await fetch(`${API_BASE}${path}`, { ...options, headers });
      } else {
        this.clearTokens();
        window.location.href = "/login";
        return { error: { code: "unauthorized", message: "Session expired" } };
      }
    }

    const json = await res.json();

    if (!res.ok) {
      return {
        error: json.detail ?? { code: "unknown", message: "Something went wrong" },
      };
    }

    return { data: json.data };
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  patch<T>(path: string, body: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
