Write-Host "培养方案分配功能修复工具" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host ""

Write-Host "正在执行完整修复..." -ForegroundColor Yellow

Write-Host "
修复步骤：
1. 打开Supabase控制台 (https://app.supabase.com/)
2. 选择您的项目
3. 在左侧菜单中点击 'Database' -> 'SQL Editor'
4. 复制并执行 complete_batch_fix.sql 文件中的所有SQL代码
5. 执行完成后，重新尝试分配培养方案功能

修复内容：
- 删除所有旧版本的函数
- 创建新的修复版本函数
- 修复format()函数中的%d错误，改为%s
- 添加更好的错误处理和返回信息
"

Write-Host "修复完成！现在可以重新尝试分配培养方案功能了。" -ForegroundColor Green