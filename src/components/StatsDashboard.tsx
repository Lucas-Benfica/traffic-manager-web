import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { Activity, Server } from "lucide-react";
import type { VirtualServer } from "../types/server";

interface StatsProps {
  data: VirtualServer[];
}

export const StatsDashboard: React.FC<StatsProps> = ({ data = [] }) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={12}>
        <Card variant="borderless" size="small">
          <Statistic
            title="VS Ativos"
            value={
              safeData.filter(
                (s) => s.status === "active" || s.status === "online"
              ).length
            }
            valueStyle={{ color: "#3f8600" }}
            prefix={<Activity size={16} />}
          />
        </Card>
      </Col>
      <Col span={12}>
        <Card variant="borderless" size="small">
          <Statistic
            title="Total Backends"
            value={safeData.reduce(
              (acc, curr) => acc + (curr.backends?.length || 0),
              0
            )}
            prefix={<Server size={16} />}
          />
        </Card>
      </Col>
    </Row>
  );
};
