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
  timeoutMs?: number; // 允许调用方自定义超时时间
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
    // 支持自定义超时时间，默认延长到120分钟，避免长流程被过早中断
    const { timeoutMs, ...requestPayload } = params;
    const timeout = timeoutMs ?? 7200000;

    // 创建一个AbortController用于设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout); // 允许更长时间等待n8n完成

    const response = await fetch('/api/n8n/workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    // 清除超时定时器
    clearTimeout(timeoutId);

    // 检查HTTP响应状态码
    if (!response.ok) {
      // 处理错误状态码，包括524超时错误
      return {
        success: false,
        message: `HTTP请求失败: ${response.status} ${response.statusText}`,
        error: `${response.status} ${response.statusText}`,
        status_code: response.status
      };
    }

    // 先获取响应文本，检查是否为空
    const responseText = await response.text();
    
    // 如果响应文本为空，创建默认结果
    if (!responseText.trim()) {
      return {
        success: true,
        message: 'n8n工作流调用成功',
        data: {}
      };
    }
    
    // 尝试解析JSON响应
    const result = JSON.parse(responseText);
    // 添加状态码到结果中
    result.status_code = response.status;
    return result;
  } catch (error) {
    const isAbortError = error instanceof DOMException && error.name === 'AbortError';
    if (isAbortError) {
      console.error(`调用n8n工作流超时（已等待${(params.timeoutMs ?? 300000) / 1000}s）`);
    } else {
      console.error('调用n8n工作流时发生网络错误:', error);
    }
    return {
      success: false,
      message: isAbortError ? '调用n8n工作流超时，请稍后重试或检查n8n运行情况' : '调用n8n工作流时发生网络错误',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 生成学生个人画像的便捷方法
 * @param studentId 学生ID
 * @param webhookUrl n8n工作流Webhook URL
 * @param apiKey n8n API密钥（可选）
 * @param timeoutMs 超时时间（可选，毫秒）
 * @returns Promise<N8nWorkflowResult> 调用结果
 */
export const generateStudentProfile = async (studentId: string, webhookUrl: string, apiKey?: string, timeoutMs?: number): Promise<N8nWorkflowResult> => {
  return callN8nWorkflow({
    workflow_id: 'student-profile-generator',
    webhook_url: webhookUrl,
    params: {
      student_id: studentId
    },
    api_key: apiKey,
    timeoutMs
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
