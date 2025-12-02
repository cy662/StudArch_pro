import { 
  RewardPunishment, 
  RewardPunishmentCreate, 
  RewardPunishmentUpdate, 
  RewardPunishmentListResponse, 
  RewardPunishmentFilters 
} from '../types/rewardPunishment';
import { RewardPunishmentApi } from '../supabase/rewardPunishmentApi';
import { supabase } from '../lib/supabase';

export class RewardPunishmentService {
  /**
   * 获取学生的奖惩列表
   */
  static async getStudentRewardPunishments(
    studentId: string, 
    filters?: RewardPunishmentFilters
  ): Promise<RewardPunishmentListResponse> {
    try {
      const result = await RewardPunishmentApi.getStudentRewardPunishments(studentId, filters);
      return {
        items: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit
      };
    } catch (error) {
      console.error('获取奖惩列表失败:', error);
      // 返回空结果而不是抛出错误，保持界面稳定
      return {
        items: [],
        total: 0,
        page: filters?.page || 1,
        limit: filters?.limit || 10
      };
    }
  }

  /**
   * 创建奖惩记录
   */
  static async createRewardPunishment(
    data: RewardPunishmentCreate
  ): Promise<RewardPunishment> {
    try {
      return await RewardPunishmentApi.createRewardPunishment(data);
    } catch (error) {
      console.error('创建奖惩记录失败:', error);
      throw new Error(`创建奖惩记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 更新奖惩记录
   */
  static async updateRewardPunishment(
    id: string, 
    data: RewardPunishmentUpdate
  ): Promise<RewardPunishment> {
    try {
      return await RewardPunishmentApi.updateRewardPunishment(id, data);
    } catch (error) {
      console.error('更新奖惩记录失败:', error);
      throw new Error(`更新奖惩记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 删除奖惩记录
   */
  static async deleteRewardPunishment(id: string): Promise<void> {
    try {
      await RewardPunishmentApi.deleteRewardPunishment(id);
    } catch (error) {
      console.error('删除奖惩记录失败:', error);
      throw new Error(`删除奖惩记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 审核奖惩记录
   */
  static async reviewRewardPunishment(
    id: string, 
    status: 'approved' | 'rejected', 
    reviewerId: string,
    reviewComment?: string
  ): Promise<RewardPunishment> {
    try {
      return await RewardPunishmentApi.reviewRewardPunishment(id, status, reviewerId, reviewComment);
    } catch (error) {
      console.error('审核奖惩记录失败:', error);
      throw new Error(`审核奖惩记录失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取单个奖惩记录详情
   */
  static async getRewardPunishment(id: string): Promise<RewardPunishment> {
    try {
      return await RewardPunishmentApi.getRewardPunishment(id);
    } catch (error) {
      console.error('获取奖惩记录详情失败:', error);
      throw new Error(`获取奖惩记录详情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取奖惩统计信息
   */
  static async getRewardPunishmentStats(studentId: string): Promise<{
    total_rewards: number;
    total_punishments: number;
    recent_count: number;
  }> {
    try {
      return await RewardPunishmentApi.getRewardPunishmentStats(studentId);
    } catch (error) {
      console.error('获取奖惩统计失败:', error);
      // 返回默认值而不是抛出错误
      return {
        total_rewards: 0,
        total_punishments: 0,
        recent_count: 0
      };
    }
  }

  /**
   * 批量获取学生的奖惩记录
   */
  static async getBatchStudentRewardPunishments(
    studentIds: string[]
  ): Promise<Record<string, RewardPunishment[]>> {
    try {
      return await RewardPunishmentApi.getBatchStudentRewardPunishments(studentIds);
    } catch (error) {
      console.error('批量获取奖惩记录失败:', error);
      const result: Record<string, RewardPunishment[]> = {};
      studentIds.forEach(id => {
        result[id] = [];
      });
      return result;
    }
  }

  /**
   * 获取教师管理学生的获奖统计信息
   */
  static async getTeacherRewardStats(teacherId: string): Promise<{ rewardedStudentCount: number }> {
    try {
      // 获取教师管理的学生中，有奖励记录且状态为approved的学生数量
      const { count, error } = await supabase
        .from('reward_punishments')
        .select('student_id', { count: 'exact', head: true })
        .eq('record_type', 'reward') // 只统计奖励
        .eq('status', 'approved') // 只统计已通过的
        .in('student_id', supabase.from('teacher_students').select('student_id').eq('teacher_id', teacherId));

      if (error) {
        console.error('获取教师奖励统计失败:', error);
        return { rewardedStudentCount: 0 };
      }

      return {
        rewardedStudentCount: count || 0
      };
    } catch (error) {
      console.error('获取教师奖励统计异常:', error);
      return { rewardedStudentCount: 0 };
    }
  }



  /**
   * 检查数据库连接
   */
  static async checkConnection(): Promise<boolean> {
    try {
      return await RewardPunishmentApi.checkConnection();
    } catch (error) {
      console.error('数据库连接检查失败:', error);
      return false;
    }
  }
}