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

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
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

  async saveLayout(
    name: string,
    objects: WorkspaceObject[]
  ): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>("/api/layouts", {
      method: "POST",
      body: JSON.stringify({ name, objects }),
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
}

export const api = new ApiService();
