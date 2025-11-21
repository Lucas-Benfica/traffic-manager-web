import type { VirtualServer } from "../types/server";

export const getInitialServers = (): VirtualServer[] => {
  return [
    {
      id: "1",
      name: "App-Cluster-Main",
      status: "online",
      port: 443,
      mode: "https",
      balance: "roundrobin",
      backends: ["10.0.1.5:8080", "10.0.1.6:8080"],
      maxConn: 5000,
      maxQueue: 200,
      timeouts: { connect: 5, client: 30, server: 30, queue: 30 },
    },
    {
      id: "2",
      name: "Legacy-System-Proxy",
      status: "offline",
      port: 80,
      mode: "http",
      balance: "cookie",
      backends: ["192.168.0.10:80"],
      maxConn: 50,
      maxQueue: 50,
      timeouts: { connect: 10, client: 60, server: 60, queue: 10 },
    },
    // ...
  ];
};
