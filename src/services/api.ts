import { WorkspaceObject } from "@/store/workspaceStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LayoutResponse {
  id: string;
  name: string;
  objects: WorkspaceObject[];
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...(options.headers as Record<string, string>),
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        return {
          success: false,
          error:
            error.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  // Health check
  async checkHealth(): Promise<ApiResponse> {
    return this.request("/health");
  }

  // Layouts API
  async getLayouts(): Promise<ApiResponse<LayoutResponse[]>> {
    return this.request<LayoutResponse[]>("/api/layouts");
  }

  async getLayout(id: string): Promise<ApiResponse<LayoutResponse>> {
    return this.request<LayoutResponse>(`/api/layouts/${id}`);
  }

  async getPublicLayouts(): Promise<ApiResponse<LayoutResponse[]>> {
    return this.request<LayoutResponse[]>("/api/layouts/community");
  }

  async saveLayout(
    name: string,
    objects: WorkspaceObject[],
    isPublic: boolean = false
  ): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>("/api/layouts", {
      method: "POST",
      body: JSON.stringify({ name, objects, isPublic }),
    });
  }

  async updateLayout(
    id: string,
    name: string,
    objects: WorkspaceObject[]
  ): Promise<ApiResponse> {
    return this.request(`/api/layouts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, objects }),
    });
  }

  async deleteLayout(id: string): Promise<ApiResponse> {
    return this.request(`/api/layouts/${id}`, {
      method: "DELETE",
    });
  }

  // Auth API
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(username: string, email: string, password: string): Promise<ApiResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  }

  async getMe(): Promise<ApiResponse> {
    return this.request("/api/auth/me");
  }

  // Template API
  async getTemplates(category?: string): Promise<ApiResponse> {
    const url = category && category !== 'All' ? `/api/templates?category=${category}` : '/api/templates';
    return this.request(url);
  }

  async getTemplate(id: string): Promise<ApiResponse> {
    return this.request(`/api/templates/${id}`);
  }

  async createTemplate(data: any): Promise<ApiResponse> {
    return this.request('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiService();
