@echo off
echo 正在执行培养方案分配功能修复...

echo 步骤1: 执行主要修复脚本...
type fix_batch_assign_function.sql

echo.
echo 步骤2: 显示成功消息...
type show_success_message.sql

echo.
echo 请将以上两个SQL脚本分别在Supabase SQL Editor中执行。
echo 执行顺序：
echo 1. 首先执行 fix_batch_assign_function.sql 中的内容
echo 2. 然后执行 show_success_message.sql 中的内容
echo.
echo 修复完成后，培养方案分配功能应该就可以正常工作了。
pause