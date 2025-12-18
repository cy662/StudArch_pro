// 简单的API服务器
// 用于处理培养方案导入、图片上传等API请求

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import trainingProgramRoutes from './src/api/trainingProgramSimple.js';
import studentLearningRoutes from './src/api/studentLearning.js';
import quickFixStudentRoutes from './quick_fix_student_api.js';
import teacherTrainingProgramRoutes from './src/api/teacherTrainingProgramRoutesSimple.js';

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建uploads目录（如果不存在）
const uploadsDir = join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 使用时间戳和原始文件名确保唯一性
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 创建multer实例
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.API_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API服务器运行正常',
    timestamp: new Date().toISOString()
  });
});

// 培养方案相关API
app.use('/api', trainingProgramRoutes);

// 学生学习信息相关API（只使用修复后的版本）
app.use('/api', studentLearningRoutes);

// 教师培养方案隔离API
app.use('/api', teacherTrainingProgramRoutes);

// 静态文件服务（用于前端和上传的图片）
app.use(express.static(join(__dirname, 'dist')));
app.use('/uploads', express.static(uploadsDir));

// 图片上传API端点
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '请选择要上传的图片'
    });
  }

  // 返回图片的URL
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    location: imageUrl
  });
});

// 处理前端路由 - 所有其他请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// 通用n8n工作流调用API端点
app.post('/api/n8n/workflow', async (req, res) => {
  try {
    const { workflow_id, webhook_url, params, api_key } = req.body;

    if (!webhook_url) {
      return res.status(400).json({
        success: false,
        message: '缺少n8n工作流的Webhook URL'
      });
    }

    // 构建请求头
    const headers = {
      'Content-Type': 'application/json',
    };

    // 如果提供了API密钥，添加到请求头
    if (api_key) {
      headers['x-n8n-api-key'] = api_key;
    }

    // 调用n8n工作流
    console.log('调用n8n工作流:', {
      webhook_url,
      headers,
      params: params || {}
    });
    
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params || {}),
    });

    console.log('n8n工作流响应状态:', response.status);
    console.log('n8n工作流响应头:', response.headers);

    // 处理响应
    let result;
    let responseText = '';
    
    try {
      // 获取响应文本
      responseText = await response.text();
      console.log('n8n工作流响应内容:', responseText);
      
      // 尝试解析JSON响应
      result = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      console.error('解析n8n工作流响应失败:', error, '响应文本:', responseText);
      // 如果解析失败（如空响应或非JSON响应），创建默认结果
      result = {};
    }

    if (!response.ok) {
      console.error('n8n工作流调用失败:', {
        status: response.status,
        result,
        responseText
      });
      
      return res.status(response.status).json({
        success: false,
        message: '调用n8n工作流失败',
        error: result.message || '未知错误',
        status_code: response.status,
        response_text: responseText
      });
    }

    console.log('n8n工作流调用成功，返回数据:', result);
    
    res.json({
      success: true,
      message: 'n8n工作流调用成功',
      data: result
    });
  } catch (error) {
    console.error('调用n8n工作流时发生错误:', error);
    res.status(500).json({
      success: false,
      message: '调用n8n工作流时发生内部错误',
      error: error.message
    });
  }
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 API服务器启动成功!`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🔍 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📚 培养方案API: http://localhost:${PORT}/api/training-programs`);
  console.log(`⏰ 启动时间: ${new Date().toLocaleString('zh-CN')}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});