# 修复 n8n 画像结果未显示（前端等待或处理问题）

## 目标
- 让“学生端-个人画像分析”页在 n8n 工作流成功后稳定展示生成结果。
- 找出是前端等待时间、返回解析或显示逻辑导致未展示，并补齐交互与错误提示。

## 步骤
1. 复现与现状确认
   - 在页面点击生成按钮，观察 Network/Console：`/api/n8n/workflow` 或 webhook 请求耗时/状态/返回体。
   - 确认 n8n 是否同步返回结果，还是需要异步轮询/手动刷新。

2. 前端调用与状态流梳理
   - 检查 `[src/pages/p-student_profile_analysis/index.tsx](src/pages/p-student_profile_analysis/index.tsx)` 的 `generatePortrait`，看何时 `setAnalysisResult`、`setPortraitStatus('success')`，空响应如何处理。
   - 查看 `[src/services/n8nService.ts](src/services/n8nService.ts)` 的超时（120s）与空响应解析，确认是否会导致“成功但无数据显示”。

3. 修复方案设计（按调查结果择一/组合）
   - 若 n8n 同步返回：对照返回字段与 UI 结构；空体时给出“生成中/暂无数据”提示，不直接 success。
   - 若 n8n 异步：增加轮询/重试（如每 3-5s 调状态接口），或延长前端等待并展示进度；必要时后端暴露 runId 查询。
   - 提升交互：生成中禁用按钮；超时/错误弹窗/提示，允许重试。

4. 实施与验证
   - 修改前端逻辑（主要 `p-student_profile_analysis/index.tsx`、`n8nService.ts`；若加轮询，补充对应 service/API）。
   - 自测：正常返回能展示；模拟超时/空数据有清晰提示；确保状态从“生成中”到“成功/失败”闭环。
   - 如有测试场景，补充/更新相关用例。


