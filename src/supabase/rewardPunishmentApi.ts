import { supabase } from '../lib/supabase';
import { RewardPunishment, RewardPunishmentCreate, RewardPunishmentUpdate, RewardPunishmentFilters } from '../types/rewardPunishment';

export class RewardPunishmentApi {
  /**
   * 获取学生的奖惩列表
   */
  static async getStudentRewardPunishments(
    studentId: string, 
    filters?: RewardPunishmentFilters
  ): Promise<{ items: RewardPunishment[], total: number, page: number, limit: number }> {
    try {
      let query = supabase
        .from('reward_punishments')
        .select('*', { count: 'exact' })
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      // 应用筛选条件
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.level) {
        query = query.eq('level', filters.level);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }

      // 分页
      const page = filters?.page || 1;
      const limit = filters?.limit || 50;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('获取奖惩列表失败:', error);
        throw new Error(`获取奖惩列表失败: ${error.message}`);
      }

      return {
        items: (data || []) as RewardPunishment[],
        total: count || 0,
        page,
        limit
      };
    } catch (error) {
      console.error('获取奖惩列表异常:', error);
      throw error;
    }
  }

  /**
   * 创建奖惩记录
   */
  static async createRewardPunishment(
    data: RewardPunishmentCreate
  ): Promise<RewardPunishment> {
    try {
      console.log('🔍 API层 - 开始创建奖惩记录...');
      console.log('📝 API层 - 输入数据:', data);
      
      // 验证必需字段
      if (!data.student_id) {
        throw new Error('学生ID不能为空');
      }
      if (!data.type) {
        throw new Error('奖惩类型不能为空');
      }
      if (!data.name) {
        throw new Error('奖惩名称不能为空');
      }
      if (!data.description) {
        throw new Error('奖惩描述不能为空');
      }
      
      console.log('✅ API层 - 数据验证通过');
      
      const { data: result, error } = await supabase
        .from('reward_punishments')
        .insert({
          student_id: data.student_id,
          type: data.type,
          name: data.name,
          level: data.level,
          category: data.category,
          description: data.description,
          date: data.date,
          created_by: data.created_by,
          status: 'approved'  // 直接设置为已审核状态
        })
        .select()
        .single();

      if (error) {
        console.error('❌ API层 - 创建奖惩记录失败:', error);
        console.error('❌ API层 - 错误详情:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`创建奖惩记录失败: ${error.message} (错误码: ${error.code})`);
      }

      if (!result) {
        throw new Error('创建奖惩记录失败: 未返回数据');
      }

      console.log('✅ API层 - 创建成功:', result);
      return result as RewardPunishment;
    } catch (error) {
      console.error('❌ API层 - 创建奖惩记录异常:', error);
      throw error;
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
      const updateData: any = { ...data, updated_at: new Date().toISOString() };

      const { data: result, error } = await supabase
        .from('reward_punishments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('更新奖惩记录失败:', error);
        throw new Error(`更新奖惩记录失败: ${error.message}`);
      }

      if (!result) {
        throw new Error('更新奖惩记录失败: 记录不存在或未返回数据');
      }

      return result as RewardPunishment;
    } catch (error) {
      console.error('更新奖惩记录异常:', error);
      throw error;
    }
  }

  /**
   * 删除奖惩记录
   */
  static async deleteRewardPunishment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reward_punishments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('删除奖惩记录失败:', error);
        throw new Error(`删除奖惩记录失败: ${error.message}`);
      }
    } catch (error) {
      console.error('删除奖惩记录异常:', error);
      throw error;
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
      const { data: result, error } = await supabase
        .from('reward_punishments')
        .update({
          status,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewComment,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('审核奖惩记录失败:', error);
        throw new Error(`审核奖惩记录失败: ${error.message}`);
      }

      if (!result) {
        throw new Error('审核奖惩记录失败: 记录不存在或未返回数据');
      }

      return result as RewardPunishment;
    } catch (error) {
      console.error('审核奖惩记录异常:', error);
      throw error;
    }
  }

  /**
   * 获取单个奖惩记录详情
   */
  static async getRewardPunishment(id: string): Promise<RewardPunishment> {
    try {
      const { data, error } = await supabase
        .from('reward_punishments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('获取奖惩记录详情失败:', error);
        throw new Error(`获取奖惩记录详情失败: ${error.message}`);
      }

      if (!data) {
        throw new Error('奖惩记录不存在');
      }

      return data as RewardPunishment;
    } catch (error) {
      console.error('获取奖惩记录详情异常:', error);
      throw error;
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
      const { data, error } = await supabase
        .from('reward_punishments')
        .select('type, date')
        .eq('student_id', studentId);

      if (error) {
        console.error('获取奖惩统计失败:', error);
        throw new Error(`获取奖惩统计失败: ${error.message}`);
      }

      const items = data || [];
      const total_rewards = items.filter(item => item.type === 'reward').length;
      const total_punishments = items.filter(item => item.type === 'punishment').length;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const recent_count = items.filter(item => new Date(item.date) >= oneYearAgo).length;

      return {
        total_rewards,
        total_punishments,
        recent_count
      };
    } catch (error) {
      console.error('获取奖惩统计异常:', error);
      throw error;
    }
  }

  /**
   * 批量获取学生的奖惩记录
   */
  static async getBatchStudentRewardPunishments(
    studentIds: string[]
  ): Promise<Record<string, RewardPunishment[]>> {
    try {
      const { data, error } = await supabase
        .from('reward_punishments')
        .select('*')
        .in('student_id', studentIds)
        .order('date', { ascending: false });

      if (error) {
        console.error('批量获取奖惩记录失败:', error);
        throw new Error(`批量获取奖惩记录失败: ${error.message}`);
      }

      const items = data || [];
      const result: Record<string, RewardPunishment[]> = {};
      
      studentIds.forEach(studentId => {
        result[studentId] = items.filter(item => item.student_id === studentId);
      });

      return result;
    } catch (error) {
      console.error('批量获取奖惩记录异常:', error);
      throw error;
    }
  }

  /**
   * 检查数据库连接
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reward_punishments')
        .select('count')
        .limit(1);

      if (error) {
        console.error('数据库连接检查失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('数据库连接检查异常:', error);
      return false;
    }
  }
}