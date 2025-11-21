import axios from "axios";
import type { VirtualServer } from "../types/server";

export type CreateVirtualServerDTO = Omit<VirtualServer, 'id' | 'status'>;

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
    'Content-Type': 'application/json',
  },
});


export async function createVirtualServer(data: CreateVirtualServerDTO): Promise<VirtualServer> {
  const response = await api.post<VirtualServer>('/virtual-servers', data);
  return response.data;
}

export async function fetchVirtualServers(): Promise<VirtualServer[]> {
  const response = await api.get<VirtualServer[]>('/virtual-servers');
  return response.data;
}