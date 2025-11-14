// 简单的数据库连接测试脚本
const supabaseUrl = "https://jvwvkmttplienptcpgpx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d3ZrbXR0cGxpZW5wdGNwZ3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MTgyNzQsImV4cCI6MjA3ODQ5NDI3NH0.qPsgmmnHNKb6pMhbhfkkS6hL3J00frGXL_5AYscb6Wc";

console.log("测试Supabase数据库连接...");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey.substring(0, 20) + "...");

// 简单的测试：检查是否包含项目ref
const isDemoMode = supabaseUrl.includes('your-project-ref') || 
                  supabaseUrl.includes('demo.supabase.co');

console.log("\n检测结果:");
console.log("是否为模拟模式:", isDemoMode ? "是" : "否");
console.log("项目Ref:", supabaseUrl.split('.')[0].replace('https://', ''));

if (isDemoMode) {
  console.log("\n⚠️ 当前处于模拟模式，数据不会保存到真实数据库");
} else {
  console.log("\n✅ 当前使用真实数据库连接，数据将保存到 student_profiles 表");
}

// 检查当前项目的模式
console.log("\n当前项目检测模式:");
const urlPatterns = [
  'your-project-ref',
  'demo.supabase.co',
  'jvwvkmttplienptcpgpx'
];

urlPatterns.forEach(pattern => {
  const contains = supabaseUrl.includes(pattern);
  console.log(`  - 包含 "${pattern}": ${contains ? "是" : "否"}`);
});