# 学生自定义课程 API 接口规范

## 概述
本文档定义了学生自定义课程管理的后端API接口规范，包含添加自定义课程、获取自定义课程列表等功能。

## 基础配置

### 认证方式
- **认证类型**: JWT (JSON Web Token)
- **请求头**: `Authorization: Bearer {token}`
- **Token获取**: 通过登录接口获取

### 响应格式
```json
{
    "success": true,
    "code": 200,
    "message": "操作成功",
    "data": {},
    "timestamp": "2024-01-12T10:00:00Z"
}
```

### 错误码说明
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## API 接口详情

### 1. 自定义课程接口

#### 1.1 添加自定义课程
```http
POST /api/add-custom-course
```
**请求参数:**
```json
{
    "student_profile_id": "string",
    "course_code": "string",
    "course_name": "string",
    "credits": 1,
    "course_nature": "必修课|选修课",
    "teacher": "string",
    "description": "string",
    "semester": "string"
}
```

**响应:**
```json
{
    "success": true,
    "code": 201,
    "message": "自定义课程添加成功",
    "data": {
        "course_id": "uuid",
        "course_code": "string",
        "course_name": "string",
        "credits": 1,
        "course_nature": "必修课|选修课",
        "teacher": "string",
        "description": "string"
    }
}
```

#### 1.2 获取学生自定义课程列表
```http
GET /api/get-custom-courses/{student_profile_id}
```

**响应:**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "student_profile_id": "uuid",
            "course_code": "string",
            "course_name": "string",
            "credits": 1,
            "course_nature": "必修课|选修课",
            "teacher": "string",
            "description": "string",
            "semester": "string",
            "status": "pending|in_progress|completed",
            "created_at": "timestamp",
            "updated_at": "timestamp"
        }
    ]
}
```

## 权限控制

### 角色权限矩阵

| 权限功能 | 学生 | 教师 | 超级管理员 |
|---------|------|------|-----------|
| 添加自定义课程 | ✅ 仅自己 | ❌ 不允许 | ❌ 不允许 |
| 查看自定义课程 | ✅ 仅自己 | ❌ 不允许 | ❌ 不允许 |

### 接口权限要求
- **自定义课程相关接口**: 需要 `student` 角色且只能操作自己的数据

## 数据验证规则

### 课程数据验证
- **课程名称**: 非空，1-200字符
- **课程代码**: 可选，最多20字符
- **学分**: 默认为1，数值类型
- **课程性质**: 必修课 或 选修课
- **授课教师**: 可选，最多100字符
- **课程描述**: 可选，最多文本长度
- **学期**: 可选，最多20字符
- **状态**: pending, in_progress, 或 completed

## 错误处理

### 常见错误响应

```json
// 400 - 参数错误
{
    "success": false,
    "code": 400,
    "message": "请求参数错误",
    "errors": [
        {
            "field": "course_name",
            "message": "课程名称不能为空"
        }
    ]
}

// 401 - 未授权
{
    "success": false,
    "code": 401,
    "message": "未授权访问"
}

// 403 - 权限不足
{
    "success": false,
    "code": 403,
    "message": "权限不足"
}

// 500 - 服务器错误
{
    "success": false,
    "code": 500,
    "message": "服务器内部错误"
}
```

## 安全考虑

1. **数据隔离**: 学生只能访问自己的自定义课程数据
2. **SQL注入防护**: 使用参数化查询
3. **XSS防护**: 输入数据转义
4. **CSRF防护**: 使用JWT Token
5. **速率限制**: 接口调用频率限制

## 性能优化

1. **数据库索引**: 在student_profile_id字段建立索引
2. **查询优化**: 按创建时间倒序排列
3. **缓存策略**: 频繁查询数据缓存

---
**文档版本**: v1.0  
**最后更新**: 2024-12-18  
**维护者**: 学生平台开发团队