// 测试文件用于验证修复是否生效
console.log('测试修复是否生效');

// 模拟API响应数据结构
const mockApiResponse = {
  success: true,
  message: "批量分配完成：成功 1 个，失败 0 个",
  data: {
    success_count: 1,
    failure_count: 0,
    total_count: 1,
    details: []
  }
};

// 模拟原来的解构方式（可能会导致undefined）
try {
  const { success_count, failure_count, total_count } = mockApiResponse.data;
  console.log('原解构方式:', { success_count, failure_count, total_count });
} catch (error) {
  console.log('原解构方式出错:', error);
}

// 模拟新的解构方式（更安全）
try {
  const success_count = mockApiResponse.data?.success_count ?? 0;
  const failure_count = mockApiResponse.data?.failure_count ?? 0;
  const total_count = mockApiResponse.data?.total_count ?? 0;
  console.log('新解构方式:', { success_count, failure_count, total_count });
} catch (error) {
  console.log('新解构方式出错:', error);
}

// 测试当data为null或undefined时的情况
const mockApiResponseWithoutData = {
  success: false,
  message: "错误信息"
};

try {
  const success_count = mockApiResponseWithoutData.data?.success_count ?? 0;
  const failure_count = mockApiResponseWithoutData.data?.failure_count ?? 0;
  const total_count = mockApiResponseWithoutData.data?.total_count ?? 0;
  console.log('无data时的新解构方式:', { success_count, failure_count, total_count });
} catch (error) {
  console.log('无data时的新解构方式出错:', error);
}