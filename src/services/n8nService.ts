// n8n工作流服务
// 用于封装调用n8n工作流的API

/**
 * 调用n8n工作流的参数接口
 */
export interface N8nWorkflowParams {
  workflow_id?: string;
  webhook_url: string;
  params?: Record<string, any>;
  api_key?: string;
}

/**
 * n8n工作流调用结果接口
 */
export interface N8nWorkflowResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  status_code?: number;
}

/**
 * 调用n8n工作流
 * @param params 调用参数
 * @returns Promise<N8nWorkflowResult> 调用结果
 */
export const callN8nWorkflow = async (params: N8nWorkflowParams): Promise<N8nWorkflowResult> => {
  try {
    const response = await fetch('/api/n8n/workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('调用n8n工作流时发生网络错误:', error);
    return {
      success: false,
      message: '调用n8n工作流时发生网络错误',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 生成学生个人画像的便捷方法
 * @param studentId 学生ID
 * @param webhookUrl n8n工作流Webhook URL
 * @param apiKey n8n API密钥（可选）
 * @returns Promise<N8nWorkflowResult> 调用结果
 */
export const generateStudentProfile = async (studentId: string, webhookUrl: string, apiKey?: string): Promise<N8nWorkflowResult> => {
  return callN8nWorkflow({
    workflow_id: 'student-profile-generator',
    webhook_url: webhookUrl,
    params: {
      student_id: studentId
    },
    api_key: apiKey
  });
};

/**
 * 发送通知的便捷方法
 * @param userId 用户ID
 * @param message 通知消息
 * @param type 通知类型
 * @param webhookUrl n8n工作流Webhook URL
 * @param apiKey n8n API密钥（可选）
 * @returns Promise<N8nWorkflowResult> 调用结果
 */
export const sendNotification = async (
  userId: string,
  message: string,
  type: 'email' | 'sms' | 'push',
  webhookUrl: string,
  apiKey?: string
): Promise<N8nWorkflowResult> => {
  return callN8nWorkflow({
    workflow_id: 'notification-sender',
    webhook_url: webhookUrl,
    params: {
      user_id: userId,
      message: message,
      notification_type: type
    },
    api_key: apiKey
  });
};
