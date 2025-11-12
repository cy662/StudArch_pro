

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface StudentProfile {
  studentId: string;
  studentName: string;
  studentGender: string;
  idCard: string;
  ethnicity: string;
  birthDate: string;
  politicalStatus: string;
  contactPhone: string;
  email: string;
  homeAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  department: string;
  major: string;
  class: string;
  enrollmentYear: string;
  academicSystem: string;
  academicStatus: string;
}

interface ChangeApplication {
  fieldName: string;
  fieldId: string;
  currentValue: string;
  newValue: string;
  reason: string;
}

const StudentProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  
  // 页面标题设置
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '个人信息维护 - 学档通';
    return () => { document.title = originalTitle; };
  }, []);

  // 表单状态
  const [profile, setProfile] = useState<StudentProfile>({
    studentId: '2021001',
    studentName: '李小明',
    studentGender: '男',
    idCard: '110101199901011234',
    ethnicity: '汉族',
    birthDate: '1999-01-01',
    politicalStatus: '共青团员',
    contactPhone: '13800138000',
    email: 'lixiaoming@example.com',
    homeAddress: '北京市朝阳区建国路100号',
    emergencyContactName: '李建国',
    emergencyContactPhone: '13900139000',
    department: '计算机学院',
    major: '计算机科学与技术',
    class: '计算机科学与技术1班',
    enrollmentYear: '2021年',
    academicSystem: '四年制',
    academicStatus: '在读'
  });

  // 弹窗状态
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeApplication, setChangeApplication] = useState<ChangeApplication>({
    fieldName: '',
    fieldId: '',
    currentValue: '',
    newValue: '',
    reason: ''
  });

  // 成功提示状态
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 处理表单输入变化
  const handleInputChange = (field: keyof StudentProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 打开修改申请弹窗
  const openChangeModal = (fieldName: string, fieldId: keyof StudentProfile) => {
    setChangeApplication({
      fieldName,
      fieldId: fieldId,
      currentValue: profile[fieldId],
      newValue: '',
      reason: ''
    });
    setShowChangeModal(true);
  };

  // 关闭弹窗
  const closeChangeModal = () => {
    setShowChangeModal(false);
    setChangeApplication({
      fieldName: '',
      fieldId: '',
      currentValue: '',
      newValue: '',
      reason: ''
    });
  };

  // 提交修改申请
  const submitChangeApplication = () => {
    const { newValue, reason } = changeApplication;
    
    if (!newValue.trim()) {
      alert('请输入新值');
      return;
    }
    
    if (!reason.trim()) {
      alert('请说明修改原因');
      return;
    }
    
    // 模拟提交申请
    closeChangeModal();
    showSuccessToastMessage('修改申请已提交，请等待辅导员审核');
  };

  // 保存修改
  const handleSave = () => {
    // 简单验证
    if (!profile.contactPhone.trim()) {
      alert('请填写联系电话');
      return;
    }
    
    if (!profile.email.trim()) {
      alert('请填写电子邮箱');
      return;
    }
    
    // 模拟保存操作
    showSuccessToastMessage('个人信息修改成功！');
  };

  // 取消修改
  const handleCancel = () => {
    if (confirm('确定要取消修改吗？未保存的更改将丢失。')) {
      // 重置表单到初始状态
      setProfile({
        studentId: '2021001',
        studentName: '李小明',
        studentGender: '男',
        idCard: '110101199901011234',
        ethnicity: '汉族',
        birthDate: '1999-01-01',
        politicalStatus: '共青团员',
        contactPhone: '13800138000',
        email: 'lixiaoming@example.com',
        homeAddress: '北京市朝阳区建国路100号',
        emergencyContactName: '李建国',
        emergencyContactPhone: '13900139000',
        department: '计算机学院',
        major: '计算机科学与技术',
        class: '计算机科学与技术1班',
        enrollmentYear: '2021年',
        academicSystem: '四年制',
        academicStatus: '在读'
      });
    }
  };

  // 显示成功提示
  const showSuccessToastMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessToast(true);
    
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      navigate('/login');
    }
  };

  // 点击弹窗背景关闭
  const handleModalBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeChangeModal();
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-border-light h-16 z-50">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo和系统名称 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-bold text-text-primary">学档通</h1>
          </div>
          
          {/* 用户信息和操作 */}
          <div className="flex items-center space-x-4">
            {/* 消息通知 */}
            <button className="relative p-2 text-text-secondary hover:text-secondary transition-colors">
              <i className="fas fa-bell text-lg"></i>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
            </button>
            
            {/* 用户信息 */}
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <img 
                src="https://s.coze.cn/image/K2rLqrUfOSs/" 
                alt="学生头像" 
                className="w-8 h-8 rounded-full" 
              />
              <div className="text-sm">
                <div className="font-medium text-text-primary">李小明</div>
                <div className="text-text-secondary">学生</div>
              </div>
              <i className="fas fa-chevron-down text-xs text-text-secondary"></i>
            </div>
            
            {/* 退出登录 */}
            <button 
              onClick={handleLogout}
              className="text-text-secondary hover:text-red-500 transition-colors"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </header>

      {/* 左侧菜单 */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-border-light z-40 ${styles.sidebarTransition}`}>
        <nav className="p-4 space-y-2">
          <Link 
            to="/student-dashboard" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-home text-lg"></i>
            <span className="font-medium">学生服务平台</span>
          </Link>
          
          <Link 
            to="/student-my-profile" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-user text-lg"></i>
            <span className="font-medium">我的档案</span>
          </Link>
          
          <Link 
            to="/student-profile-edit" 
            className={`${styles.navItem} ${styles.navItemActive} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors`}
          >
            <i className="fas fa-edit text-lg"></i>
            <span className="font-medium">个人信息维护</span>
          </Link>
          
          <Link 
            to="/student-graduation-fill" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-rocket text-lg"></i>
            <span className="font-medium">毕业去向填报</span>
          </Link>
          
          <Link 
            to="/student-document-view" 
            className={`${styles.navItem} flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-text-secondary`}
          >
            <i className="fas fa-file-alt text-lg"></i>
            <span className="font-medium">信息查看与下载</span>
          </Link>
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="ml-64 mt-16 p-6 min-h-screen">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">个人信息维护</h2>
              <nav className="text-sm text-text-secondary">
                <span>首页</span>
                <i className="fas fa-chevron-right mx-2"></i>
                <span>个人信息维护</span>
              </nav>
            </div>
          </div>
        </div>

        {/* 个人信息表单 */}
        <div className="space-y-6">
          {/* 基本信息区域 */}
          <section className={`${styles.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-user-circle text-secondary mr-2"></i>
              基本信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 学号（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="student-id" className="block text-sm font-medium text-text-primary">学号</label>
                <input 
                  type="text" 
                  id="student-id" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.studentId} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学号为系统分配，不可修改</p>
              </div>

              {/* 姓名（需申请修改） */}
              <div className="space-y-2">
                <label htmlFor="student-name" className="block text-sm font-medium text-text-primary">姓名</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    id="student-name" 
                    className={`flex-1 px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                    value={profile.studentName} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    onClick={() => openChangeModal('姓名', 'studentName')}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    申请修改
                  </button>
                </div>
                <p className="text-xs text-text-secondary">姓名修改需辅导员审核</p>
              </div>

              {/* 性别（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="student-gender" className="block text-sm font-medium text-text-primary">性别</label>
                <input 
                  type="text" 
                  id="student-gender" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.studentGender} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">性别信息不可修改</p>
              </div>

              {/* 身份证号（需申请修改） */}
              <div className="space-y-2">
                <label htmlFor="id-card" className="block text-sm font-medium text-text-primary">身份证号</label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    id="id-card" 
                    className={`flex-1 px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                    value={profile.idCard} 
                    readOnly 
                  />
                  <button 
                    type="button" 
                    onClick={() => openChangeModal('身份证号', 'idCard')}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors text-sm"
                  >
                    申请修改
                  </button>
                </div>
                <p className="text-xs text-text-secondary">身份证号修改需辅导员审核</p>
              </div>

              {/* 民族（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="ethnicity" className="block text-sm font-medium text-text-primary">民族</label>
                <input 
                  type="text" 
                  id="ethnicity" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.ethnicity} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">民族信息不可修改</p>
              </div>

              {/* 出生日期（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="birth-date" className="block text-sm font-medium text-text-primary">出生日期</label>
                <input 
                  type="date" 
                  id="birth-date" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.birthDate} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">出生日期不可修改</p>
              </div>

              {/* 政治面貌（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="political-status" className="block text-sm font-medium text-text-primary">政治面貌</label>
                <input 
                  type="text" 
                  id="political-status" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.politicalStatus} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">政治面貌信息不可修改</p>
              </div>
            </div>
          </section>

          {/* 联系方式区域 */}
          <section className={`${styles.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-phone text-secondary mr-2"></i>
              联系方式
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 联系电话（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="contact-phone" className="block text-sm font-medium text-text-primary">联系电话</label>
                <input 
                  type="tel" 
                  id="contact-phone" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.editableField} ${styles.formInputFocus}`}
                  value={profile.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                />
                <p className="text-xs text-text-secondary">请填写常用手机号码</p>
              </div>

              {/* 电子邮箱（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary">电子邮箱</label>
                <input 
                  type="email" 
                  id="email" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.editableField} ${styles.formInputFocus}`}
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <p className="text-xs text-text-secondary">用于接收重要通知</p>
              </div>

              {/* 家庭通讯地址（可直接修改） */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="home-address" className="block text-sm font-medium text-text-primary">家庭通讯地址</label>
                <textarea 
                  id="home-address" 
                  rows={3}
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.editableField} ${styles.formInputFocus} resize-none`}
                  placeholder="请输入详细家庭地址"
                  value={profile.homeAddress}
                  onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                />
                <p className="text-xs text-text-secondary">用于邮寄纸质材料</p>
              </div>
            </div>
          </section>

          {/* 紧急联系人区域 */}
          <section className={`${styles.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-exclamation-triangle text-secondary mr-2"></i>
              紧急联系人
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 紧急联系人姓名（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="emergency-contact-name" className="block text-sm font-medium text-text-primary">联系人姓名</label>
                <input 
                  type="text" 
                  id="emergency-contact-name" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.editableField} ${styles.formInputFocus}`}
                  value={profile.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                />
                <p className="text-xs text-text-secondary">建议填写直系亲属</p>
              </div>

              {/* 紧急联系人电话（可直接修改） */}
              <div className="space-y-2">
                <label htmlFor="emergency-contact-phone" className="block text-sm font-medium text-text-primary">联系人电话</label>
                <input 
                  type="tel" 
                  id="emergency-contact-phone" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.editableField} ${styles.formInputFocus}`}
                  value={profile.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                />
                <p className="text-xs text-text-secondary">确保24小时畅通</p>
              </div>
            </div>
          </section>

          {/* 学籍信息区域 */}
          <section className={`${styles.sectionCard} p-6`}>
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <i className="fas fa-graduation-cap text-secondary mr-2"></i>
              学籍信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 院系（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-medium text-text-primary">院系</label>
                <input 
                  type="text" 
                  id="department" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.department} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">院系信息不可修改</p>
              </div>

              {/* 专业（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="major" className="block text-sm font-medium text-text-primary">专业</label>
                <input 
                  type="text" 
                  id="major" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.major} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">专业信息不可修改</p>
              </div>

              {/* 班级（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="class" className="block text-sm font-medium text-text-primary">班级</label>
                <input 
                  type="text" 
                  id="class" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.class} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">班级信息不可修改</p>
              </div>

              {/* 入学年份（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="enrollment-year" className="block text-sm font-medium text-text-primary">入学年份</label>
                <input 
                  type="text" 
                  id="enrollment-year" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.enrollmentYear} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">入学年份不可修改</p>
              </div>

              {/* 学制（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-system" className="block text-sm font-medium text-text-primary">学制</label>
                <input 
                  type="text" 
                  id="academic-system" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.academicSystem} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学制信息不可修改</p>
              </div>

              {/* 学籍状态（不可修改） */}
              <div className="space-y-2">
                <label htmlFor="academic-status" className="block text-sm font-medium text-text-primary">学籍状态</label>
                <input 
                  type="text" 
                  id="academic-status" 
                  className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.readonlyField}`}
                  value={profile.academicStatus} 
                  readOnly 
                />
                <p className="text-xs text-text-secondary">学籍状态由学校统一管理</p>
              </div>
            </div>
          </section>

          {/* 操作按钮区域 */}
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-6 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
            >
              <i className="fas fa-save mr-2"></i>
              保存修改
            </button>
          </div>
        </div>
      </main>

      {/* 申请修改弹窗 */}
      {showChangeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={handleModalBackgroundClick}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">申请信息修改</h3>
                <button 
                  type="button" 
                  onClick={closeChangeModal}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="change-field" className="block text-sm font-medium text-text-primary mb-2">修改字段</label>
                  <input 
                    type="text" 
                    id="change-field" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg" 
                    value={changeApplication.fieldName}
                    readOnly 
                  />
                </div>
                
                <div>
                  <label htmlFor="current-value" className="block text-sm font-medium text-text-primary mb-2">当前值</label>
                  <input 
                    type="text" 
                    id="current-value" 
                    className="w-full px-4 py-2 border border-border-light rounded-lg" 
                    value={changeApplication.currentValue}
                    readOnly 
                  />
                </div>
                
                <div>
                  <label htmlFor="new-value" className="block text-sm font-medium text-text-primary mb-2">新值</label>
                  <input 
                    type="text" 
                    id="new-value" 
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus}`}
                    placeholder="请输入新值"
                    value={changeApplication.newValue}
                    onChange={(e) => setChangeApplication(prev => ({ ...prev, newValue: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label htmlFor="change-reason" className="block text-sm font-medium text-text-primary mb-2">修改原因</label>
                  <textarea 
                    id="change-reason" 
                    rows={3}
                    className={`w-full px-4 py-2 border border-border-light rounded-lg ${styles.formInputFocus} resize-none`}
                    placeholder="请说明修改原因"
                    value={changeApplication.reason}
                    onChange={(e) => setChangeApplication(prev => ({ ...prev, reason: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={closeChangeModal}
                  className="px-4 py-2 border border-border-light text-text-secondary rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="button" 
                  onClick={submitChangeApplication}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      <div className={`fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-300 z-50 ${showSuccessToast ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center">
          <i className="fas fa-check-circle mr-2"></i>
          <span>{successMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileEdit;

