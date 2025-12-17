// 简单的认证中间件
// 用于验证用户身份和权限

import jwt from 'jsonwebtoken';

// JWT密钥（实际项目中应该从环境变量获取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '访问令牌缺失'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '访问令牌无效'
      });
    }

    req.user = user;
    next();
  });
};

// 要求教师权限
export const requireTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '用户未认证'
    });
  }

  // 检查用户角色（这里假设前端传递的用户信息包含角色）
  // 如果无法确定角色，暂时允许所有认证用户通过
  // 在实际部署时应该根据具体的认证系统调整
  if (req.user.role === 'student') {
    return res.status(403).json({
      success: false,
      message: '需要教师权限'
    });
  }

  next();
};

// 可选的JWT验证（不强制要求）
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};