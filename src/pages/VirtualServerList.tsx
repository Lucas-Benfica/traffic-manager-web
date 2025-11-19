import React, { useState, useEffect } from "react";
import {
  Layout,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Card,
  Modal,
  message,
  Badge,
  Tooltip,
} from "antd";
import {
  Power,
  Trash2,
  Network,
  Clock,
  ShieldAlert,
  Plus,
  Activity, // Adicionado o ícone do logo de volta
} from "lucide-react";

import type { VirtualServer } from "../types/server";
import { getInitialServers } from "../services/serverService";
import { CreateServerModal } from "../components/CreateServerModal";
import { StatsDashboard } from "../components/StatsDashboard";

// Trazendo de volta os componentes de Layout do Ant Design
const { Header, Content } = Layout;
const { Text } = Typography;

export const VirtualServerList: React.FC = () => {
  const [data, setData] = useState<VirtualServer[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  useEffect(() => {
    const initialData = getInitialServers();
    setData(initialData);
  }, []);

  // --- Actions ---
  const handleStatusChange = (
    key: string,
    newStatus: VirtualServer["status"]
  ) => {
    setLoading(true);
    setTimeout(() => {
      const newData = data.map((item) => {
        if (item.key === key) return { ...item, status: newStatus };
        return item;
      });
      setData(newData);
      setLoading(false);
      messageApi.success(
        `VS ${newStatus === "online" ? "Iniciado" : "Parado"} com sucesso`
      );
    }, 600);
  };

  const handleDelete = (key: string) => {
    modal.confirm({
      title: "Remover Virtual Server?",
      content: "Isso irá parar o tráfego imediatamente.",
      okText: "Remover",
      okType: "danger",
      onOk() {
        setData((prev) => prev.filter((item) => item.key !== key));
        messageApi.success("Virtual Server removido.");
      },
    });
  };

  const handleAddServer = (values: any) => {
    const newServer: VirtualServer = {
      key: Date.now().toString(),
      name: values.name,
      status: "offline",
      port: values.port,
      mode: values.mode,
      balance: values.balance,
      backends: values.backends || [],
      maxConn: values.maxConn,
      maxQueue: values.maxQueue,
      timeouts: {
        connect: `${values.timeout_connect}s`,
        client: `${values.timeout_client}s`,
        server: `${values.timeout_server}s`,
        queue: `${values.timeout_queue}s`,
      },
    };
    setData((prev) => [...prev, newServer]);
    setIsModalVisible(false);
    messageApi.success("Virtual Server configurado!");
  };

  // --- Styles ---
  const layoutStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f0f2f5",
  };

  const headerStyle: React.CSSProperties = {
    background: "#001529",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  };

  const logoStyle: React.CSSProperties = {
    color: "white",
    fontSize: "1.2rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const contentStyle: React.CSSProperties = {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  };

  // --- Columns ---
  const columns = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => {
        const config = {
          online: { color: "success", text: "Online" },
          offline: { color: "default", text: "Offline" },
          error: { color: "error", text: "Error" },
          maintenance: { color: "warning", text: "Maint." },
        }[status] || { color: "default", text: status };
        return <Badge status={config.color as any} text={config.text} />;
      },
    },
    {
      title: "Virtual Server",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: VirtualServer) => (
        <div>
          <Text strong style={{ display: "block" }}>
            {text}
          </Text>
          <Space size="small">
            <Tag color={record.mode === "https" ? "green" : "blue"}>
              {record.mode.toUpperCase()}
            </Tag>
            <Tag>:{record.port}</Tag>
            <Tooltip title={`Algoritmo: ${record.balance}`}>
              <Tag icon={<Network size={10} />} style={{ cursor: "help" }}>
                {record.balance}
              </Tag>
            </Tooltip>
          </Space>
        </div>
      ),
    },
    {
      title: "Backends Pool",
      key: "backends",
      render: (_: any, record: VirtualServer) => (
        <div style={{ maxWidth: 200 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.backends.length} Servers
          </Text>
          <ul
            style={{ paddingLeft: 15, margin: 0, fontSize: 11, color: "#666" }}
          >
            {record.backends.slice(0, 2).map((b, i) => (
              <li key={i}>{b}</li>
            ))}
            {record.backends.length > 2 && (
              <li>+{record.backends.length - 2} more...</li>
            )}
          </ul>
        </div>
      ),
    },
    {
      title: "Limites & Timeouts",
      key: "config",
      render: (_: any, record: VirtualServer) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 11 }}>
            <ShieldAlert size={10} style={{ marginRight: 4 }} />
            Conn: {record.maxConn} | Queue: {record.maxQueue}
          </Text>
          <Text style={{ fontSize: 11 }} type="secondary">
            <Clock size={10} style={{ marginRight: 4 }} />
            Server: {record.timeouts.server}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ações",
      key: "action",
      align: "right" as const,
      render: (_: any, record: VirtualServer) => (
        <Space size="small">
          {record.status === "offline" ? (
            <Button
              type="primary"
              ghost
              size="small"
              icon={<Power size={14} />}
              onClick={() => handleStatusChange(record.key, "online")}
              loading={loading}
            >
              Start
            </Button>
          ) : (
            <Button
              danger
              size="small"
              icon={<Power size={14} />}
              onClick={() => handleStatusChange(record.key, "offline")}
              loading={loading}
            >
              Stop
            </Button>
          )}
          <Button
            type="text"
            icon={<Trash2 size={14} />}
            danger
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Layout style={layoutStyle}>
      {contextHolder}
      {modalContextHolder}
      <Header style={headerStyle}>
        <div style={logoStyle}>
          <Activity size={24} color="#1890ff" />
          VS Controller
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsModalVisible(true)}
        >
          Novo Virtual Server
        </Button>
      </Header>

      <Content style={contentStyle}>
        <StatsDashboard data={data} />

        <Card title="Virtual Servers" bordered={false}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="key"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        <CreateServerModal
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onCreate={handleAddServer}
        />
      </Content>
    </Layout>
  );
};
