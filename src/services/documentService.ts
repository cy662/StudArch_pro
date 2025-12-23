import { supabase } from '../lib/supabase'

export interface Document {
  id: string
  user_id: string
  title: string
  description?: string
  // 学生自定义的文件夹名称，用于归类文件
  folder_name?: string | null
  file_name: string
  file_path: string
  file_size: number
  file_type: string
  mime_type?: string
  document_type: 'transcript' | 'certificate' | 'graduation' | 'award' | 'other'
  status: 'active' | 'deleted'
  tags: string[]
  is_public: boolean
  download_count: number
  created_at: string
  updated_at: string
  // 添加文件内容相关字段
  file_content?: ArrayBuffer | null
  file_hash?: string
}

export interface DocumentSearchParams {
  document_type?: string
  keyword?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface UploadResult {
  document: Document
  success: boolean
  error?: string
}

export class DocumentService {
  // 截断文件类型以确保不超过数据库字段限制
  private static truncateFileType(fileType: string): string {
    const maxLength = 50
    if (fileType.length <= maxLength) {
      return fileType
    }
    return fileType.substring(0, maxLength)
  }

  // 获取用户文档列表
  static async getUserDocuments(
    userId: string,
    params: DocumentSearchParams = {}
  ): Promise<DocumentListResponse> {
    try {
      const {
        document_type,
        date_from,
        date_to,
        page = 1,
        limit = 10
      } = params

      // 直接从 student_documents 表查询，确保包含 folder_name 等最新字段
      let query = supabase
        .from('student_documents')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      // 如果仍有其它地方传 document_type，则保留兼容
      if (document_type) {
        query = query.eq('document_type', document_type)
      }

      // 后端按时间范围初筛，前端还有一层更精细的过滤
      if (date_from) {
        query = query.gte('created_at', `${date_from}T00:00:00`)
      }
      if (date_to) {
        query = query.lte('created_at', `${date_to}T23:59:59`)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.error('获取文档列表失败:', error)
        throw new Error(`获取文档列表失败: ${error.message}`)
      }

      const documents = data || []
      const total = count ?? documents.length

      return {
        documents: documents.map((doc: any) => ({
          ...doc,
          created_at: new Date(doc.created_at).toISOString(),
          updated_at: new Date(doc.updated_at).toISOString()
        })),
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error('DocumentService.getUserDocuments error:', error)
      throw error
    }
  }

  // 读取文件为 ArrayBuffer
  private static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // 将 ArrayBuffer 转换为 base64 字符串（避免栈溢出）
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 8192; // 分块处理以避免栈溢出
    
    // 分块处理大文件
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      // 使用自定义方法避免参数过多
      for (let j = 0; j < chunk.length; j++) {
        binary += String.fromCharCode(chunk[j]);
      }
    }
    
    return btoa(binary);
  }

  // 生成安全的文件名（避免中文和特殊字符问题）
  // Supabase Storage 要求文件名只包含字母、数字、连字符、下划线和点
  private static generateSafeFileName(originalFileName: string): string {
    // 获取文件扩展名（保留原始扩展名）
    const extension = originalFileName.split('.').pop() || '';
    
    // 生成唯一标识符（时间戳 + 随机字符串）
    // 只使用字母、数字、连字符和下划线，确保完全兼容 Supabase Storage
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    
    // 使用时间戳和随机字符串生成安全的文件名
    // 格式：file_timestamp_random.extension
    const safeFileName = `file_${timestamp}_${randomStr}${extension ? '.' + extension : ''}`;
    
    return safeFileName;
  }

  // 上传文档
  static async uploadDocument(
    userId: string,
    file: File,
    title: string,
    description?: string,
    documentType: Document['document_type'] = 'other',
    tags: string[] = [],
    folderName?: string | null
  ): Promise<UploadResult> {
    try {
      // 读取文件内容为 ArrayBuffer，用于哈希计算和上传
      const fileContentArrayBuffer = await this.readFileAsArrayBuffer(file);

      // 生成文件哈希值（简化版本，实际应用中应使用SHA256）
      const fileContentBase64 = this.arrayBufferToBase64(fileContentArrayBuffer);
      const fileHash = await this.generateFileHash(fileContentBase64);

      // 保留原始文件名用于显示和下载
      const originalFileName = file.name;
      // 生成安全的存储文件名（避免中文和特殊字符问题）
      const safeFileName = this.generateSafeFileName(originalFileName);
      const filePath = `${userId}/${safeFileName}`;

      // 先将文件上传到 Supabase Storage，这样后续可以通过路径直接下载
      const { error: storageError } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || undefined
        });

