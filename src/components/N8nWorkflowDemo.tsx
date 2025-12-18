import React, { useState } from 'react';
import { Button, Input, Card, message, Spin, Form, Select } from 'antd';
import { callN8nWorkflow, generateStudentProfile } from '../services/n8nService';

const { Option } = Select;

const N8nWorkflowDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [workflowType, setWorkflowType] = useState<string>('profile');

  // 学生ID示例数据 - 使用真实有效的UUID格式
  const studentIds = [
    { value: '11111111-1111-1111-1111-111111111111', label: '测试学生1 - 2021001' },
    { value: '22222222-2222-2222-2222-222222222222', label: '测试学生2 - 2021002' },
    { value: '33333333-3333-3333-3333-333333333333', label: '测试学生3 - 2021003' },
    { value: '44444444-4444-4444-4444-444444444444', label: '测试学生4 - 2021004' },
  ];

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!webhookUrl) {
      message.error('请输入n8n工作流的Webhook URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let callResult;

      if (workflowType === 'profile') {
        // 调用学生个人画像生成工作流
        callResult = await generateStudentProfile(values.studentId, webhookUrl, apiKey);
      } else {
        // 调用通用工作流
        callResult = await callN8nWorkflow({
          workflow_id: workflowType === 'notification' ? 'notification-sender' : 'custom-workflow',
          webhook_url: webhookUrl,
          params: values,
          api_key: apiKey
        });
      }

      if (callResult.success) {
        message.success(callResult.message);
        setResult(callResult.data);
      } else {
        message.error(callResult.message);
      }
    } catch (error) {
      console.error('调用n8n工作流失败:', error);
      message.error('调用n8n工作流失败，请检查控制台日志');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="n8n工作流调用演示" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item label="工作流类型" required>
            <Select
              value={workflowType}
              onChange={setWorkflowType}
              style={{ width: '100%' }}
            >
              <Option value="profile">学生个人画像生成</Option>
              <Option value="notification">发送通知</Option>
              <Option value="custom">自定义工作流</Option>
            </Select>
          </Form.Item>

          <Form.Item label="n8n Webhook URL" required>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="例如：http://localhost:5678/webhook/your-webhook-id"
            />
          </Form.Item>

          <Form.Item label="n8n API密钥（可选）">
            <Input.Password
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="如果工作流需要认证，请输入API密钥"
            />
          </Form.Item>

          {workflowType === 'profile' && (
            <Form.Item label="学生ID" name="studentId" required>
              <Select
                placeholder="选择学生"
                style={{ width: '100%' }}
              >
                {studentIds.map(student => (
                  <Option key={student.value} value={student.value}>
                    {student.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {workflowType === 'notification' && (
            <>
              <Form.Item label="用户ID" name="userId" required>
                <Input placeholder="输入要通知的用户ID" />
              </Form.Item>
              <Form.Item label="通知消息" name="message" required>
                <Input.TextArea placeholder="输入通知内容" />
              </Form.Item>
              <Form.Item label="通知类型" name="type" required>
                <Select>
                  <Option value="email">邮件</Option>
                  <Option value="sms">短信</Option>
                  <Option value="push">推送</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {workflowType === 'custom' && (
            <Form.Item label="工作流参数（JSON格式）" name="params">
              <Input.TextArea
                placeholder='例如：{"key1": "value1", "key2": "value2"}'
                rows={4}
                style={{ fontFamily: 'monospace' }}
                onChange={(e) => {
                  form.setFieldsValue({ params: e.target.value });
                }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              调用n8n工作流
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {result && (
        <Card title="调用结果" bordered={false} style={{ marginTop: '20px' }}>
          <Spin spinning={loading}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Spin>
        </Card>
      )}

      <Card title="使用说明" bordered={false} style={{ marginTop: '20px' }}>
        <h4>1. 准备工作：</h4>
        <ul>
          <li>确保n8n服务正在运行</li>
          <li>创建n8n工作流并获取Webhook URL</li>
          <li>如果需要认证，获取n8n API密钥</li>
        </ul>

        <h4>2. 调用流程：</h4>
        <ol>
          <li>选择工作流类型</li>
          <li>输入n8n工作流的Webhook URL</li>
          <li>（可选）输入n8n API密钥</li>
          <li>填写工作流所需的参数</li>
          <li>点击"调用n8n工作流"按钮</li>
        </ol>

        <h4>3. 注意事项：</h4>
        <ul>
          <li>确保Webhook URL格式正确，例如：http://localhost:5678/webhook/your-webhook-id</li>
          <li>参数格式需与n8n工作流的期望格式一致</li>
          <li>如果调用失败，请检查n8n服务是否正常运行，以及Webhook URL是否正确</li>
        </ul>
      </Card>
    </div>
  );
};

export default N8nWorkflowDemo;
