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
  Activity,
  Download,
  Edit,
} from "lucide-react";

import type { VirtualServer } from "../types/server";
import { CreateServerModal } from "../components/CreateServerModal";
import { StatsDashboard } from "../components/StatsDashboard";
import {
  createVirtualServer,
  deleteVirtualServer,
  fetchVirtualServers,
  updateVirtualServer,
  updateVirtualServerStatus,
  downloadServerConfig,
} from "../services/api";

const { Header, Content } = Layout;
const { Text } = Typography;

export const VirtualServerList: React.FC = () => {
  const [data, setData] = useState<VirtualServer[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingServer, setEditingServer] = useState<VirtualServer | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();

  const getVirtualServersList = async () => {
    try {
      setLoading(true);
      const initialData = await fetchVirtualServers();
      setData(initialData || []);
    } catch (error) {
      messageApi.error("Error when searching backend servers.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVirtualServersList();
  }, []);

  // --- Controles do Modal ---
  const openCreateModal = () => {
    setEditingServer(null);
    setIsModalVisible(true);
  };

  const openEditModal = (server: VirtualServer) => {
    setEditingServer(server);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingServer(null);
  };

  // --- Actions ---
  const handleFormSubmit = async (values: any) => {
    try {
      const serverDTO = {
        name: values.name,
        port: values.port,
        mode: values.mode,
        balance: values.balance,
        backends: values.backends || [],
        maxConn: values.maxConn,
        maxQueue: values.maxQueue,
        timeouts: {
          connect: values.timeout_connect,
          client: values.timeout_client,
          server: values.timeout_server,
          queue: values.timeout_queue,
        },
      };

      if (editingServer) {
        const updatedServer = await updateVirtualServer(
          editingServer.id,
          serverDTO
        );

        setData((prev) =>
          prev.map((item) =>
            item.id === updatedServer.id ? updatedServer : item
          )
        );

        messageApi.success("Virtual Server editado com sucesso!");
      } else {
        const newServer = await createVirtualServer(serverDTO);

        setData((prev) => [newServer, ...prev]);

        messageApi.success("Virtual Server criado com sucesso!");
      }

      handleModalCancel();
    } catch (error) {
      messageApi.error(
        editingServer ? "Falha ao editar servidor." : "Falha ao criar servidor."
      );
      console.error(error);
    }
  };
  // --- Actions da Tabela ---
  const handleStatusChange = async (
    id: string,
    newStatus: VirtualServer["status"]
  ) => {
    setLoading(true);
    try {
      await updateVirtualServerStatus(id, newStatus);
      const newData = data.map((item) => {
        if (item.id === id) return { ...item, status: newStatus };
        return item;
      });
      setData(newData);
      messageApi.success(`VS atualizado para ${newStatus}`);
    } catch (error) {
      messageApi.error("Erro ao atualizar status");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id: string) => {
    modal.confirm({
      title: "Remover Virtual Server?",
      content: "Isso irá parar o tráfego imediatamente.",
      okText: "Remover",
      okType: "danger",
      cancelText: "Cancelar",
      async onOk() {
        try {
          await deleteVirtualServer(id);
          setData((prev) => prev.filter((item) => item.id !== id));
          messageApi.success("Virtual Server removido.");
        } catch (error) {
          messageApi.error("Falha ao remover.");
        }
      },
    });
  };
  const handleDownload = async (record: VirtualServer) => {
    try {
      messageApi.open({
        key: "downloading",
        type: "loading",
        content: `Baixando config do ${record.name}...`,
      });

      await downloadServerConfig(record.id);

      messageApi.success({
        key: "downloading",
        content: "Download concluído!",
        duration: 2,
      });
    } catch (error) {
      messageApi.error({
        key: "downloading",
        content: "Erro ao baixar configuração.",
      });
    }
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
      width: 200,
      render: (status: string) => {
        const config = {
          online: { color: "success", text: "Online" },
          offline: { color: "default", text: "Offline" },
          active: { color: "success", text: "Active" },
          deactivated: { color: "default", text: "Deactivated" },
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
              <Tag
                icon={<Network size={10} style={{ marginRight: 3 }} />}
                style={{ cursor: "help" }}
              >
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
      width: 180,
      render: (_: any, record: VirtualServer) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "flex-end",
          }}
        >
          <Space size="small">
            {record.status === "offline" || record.status === "deactivated" ? (
              <Button
                type="primary"
                ghost
                size="small"
                icon={<Power size={14} />}
                onClick={() => handleStatusChange(record.id, "active")}
                loading={loading}
              >
                Ativar
              </Button>
            ) : (
              <Button
                danger
                size="small"
                icon={<Power size={14} />}
                onClick={() => handleStatusChange(record.id, "deactivated")}
                loading={loading}
              >
                Desativar
              </Button>
            )}

            <Button
              type="text"
              icon={<Trash2 size={14} />}
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Space>

          <Space size="small">
            <Button
              size="small"
              icon={<Download size={14} />}
              onClick={() => handleDownload(record)}
            >
              Baixar
            </Button>

            <Button
              type="text"
              icon={<Edit size={14} />}
              style={{ color: "#1890ff" }}
              onClick={() => {
                openEditModal(record);
              }}
            />
          </Space>
        </div>
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
          onClick={openCreateModal}
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
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        <CreateServerModal
          visible={isModalVisible}
          onCancel={handleModalCancel}
          onSubmit={handleFormSubmit}
          editingData={editingServer}
        />
      </Content>
    </Layout>
  );
};
