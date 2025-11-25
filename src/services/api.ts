import axios from "axios";
import type { VirtualServer } from "../types/server";

export type CreateVirtualServerDTO = Omit<VirtualServer, "id" | "status">;

const getBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    return apiUrl;
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
  const response = await api.post<UpdateStatusResponse>(
    "/virtual-servers",
    data
  );
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
  const response = await api.patch<UpdateStatusResponse>(
    `/virtual-servers/${id}/status`,
    { status }
  );
  return response.data.virtualServer;
}

export async function deleteVirtualServer(id: string): Promise<void> {
  await api.delete(`/virtual-servers/${id}`);
}

export async function updateVirtualServer(
  id: string,
  data: Partial<CreateVirtualServerDTO>
): Promise<VirtualServer> {
  const response = await api.patch<UpdateStatusResponse>(
    `/virtual-servers/${id}`,
    data
  );
  return response.data.virtualServer;
}

// export async function downloadServerConfig(id: string): Promise<void> {
//   try {
//     const response = await api.get(`/virtual-servers/${id}/config`, {
//       responseType: "blob",
//     });

//     // Tenta extrair o nome do arquivo do Header que o Backend enviou
//     const disposition = response.headers["content-disposition"];
//     let filename = "server-config.txt"; // Fallback caso falhe

//     if (disposition && disposition.indexOf("attachment") !== -1) {
//       const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
//       const matches = filenameRegex.exec(disposition);
//       if (matches != null && matches[1]) {
//         filename = matches[1].replace(/['"]/g, "");
//       }
//     }

//     // Cria o link de download no navegador
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", filename);

//     document.body.appendChild(link);
//     link.click();

//     // Limpeza de memória
//     link.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (error) {
//     console.error("Download failed", error);
//     throw error;
//   }
// }
export async function downloadServerConfig(id: string): Promise<void> {
  try {
    await api.get(`/virtual-servers/${id}/config`);
  } catch (error) {
    console.error("Failed to generate config on server", error);
    throw error;
  }
}
