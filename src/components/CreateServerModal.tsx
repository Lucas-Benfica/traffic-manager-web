import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Divider,
  Button,
  InputNumber,
  Space,
} from "antd";
import { MinusCircle, Plus } from "lucide-react";
import type { VirtualServer } from "../types/server";

const { Option } = Select;

interface CreateServerModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreate: (values: any) => void;
}

export const CreateServerModal: React.FC<CreateServerModalProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onCreate(values);
        form.resetFields(); // Limpa o formulário após o sucesso
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  return (
    <Modal
      title="Configurar Novo Virtual Server"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okText="Criar Servidor"
      cancelText="Cancelar"
    >
      <Form
        form={form}
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
          backends: ["10.0.0.1:80"], // Valor inicial para facilitar testes
        }}
      >
        {/* --- Seção Principal --- */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nome do VS"
              rules={[{ required: true, message: "Por favor insira um nome" }]}
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

        {/* --- Seção Backends (Lista Dinâmica) --- */}
        <Divider orientation="left" style={{ borderColor: "#d9d9d9" }}>
          Backends Pool
        </Divider>

        <Form.List name="backends">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Form.Item
                  required={false}
                  key={field.key}
                  style={{ marginBottom: 12 }}
                >
                  <Row gutter={8} align="middle">
                    <Col flex="auto">
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            message: "Insira IP:Porta ou delete este campo.",
                          },
                          {
                            pattern: /^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$/,
                            message:
                              "Formato inválido. Use IP:Porta (ex: 192.168.1.1:8080)",
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder="IP:Porta (ex: 192.168.1.50:8080)" />
                      </Form.Item>
                    </Col>
                    <Col flex="none">
                      {fields.length > 1 ? (
                        <MinusCircle
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                          style={{
                            cursor: "pointer",
                            color: "#ff4d4f",
                            fontSize: "18px",
                          }}
                        />
                      ) : null}
                    </Col>
                  </Row>
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

        {/* --- Seção Limites e Timeouts --- */}
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
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="timeout_client" label="T. Client (s)">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="timeout_server" label="T. Server (s)">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="timeout_queue" label="T. Queue (s)">
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
