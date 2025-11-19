import React, { useState } from "react";
import {
  Layout,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
  InputNumber,
  Divider,
  List,
} from "antd";
import {
  Server,
  Power,
  RotateCw,
  Trash2,
  Plus,
  Activity,
  Network,
  Clock,
  ShieldAlert,
  MinusCircle,
} from "lucide-react";

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

// --- Types ---

// Interface baseada na sua nova estrutura
interface VirtualServer {
  key: string;
  name: string;
  status: "online" | "offline" | "error" | "maintenance";

  // Configurações de Rede e Balanço
  port: 80 | 443;
  mode: "http" | "https";
  balance: "roundrobin" | "cookie";

  // Pool de Backends (lista de servidores alvo)
  backends: string[];

  // Limites
  maxConn: number;
  maxQueue: number;

  // Timeouts (string para permitir '5s', '30s' ou number se preferir ms)
  timeouts: {
    connect: string;
    client: string;
    server: string;
    queue: string;
  };
}

// --- Mock Data Inicial ---

const initialData: VirtualServer[] = [
  {
    key: "1",
    name: "App-Cluster-Main",
    status: "online",
    port: 443,
    mode: "https",
    balance: "roundrobin",
    backends: ["10.0.1.5:8080", "10.0.1.6:8080"],
    maxConn: 5000,
    maxQueue: 200,
    timeouts: { connect: "5s", client: "30s", server: "30s", queue: "30s" },
  },
  {
    key: "2",
    name: "Legacy-System-Proxy",
    status: "offline",
    port: 80,
    mode: "http",
    balance: "cookie",
    backends: ["192.168.0.10:80"],
    maxConn: 50,
    maxQueue: 50,
    timeouts: { connect: "10s", client: "60s", server: "60s", queue: "10s" },
  },
];

// --- Componente Principal ---

export default function App() {
  const [data, setData] = useState<VirtualServer[]>(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // --- Actions Logic ---

  const handleStatusChange = (
    key: string,
    newStatus: VirtualServer["status"]
  ) => {
    setLoading(true);
    setTimeout(() => {
      const newData = data.map((item) => {
        if (item.key === key) {
          return { ...item, status: newStatus };
        }
        return item;
      });
      setData(newData);
      setLoading(false);
      message.success(
        `VS ${newStatus === "online" ? "Iniciado" : "Parado"} com sucesso`
      );
    }, 600);
  };

  const handleDelete = (key: string) => {
    Modal.confirm({
      title: "Remover Virtual Server?",
      content: "Isso irá parar o tráfego para os backends associados.",
      okText: "Remover",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        setData(data.filter((item) => item.key !== key));
        message.success("Virtual Server removido.");
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
      backends: values.backends || [], // Lista de backends
      maxConn: values.maxConn,
      maxQueue: values.maxQueue,
      timeouts: {
        connect: `${values.timeout_connect}s`,
        client: `${values.timeout_client}s`,
        server: `${values.timeout_server}s`,
        queue: `${values.timeout_queue}s`,
      },
    };

    setData([...data, newServer]);
    setIsModalVisible(false);
    form.resetFields();
    message.success("Virtual Server configurado!");
  };

  // --- Table Columns ---

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
            <Tag icon={<Network size={10} />}>{record.balance}</Tag>
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
            <ShieldAlert size={10} /> Conn: {record.maxConn} | Queue:{" "}
            {record.maxQueue}
          </Text>
          <Text style={{ fontSize: 11 }} type="secondary">
            <Clock size={10} /> Server: {record.timeouts.server}
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

  return (
    <Layout style={layoutStyle}>
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
        {/* Stats Dashboard */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="VS Online"
                value={data.filter((s) => s.status === "online").length}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} size="small">
              <Statistic
                title="Total Backends"
                value={data.reduce(
                  (acc, curr) => acc + curr.backends.length,
                  0
                )}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} size="small">
              <Statistic title="Active Conn (Simulated)" value={1245} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} size="small">
              <Statistic title="Throughput" value="450 MB/s" />
            </Card>
          </Col>
        </Row>

        {/* Main Table */}
        <Card title="Virtual Servers" bordered={false}>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="key"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Content>

      {/* Modal de Criação Complexo */}
      <Modal
        title="Configurar Novo Virtual Server"
        open={isModalVisible}
        onOk={form.submit}
        onCancel={() => setIsModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          onFinish={handleAddServer}
          layout="vertical"
          initialValues={{
            port: 80,
            mode: "http",
            balance: "roundrobin",
            maxConn: 50,
            maxQueue: 200,
            timeout_connect: 5,
            timeout_client: 30,
            timeout_server: 30,
            timeout_queue: 30,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nome do VS"
                rules={[{ required: true }]}
              >
                <Input placeholder="ex: Payment-Gateway" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="port" label="Porta">
                <Select>
                  <Option value={80}>80</Option>
                  <Option value={443}>443</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="mode" label="Modo">
                <Select>
                  <Option value="http">HTTP</Option>
                  <Option value="https">HTTPS</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="balance" label="Algoritmo de Balanceamento">
            <Select>
              <Option value="roundrobin">Round Robin (Cíclico)</Option>
              <Option value="cookie">Cookie Based (Sessão)</Option>
            </Select>
          </Form.Item>

          <Divider orientation="left" style={{ borderColor: "#d9d9d9" }}>
            Backends Pool
          </Divider>

          <Form.List name="backends" initialValue={["10.0.0.1:80"]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item required={false} key={field.key}>
                    <Form.Item
                      {...field}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          message: "Insira IP:Porta ou delete este campo.",
                        },
                      ]}
                      noStyle
                    >
                      <Input
                        placeholder="IP:Porta (ex: 192.168.1.50:8080)"
                        style={{ width: "90%" }}
                      />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <MinusCircle
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                        style={{
                          marginLeft: 10,
                          cursor: "pointer",
                          color: "red",
                        }}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<Plus size={14} />}
                    block
                  >
                    Adicionar Backend Server
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left" style={{ borderColor: "#d9d9d9" }}>
            Limites & Timeouts
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maxConn" label="Max Connections">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxQueue" label="Max Queue">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="timeout_connect" label="T. Connect (s)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="timeout_client" label="T. Client (s)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="timeout_server" label="T. Server (s)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="timeout_queue" label="T. Queue (s)">
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
}
