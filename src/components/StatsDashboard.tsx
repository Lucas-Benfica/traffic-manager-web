import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import type { VirtualServer } from "../types/server";
import { Network } from "lucide-react";

interface StatsProps {
  data: VirtualServer[];
}

export const StatsDashboard: React.FC<StatsProps> = ({ data }) => {
  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card variant="borderless" size="small">
          <Statistic
            title="VS Online"
            value={data.filter((s) => s.status === "online").length}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card variant="borderless" size="small">
          <Statistic
            title="Total Backends"
            value={data.reduce((acc, curr) => acc + curr.backends.length, 0)}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card variant="borderless" size="small">
          <Statistic
            title="Conexões Ativas" // Agora sim faz sentido
            value={1245} // Valor simulado de tráfego/sockets
            prefix={<Network size={16} />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card variant="borderless" size="small">
          <Statistic title="Taxa de Transferência" value="450 MB/s" />
        </Card>
      </Col>
    </Row>
  );
};
