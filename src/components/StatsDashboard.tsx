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
      <Col span={12}>
        <Card variant="borderless" size="small">
          <Statistic
            title="VS Ativos"
            value={data.filter((s) => s.status === "online").length}
            valueStyle={{ color: "#3f8600" }}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card variant="borderless" size="small">
          <Statistic
            title="Total Backends"
            value={data.reduce((acc, curr) => acc + curr.backends.length, 0)}
          />
        </Card>
      </Col>
    </Row>
  );
};
