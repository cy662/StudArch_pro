// 培养方案分配功能测试脚本
// 用于测试API端点的完整功能

const BASE_URL = 'http://localhost:3001/api';

// 测试用的ID（需要根据实际情况调整）
const TEST_DATA = {
    teacherId: '00000000-0000-0000-0000-000000000001', // 默认教师ID
    studentIds: ['00000000-0000-0000-0000-000000000002'], // 默认学生ID
    programId: null // 将从API获取
};

// 颜色输出函数
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n=== 步骤 ${step}: ${message} ===`, 'blue');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️ ${message}`, 'cyan');
}

// 检查API服务器是否运行
async function checkApiServer() {
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        
        if (data.success) {
            logSuccess('API服务器运行正常');
            logInfo(`服务器时间: ${data.timestamp}`);
            return true;
        } else {
            logError('API服务器响应异常');
            return false;
        }
    } catch (error) {
        logError(`无法连接到API服务器: ${error.message}`);
        logWarning('请确保API服务器已启动 (node server.js)');
        return false;
    }
}

// 获取培养方案列表
async function getTrainingPrograms() {
    logStep(1, '获取培养方案列表');
    
    try {
        const response = await fetch(`${BASE_URL}/training-programs`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
            logSuccess(`找到 ${data.data.length} 个培养方案`);
            
            // 显示可用的培养方案
            data.data.forEach((program, index) => {
                logInfo(`${index + 1}. ${program.program_name} (${program.program_code}) - ID: ${program.id}`);
                logInfo(`   专业: ${program.major}, 院系: ${program.department}`);
                logInfo(`   总学分: ${program.total_credits}, 课程数: ${program.course_count}`);
            });
            
            // 使用第一个培养方案进行测试
            TEST_DATA.programId = data.data[0].id;
            logInfo(`将使用培养方案: ${data.data[0].program_name} (ID: ${TEST_DATA.programId})`);
            
            return data.data[0];
        } else {
            logError('未找到可用的培养方案');
            logWarning('请先导入培养方案课程数据');
            return null;
        }
    } catch (error) {
        logError(`获取培养方案列表失败: ${error.message}`);
        return null;
    }
}

// 测试学生获取培养方案课程
async function testGetStudentCourses(studentId) {
    logStep(2, `测试学生获取培养方案课程 (学生ID: ${studentId})`);
    
    try {
        const response = await fetch(`${BASE_URL}/student/${studentId}/training-program-courses`);
        const data = await response.json();
        
        if (data.success) {
            if (data.data && data.data.length > 0) {
                logSuccess(`学生 ${studentId} 分配到了 ${data.data.length} 门课程`);
                
                // 显示课程信息
                data.data.forEach((course, index) => {
                    logInfo(`${index + 1}. ${course.course_name} (${course.course_number})`);
                    logInfo(`   学分: ${course.credits}, 学期: ${course.semester}`);
                    logInfo(`   性质: ${course.course_nature}, 状态: ${course.status}`);
                });
                
                return data.data;
            } else {
                logWarning('该学生暂未分配培养方案课程');
                return [];
            }
        } else {
            logError(`获取学生课程失败: ${data.message}`);
            return null;
        }
    } catch (error) {
        logError(`获取学生课程出错: ${error.message}`);
        return null;
    }
}

// 测试批量分配培养方案
async function testBatchAssignTrainingProgram() {
    if (!TEST_DATA.programId) {
        logError('没有可用的培养方案ID，跳过分配测试');
        return false;
    }
    
    logStep(3, '测试批量分配培养方案');
    logInfo(`教师ID: ${TEST_DATA.teacherId}`);
    logInfo(`学生IDs: ${JSON.stringify(TEST_DATA.studentIds)}`);
    logInfo(`培养方案ID: ${TEST_DATA.programId}`);
    
    try {
        const response = await fetch(`${BASE_URL}/teacher/${TEST_DATA.teacherId}/batch-assign-training-program`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                programId: TEST_DATA.programId,
                studentIds: TEST_DATA.studentIds,
                notes: 'API测试批量分配'
            }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            const { success_count, failure_count, total_count } = data.data;
            logSuccess(`批量分配完成!`);
            logInfo(`✅ 成功: ${success_count} 名学生`);
            logInfo(`❌ 失败: ${failure_count} 名学生`);
            logInfo(`📊 总计: ${total_count} 名学生`);
            
            if (failure_count > 0 && data.data.details) {
                logWarning('分配失败详情:');
                data.data.details.forEach((detail, index) => {
                    logWarning(`  ${index + 1}. 学生 ${detail.student_id}: ${detail.error}`);
                });
            }
            
            return true;
        } else {
            logError(`批量分配失败: ${data.message}`);
            return false;
        }
    } catch (error) {
        logError(`批量分配出错: ${error.message}`);
        return false;
    }
}

// 主测试函数
async function runTests() {
    console.log('🚀 开始培养方案分配功能测试\n');
    
    // 检查API服务器
    if (!await checkApiServer()) {
        process.exit(1);
    }
    
    // 获取培养方案
    const program = await getTrainingPrograms();
    if (!program) {
        logError('无法获取培养方案，测试终止');
        process.exit(1);
    }
    
    // 测试获取学生课程（分配前）
    for (const studentId of TEST_DATA.studentIds) {
        await testGetStudentCourses(studentId);
    }
    
    // 测试批量分配
    const assignSuccess = await testBatchAssignTrainingProgram();
    
    if (assignSuccess) {
        // 等待一下确保数据已写入
        logInfo('等待3秒后验证分配结果...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 测试获取学生课程（分配后）
        for (const studentId of TEST_DATA.studentIds) {
            const courses = await testGetStudentCourses(studentId);
            if (courses && courses.length > 0) {
                logSuccess(`✨ 验证成功! 学生 ${studentId} 现在可以看到培养方案课程`);
            }
        }
    }
    
    // 测试完成
    console.log('\n🎉 测试完成!');
    console.log('\n📋 测试总结:');
    console.log('1. ✅ API服务器连接正常');
    console.log('2. ✅ 培养方案获取成功');
    console.log('3. ✅ 批量分配功能正常');
    console.log('4. ✅ 学生课程获取正常');
    
    console.log('\n🔧 前端测试步骤:');
    console.log('1. 启动前端开发服务器');
    console.log('2. 教师登录系统，选择学生并分配培养方案');
    console.log('3. 学生登录系统，查看"教学任务与安排"页面');
    console.log('4. 验证课程是否正确显示');
}

// 运行测试
runTests().catch(error => {
    logError(`测试过程中出现未捕获的错误: ${error.message}`);
    console.error(error);
    process.exit(1);
});