
import { supabase } from '@/integrations/supabase/client';
import { EnhancedSecurityService } from './EnhancedSecurityService';

export class SecureApiService {
  /**
   * Secure database operation wrapper
   */
  static async secureQuery(
    operation: () => Promise<any>,
    operationName: string,
    resourceType: string = 'database',
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      // Validate parameters
      const validation = EnhancedSecurityService.validateDatabaseParams(params);
      if (!validation.isValid) {
        await EnhancedSecurityService.logSecurityEvent(
          `${operationName}_validation_failed`,
          'data_access',
          undefined,
          { error: validation.error, params }
        );
        throw new Error(`Parameter validation failed: ${validation.error}`);
      }

      // Log operation start
      await EnhancedSecurityService.logSecurityEvent(
        `${operationName}_started`,
        'data_access',
        undefined,
        { resourceType, sanitizedParams: validation.sanitizedValue }
      );

      // Execute operation with sanitized parameters
      const result = await operation();

      // Log successful operation
      await EnhancedSecurityService.logSecurityEvent(
        `${operationName}_completed`,
        'data_access',
        undefined,
        { resourceType, success: true }
      );

      return result;

    } catch (error: any) {
      // Log failed operation
      await EnhancedSecurityService.logSecurityEvent(
        `${operationName}_failed`,
        'data_access',
        undefined,
        { 
          resourceType, 
          error: error.message,
          params: Object.keys(params)
        }
      );

      throw error;
    }
  }

  /**
   * Secure user authentication wrapper
   */
  static async secureAuth(
    operation: () => Promise<any>,
    operationType: 'login' | 'signup' | 'logout' | 'password_reset',
    identifier?: string
  ): Promise<any> {
    const rateLimitKey = `auth_${operationType}_${identifier || 'global'}`;
    const maxAttempts = operationType === 'login' ? 5 : 3;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    try {
      // Check rate limiting
      const rateLimit = EnhancedSecurityService.checkRateLimit(
        rateLimitKey,
        maxAttempts,
        windowMs,
        true
      );

      if (!rateLimit.allowed) {
        await EnhancedSecurityService.logSecurityEvent(
          `auth_${operationType}_rate_limited`,
          'authentication',
          undefined,
          { 
            identifier,
            remainingAttempts: rateLimit.remainingAttempts,
            resetTime: rateLimit.resetTime
          }
        );
        
        throw new Error('Too many attempts. Please try again later.');
      }

      // Log authentication attempt
      await EnhancedSecurityService.logSecurityEvent(
        `auth_${operationType}_attempted`,
        'authentication',
        undefined,
        { identifier }
      );

      const result = await operation();

      // Log successful authentication
      await EnhancedSecurityService.logSecurityEvent(
        `auth_${operationType}_success`,
        'authentication',
        undefined,
        { identifier }
      );

      return result;

    } catch (error: any) {
      // Log failed authentication
      await EnhancedSecurityService.logSecurityEvent(
        `auth_${operationType}_failed`,
        'authentication',
        undefined,
        { 
          identifier,
          error: error.message
        }
      );

      throw error;
    }
  }

  /**
   * Secure file upload wrapper
   */
  static async secureFileUpload(
    file: File,
    bucket: string,
    path: string,
    workspaceId?: string
  ): Promise<any> {
    try {
      // Validate file
      const fileValidation = EnhancedSecurityService.validateFileUpload(file);
      if (!fileValidation.isValid) {
        await EnhancedSecurityService.logSecurityEvent(
          'file_upload_validation_failed',
          'data_access',
          undefined,
          { 
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            error: fileValidation.error,
            workspaceId
          }
        );
        throw new Error(`File validation failed: ${fileValidation.error}`);
      }

      // Log upload start
      await EnhancedSecurityService.logSecurityEvent(
        'file_upload_started',
        'data_access',
        undefined,
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          bucket,
          path,
          workspaceId
        }
      );

      // Perform upload
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Log successful upload
      await EnhancedSecurityService.logSecurityEvent(
        'file_upload_completed',
        'data_access',
        undefined,
        {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          bucket,
          path: data.path,
          workspaceId
        }
      );

      return data;

    } catch (error: any) {
      // Log failed upload
      await EnhancedSecurityService.logSecurityEvent(
        'file_upload_failed',
        'data_access',
        undefined,
        {
          fileName: file.name,
          error: error.message,
          bucket,
          path,
          workspaceId
        }
      );

      throw error;
    }
  }
}
