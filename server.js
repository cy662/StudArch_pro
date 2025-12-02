// 简单的API服务器
// 用于处理培养方案导入等API请求

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import trainingProgramRoutes from './src/api/trainingProgramSimple.js';
import studentLearningRoutes from './src/api/studentLearning.js';
import quickFixStudentRoutes from './quick_fix_student_api.js';

// 获取当前目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// 静态文件服务（用于前端）
app.use(express.static(join(__dirname, 'dist')));

// 处理前端路由 - 所有其他请求都返回index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
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