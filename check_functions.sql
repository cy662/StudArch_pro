-- 检查是否存在重复的函数
SELECT 
    proname AS function_name,
    pg_get_function_identity_arguments(oid) AS argument_types,
    pg_get_function_result(oid) AS return_type
FROM pg_proc 
WHERE proname = 'batch_assign_training_program_to_teacher_students'
ORDER BY proname;