      if (storageError) {
        console.error('上传到 Storage 失败:', storageError);
        return {
          document: {} as Document,
          success: false,
          error: `文件存储失败: ${storageError.message}`
        };
      }

      // 在数据库中创建文档记录，记录文件的存储路径和元数据
      const documentData = {
        user_id: userId,
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        description: description || '',
        folder_name: folderName || null,
        file_name: originalFileName, // 使用原始文件名
        file_path: filePath,
        file_size: file.size,
        file_type: this.truncateFileType(file.type.split('/')[1] || 'unknown'),
        mime_type: file.type,
        document_type: documentType,
        tags: tags,
        status: 'active',
        is_public: false,
        file_hash: fileHash
      }

      const { data: docData, error: docError } = await supabase
        .from('student_documents')
        .insert([documentData])
        .select()
        .single()

      if (docError) {
        console.error('文档记录创建失败:', docError)
        return {
          document: {} as Document,
          success: false,
          error: `文档记录创建失败: ${docError.message}`
        }
      }

      // 记录访问日志（如果失败不影响上传）
      try {
        await this.logDocumentAccess(docData.id, 'upload')
      } catch (logError) {
        console.warn('记录访问日志失败:', logError)
      }

      const document: Document = {
        ...docData,
        created_at: new Date(docData.created_at).toISOString(),
        updated_at: new Date(docData.updated_at).toISOString()
      }

