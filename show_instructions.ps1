Write-Host "培养方案分配功能修复说明" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

Write-Host "问题原因：" -ForegroundColor Yellow
Write-Host "PostgreSQL的format()函数中使用了错误的格式化符号%d，应该使用%s。"
Write-Host ""

Write-Host "修复步骤：" -ForegroundColor Yellow
Write-Host "1. 打开Supabase控制台 (https://app.supabase.com/)"
Write-Host "2. 选择您的项目"
Write-Host "3. 在左侧菜单中点击 'Database' -> 'SQL Editor'"
Write-Host "4. 复制并执行 fix_batch_assign_function.sql 文件中的SQL代码"
Write-Host "5. 该脚本会删除旧的有问题的函数，并创建一个新的修复后的函数"
Write-Host ""

Write-Host "修复的关键改动：" -ForegroundColor Yellow
Write-Host "- 将 format('批量分配完成：成功 %d 个，失败 %d 个', success_count, failure_count)"
Write-Host "- 改为 format('批量分配完成：成功 %s 个，失败 %s 个', success_count, failure_count)"
Write-Host ""

Write-Host "执行完成后，重新尝试分配培养方案功能，应该就不会再出现错误了。" -ForegroundColor Green