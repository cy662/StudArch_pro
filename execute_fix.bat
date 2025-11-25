@echo off
echo 正在执行教师学生管理功能修复...
echo.

REM 切换到项目目录
cd /d D:\workspace\PBL2\StudArch\StudArch

REM 执行SQL修复脚本
echo 正在应用数据库修复...
npx supabase-cli@latest db reset --db-url postgresql://postgres:postgres@localhost:5432/postgres < complete_teacher_student_fix.sql

if %errorlevel% == 0 (
    echo.
    echo ✅ 数据库修复成功完成!
    echo.
    echo 请重启您的开发服务器以使更改生效。
) else (
    echo.
    echo ❌ 数据库修复过程中出现错误。
    echo 请检查错误信息并确保Supabase CLI已正确安装。
)

echo.
pause