      return {
        document,
        success: true
      }
    } catch (error) {
      console.error('DocumentService.uploadDocument error:', error)
      return {
        document: {} as Document,
        success: false,
        error: error instanceof Error ? error.message : '上传失败'
      }
    }
  }

  // 读取文件为 base64 字符串
  private static readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // 移除 data URL 前缀，只保留 base64 数据
        const base64Data = (reader.result as string).split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // 生成文件哈希值（简化版本）
  private static async generateFileHash(base64String: string): Promise<string> {
    // 在实际应用中，这里应该使用 crypto.subtle.digest 来生成 SHA256 哈希
    // 但由于兼容性考虑，我们使用简化的方法
    let hash = 0;
    for (let i = 0; i < base64String.length; i++) {
      const char = base64String.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString(36);
  }

  // 下载文档
  static async downloadDocument(documentId: string, userId: string): Promise<{ url: string; fileName: string }> {
    try {
      // 1. 先获取文档基础信息，确保属于当前用户
      const document = await this.getDocumentById(documentId, userId);

      if (!document.file_path) {
        throw new Error('未找到文件路径，无法下载该文件');
      }

      // 2. 尝试从 Storage 获取带签名的下载地址
      const { data: signedData, error: signedError } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(document.file_path, 60 * 10); // 10 分钟有效期

      if (signedError || !signedData?.signedUrl) {
        console.error('获取签名下载链接失败:', signedError);
        throw new Error('获取文件下载链接失败，请稍后重试');
      }

      const url = signedData.signedUrl;

      // 3. 尝试增加下载次数（如果失败不影响下载）
      try {
        await supabase.rpc('increment_download_count', {
          p_document_id: documentId
        })
      } catch (countError) {
        console.warn('增加下载次数失败:', countError)
      }

      // 4. 记录下载日志（如果失败不影响下载）
      try {
        await this.logDocumentAccess(documentId, 'download')
      } catch (logError) {
        console.warn('记录下载日志失败:', logError)
      }

      return {
        url,
        fileName: document.file_name
      }
    } catch (error) {
      console.error('DocumentService.downloadDocument error:', error)
      throw error
    }
  }

  // 获取文档预览用的签名URL（不增加下载次数）
  static async getDocumentPreviewUrl(documentId: string, userId: string): Promise<{ url: string; fileName: string; mimeType?: string }> {
    try {
      const document = await this.getDocumentById(documentId, userId)

      if (!document.file_path) {
        throw new Error('未找到文件路径，无法预览该文件')
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(document.file_path, 60 * 10) // 10 分钟有效期

      if (signedError || !signedData?.signedUrl) {
        console.error('获取预览链接失败:', signedError)
        throw new Error('获取文件预览链接失败，请稍后重试')
      }

      return {
        url: signedData.signedUrl,
        fileName: document.file_name,
        mimeType: document.mime_type || undefined
      }
    } catch (error) {
      console.error('DocumentService.getDocumentPreviewUrl error:', error)
      throw error
    }
  }

  // 批量导出原始文件
  static async batchExportOriginalFiles(userId: string): Promise<{ success: boolean; error?: string; downloadedCount?: number }> {
    try {
      // 获取用户的所有文档
      const { documents: allDocuments } = await this.getUserDocuments(userId, {
        limit: 1000 // 获取所有文档
      })

      if (allDocuments.length === 0) {
        return {
          success: false,
          error: '没有可导出的文档'
        }
      }

      let downloadedCount = 0
      let failedCount = 0

      console.log(`开始导出 ${allDocuments.length} 个原始文件`)

      // 逐个下载文件
      for (const doc of allDocuments) {
        try {
          // 直接从数据库获取文件内容
          const { data, error } = await supabase
            .rpc('get_document_content', {
              p_document_id: doc.id,
              p_user_id: userId
            })
            .single();

          if (error) {
            throw new Error(`获取文档内容失败: ${error.message}`);
          }

          if (!data || !data.file_content) {
            throw new Error('文档内容不存在');
          }

          // 将 base64 数据转换为 Blob
          try {
            // 构造完整的 data URL
            const dataUrl = `data:${data.mime_type || 'application/octet-stream'};base64,${data.file_content}`;
            
            // 将 data URL 转换为 Blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = data.file_name || doc.title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            downloadedCount++;
            
            console.log(`✅ 成功下载: ${data.file_name}`)
          } catch (conversionError) {
            console.error('文件内容转换失败:', conversionError);
            throw new Error('文件内容转换失败');
          }

          // 记录导出日志
          await this.logDocumentAccess(doc.id, 'export')
          
          // 添加延迟避免浏览器阻止多个下载
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (error) {
          console.error(`导出文件失败: ${doc.file_name}`, error)
          failedCount++
        }
      }

      const message = `导出完成！成功: ${downloadedCount} 个文件${failedCount > 0 ? `，失败: ${failedCount} 个` : ''}`
      
      return {
        success: true,
        downloadedCount,
        error: failedCount > 0 ? message : undefined
      }
    } catch (error) {
      console.error('批量导出失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  static async createZipExport(userId: string): Promise<{ success: boolean; error?: string; zipBlob?: Blob }> {
    try {
      // 动态导入 JSZip
      let JSZip;
      try {
        JSZip = (await import('jszip')).default;
      } catch (importError) {
        console.warn('JSZip导入失败:', importError);
        return {
          success: false,
          error: 'ZIP功能不可用，将使用单独下载'
        }
      }
      
      if (!JSZip) {
        return {
          success: false,
          error: 'ZIP功能不可用，将使用单独下载'
        }
      }

      // 获取用户的所有文档
      const { documents: allDocuments } = await this.getUserDocuments(userId, {
        limit: 1000
      })

      if (allDocuments.length === 0) {
        return {
          success: false,
          error: '没有可导出的文档'
        }
      }

      const zip = new JSZip()
      
      for (const doc of allDocuments) {
        try {
          // 直接从数据库获取文件内容
          const { data, error } = await supabase
            .rpc('get_document_content', {
              p_document_id: doc.id,
              p_user_id: userId
            })
            .single();

          if (error) {
            console.error(`获取文档内容失败: ${doc.file_name}`, error);
            continue;
          }

          if (!data || !data.file_content) {
            console.warn(`文档内容不存在: ${doc.file_name}`);
            // 对于没有实际文件的记录，添加信息文件
            const fileInfo = {
              title: doc.title,
              description: doc.description,
              fileName: doc.file_name,
              fileSize: doc.file_size,
              fileType: doc.file_type,
              documentType: DocumentService.getDocumentTypeName(doc.document_type),
              tags: doc.tags,
              uploadDate: doc.created_at,
              downloadCount: doc.download_count,
              note: '此文件仅记录信息，实际文件未上传'
            }
            
            zip.file(`${doc.file_name.replace(/\.[^/.]+$/, '')}_信息.json`, JSON.stringify(fileInfo, null, 2))
            console.log(`📄 添加信息文件: ${doc.file_name}`)
            
            // 记录导出日志
            await this.logDocumentAccess(doc.id, 'export')
            continue;
          }

          // 将 base64 数据转换为 Blob 并添加到 ZIP
          try {
            // 构造完整的 data URL
            const dataUrl = `data:${data.mime_type || 'application/octet-stream'};base64,${data.file_content}`;
            
            // 将 data URL 转换为 Blob
            const response = await fetch(dataUrl);
            if (response.ok) {
              const blob = await response.blob();
              zip.file(data.file_name, blob);
              console.log(`✅ 添加到ZIP: ${data.file_name}`);
              
              // 记录导出日志
              await this.logDocumentAccess(doc.id, 'export')
              continue;
            }
          } catch (conversionError) {
            console.error(`文件内容转换失败: ${doc.file_name}`, conversionError);
          }
          
          // 如果转换失败，添加信息文件
          const fileInfo = {
            title: doc.title,
            description: doc.description,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            documentType: DocumentService.getDocumentTypeName(doc.document_type),
            tags: doc.tags,
            uploadDate: doc.created_at,
            downloadCount: doc.download_count,
            note: '此文件仅记录信息，实际文件内容转换失败'
          }
          
          zip.file(`${doc.file_name.replace(/\.[^/.]+$/, '')}_信息.json`, JSON.stringify(fileInfo, null, 2))
          console.log(`📄 添加信息文件: ${doc.file_name}`)
          
          // 记录导出日志
          await this.logDocumentAccess(doc.id, 'export')
          
        } catch (error) {
          console.error(`处理文件失败: ${doc.file_name}`, error)
        }
      }

      // 生成 ZIP 文件
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      return {
        success: true,
        zipBlob
      }
    } catch (error) {
      console.error('创建ZIP失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZIP创建失败'
      }
    }
  }

  static async createZipExportByIds(
    documentIds: string[],
    userId: string
  ): Promise<{ success: boolean; error?: string; zipBlob?: Blob; downloadedCount?: number }> {
    if (!documentIds || documentIds.length === 0) {
      return { success: false, error: '没有选择要导出的文件' }
    }

    try {
      let JSZip;
      try {
        JSZip = (await import('jszip')).default;
      } catch (importError) {
        console.warn('JSZip导入失败:', importError);
        return {
          success: false,
          error: 'ZIP功能不可用'
        }
      }

      const zip = new JSZip();
      let downloadedCount = 0;

      for (const id of documentIds) {
        try {
          const doc = await this.getDocumentById(id, userId);
          if (!doc.file_path) {
            continue;
          }

          const { data: signedData, error: signedError } = await supabase.storage
            .from('student-documents')
            .createSignedUrl(doc.file_path, 60 * 10);

          if (signedError || !signedData?.signedUrl) {
            console.warn('获取签名链接失败:', signedError);
            continue;
          }

          const resp = await fetch(signedData.signedUrl);
          if (!resp.ok) {
            console.warn('下载文件失败:', doc.file_name);
            continue;
          }
          const blob = await resp.blob();
          zip.file(doc.file_name, blob);
          downloadedCount++;
        } catch (err) {
          console.warn('处理文件失败:', err);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      return { success: true, zipBlob, downloadedCount };
    } catch (error) {
      console.error('createZipExportByIds error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ZIP创建失败'
      }
    }
  }

  // 获取文档详情
  static async getDocumentById(documentId: string, userId: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error) {
        throw new Error(`获取文档详情失败: ${error.message}`)
      }

      return {
        ...data,
        created_at: new Date(data.created_at).toISOString(),
        updated_at: new Date(data.updated_at).toISOString()
      }
    } catch (error) {
      console.error('DocumentService.getDocumentById error:', error)
      throw error
    }
  }

  // 删除文档
  static async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    try {
      // 1. 获取文档信息
      const document = await this.getDocumentById(documentId, userId)

      // 2. 从数据库中软删除（标记为deleted）
      const { error: dbError } = await supabase
        .from('student_documents')
        .update({ status: 'deleted' })
        .eq('id', documentId)
        .eq('user_id', userId)

      if (dbError) {
        throw new Error(`删除文档记录失败: ${dbError.message}`)
      }

      // 3. 从Storage中删除文件
      const { error: storageError } = await supabase.storage
        .from('student-documents')
        .remove([document.file_path])

      if (storageError) {
        console.warn('删除Storage文件失败:', storageError.message)
      }

      // 4. 记录删除日志
      await this.logDocumentAccess(documentId, 'delete')

      return true
    } catch (error) {
      console.error('DocumentService.deleteDocument error:', error)
      throw error
    }
  }

  // 记录文档访问
  private static async logDocumentAccess(
    documentId: string,
    action: 'view' | 'download' | 'upload' | 'delete' | 'export'
  ): Promise<void> {
    // 当前环境中后端可能尚未创建 log_document_access 函数，
    // 为避免在控制台产生 400 报错，这里暂时不调用 RPC，仅保留扩展点。
    // 如需启用访问日志，可在 Supabase 中创建对应的存储过程后，
    // 再恢复下面的调用代码。
    return
  }

  // 获取文档统计信息
  static async getDocumentStats(userId: string): Promise<{
    total: number
    byType: Record<string, number>
    totalSize: number
    totalDownloads: number
  }> {
    try {
      const { data, error } = await supabase
        .from('student_documents')
        .select('document_type, file_size, download_count')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) {
        throw new Error(`获取统计信息失败: ${error.message}`)
      }

      const stats = {
        total: data?.length || 0,
        byType: {} as Record<string, number>,
        totalSize: 0,
        totalDownloads: 0
      }

      data?.forEach((doc: any) => {
        stats.byType[doc.document_type] = (stats.byType[doc.document_type] || 0) + 1
        stats.totalSize += doc.file_size
        stats.totalDownloads += doc.download_count
      })

      return stats
    } catch (error) {
      console.error('DocumentService.getDocumentStats error:', error)
      throw error
    }
  }

  static async batchDeleteDocuments(documentIds: string[], userId: string): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const documentId of documentIds) {
      try {
        await this.deleteDocument(documentId, userId)
        success++
      } catch (error) {
        failed++
        errors.push(error instanceof Error ? error.message : '删除失败')
      }
    }

    return { success, failed, errors }
  }

  // 获取文档类型名称映射
  static getDocumentTypeName(type: Document['document_type']): string {
    const typeNames: Record<Document['document_type'], string> = {
      transcript: '成绩单',
      certificate: '在校证明',
      graduation: '毕业证明',
      award: '获奖证明',
      other: '其他'
    }
    return typeNames[type] || '其他'
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 根据文件类型获取文档类型
  static getDocumentTypeFromFile(file: File): Document['document_type'] {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    if (['pdf'].includes(extension || '')) {
      if (file.name.includes('成绩单') || file.name.includes('transcript')) {
        return 'transcript'
      }
      if (file.name.includes('证明') || file.name.includes('certificate')) {
        return 'certificate'
      }
      if (file.name.includes('毕业') || file.name.includes('graduation')) {
        return 'graduation'
      }
      if (file.name.includes('奖') || file.name.includes('award') || file.name.includes('证书')) {
        return 'award'
      }
    }
    
    return 'other'
  }

  // 获取文件图标
  static getFileIcon(fileType: string, documentType?: Document['document_type']): string {
    const extension = fileType.toLowerCase()
    
    if (extension === 'pdf') {
      switch (documentType) {
        case 'transcript':
          return 'fas fa-file-alt'
        case 'certificate':
        case 'graduation':
          return 'fas fa-certificate'
        case 'award':
          return 'fas fa-trophy'
        default:
          return 'fas fa-file-pdf'
      }
    }
    
    if (['doc', 'docx'].includes(extension)) {
      return 'fas fa-file-word'
    }
    
    if (['xls', 'xlsx'].includes(extension)) {
      return 'fas fa-file-excel'
    }
    
    if (['ppt', 'pptx'].includes(extension)) {
      return 'fas fa-file-powerpoint'
    }
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return 'fas fa-file-image'
    }
    
    if (['zip', 'rar', '7z'].includes(extension)) {
      return 'fas fa-file-archive'
    }
    
    return 'fas fa-file-alt'
  }
}

export default DocumentService