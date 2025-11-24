export interface VirtualServer {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'maintenance' | 'active' | 'deactivated';
  
  // Configurações de Rede
  port: 80 | 443;
  mode: 'http' | 'https';
  balance: 'roundrobin' | 'cookie';
  
  // Pool de Backends
  backends: string[]; 

  // Limites
  maxConn: number;
  maxQueue: number;

  // Timeouts
  timeouts: {
    connect: number;
    client: number;
    server: number;
    queue: number;
  };
}