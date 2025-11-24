import axios from "axios";
import type { VirtualServer } from "../types/server";

export type CreateVirtualServerDTO = Omit<VirtualServer, "id" | "status">;

const getBaseUrl = (): string => {
  const devUrl = import.meta.env.VITE_API_URL;
  const devMode = import.meta.env.MODE;

  if (devMode === "development" && devUrl) {
    return devUrl;
  }

  return window.location.origin;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export async function createVirtualServer(
  data: CreateVirtualServerDTO
): Promise<VirtualServer> {
  const response = await api.post<UpdateStatusResponse>("/virtual-servers", data);
  return response.data.virtualServer;
}

export async function fetchVirtualServers(): Promise<VirtualServer[]> {
  const response = await api.get<VirtualServer[]>("/virtual-servers");
  return response.data;
}

interface UpdateStatusResponse {
  virtualServer: VirtualServer;
}
export async function updateVirtualServerStatus(
  id: string,
  status: VirtualServer["status"]
): Promise<VirtualServer> {
  const response = await api.patch<UpdateStatusResponse>(`/virtual-servers/${id}/status`, { status });
  return response.data.virtualServer;
}

export async function deleteVirtualServer(id: string): Promise<void> {
  await api.delete(`/virtual-servers/${id}`);
}

export async function updateVirtualServer(
  id: string,
  data: Partial<CreateVirtualServerDTO>
): Promise<VirtualServer> {
  const response = await api.patch<UpdateStatusResponse>(`/virtual-servers/${id}`, data);
  return response.data.virtualServer;
}