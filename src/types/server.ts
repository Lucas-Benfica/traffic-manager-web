export interface VirtualServer {
  key: string;
  name: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  
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
    connect: string;
    client: string;
    server: string;
    queue: string;
  };
}