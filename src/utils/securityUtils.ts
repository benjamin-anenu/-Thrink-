/**
 * Security utility functions for client-side data protection
 */

// Simple encryption for localStorage data (not for highly sensitive data)
export function encryptLocalStorage(key: string, data: any): void {
  try {
    const jsonData = JSON.stringify(data);
    const encoded = btoa(jsonData);
    localStorage.setItem(`secure_${key}`, encoded);
  } catch (error) {
    console.error('Failed to encrypt data for localStorage:', error);
    // Fallback to regular storage
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function decryptLocalStorage(key: string): any | null {
  try {
    const secureData = localStorage.getItem(`secure_${key}`);
    if (secureData) {
      const decoded = atob(secureData);
      return JSON.parse(decoded);
    }
    
    // Fallback to regular storage
    const fallbackData = localStorage.getItem(key);
    if (fallbackData) {
      return JSON.parse(fallbackData);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to decrypt data from localStorage:', error);
    return null;
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Secure session timeout check
export function checkSessionTimeout(lastActivity: Date, timeoutMinutes: number = 30): boolean {
  const now = new Date();
  const diff = now.getTime() - lastActivity.getTime();
  const diffMinutes = diff / (1000 * 60);
  return diffMinutes > timeoutMinutes;
}

// Security headers validation
export function validateSecurityHeaders(): boolean {
  // Check if running in a secure context
  if (typeof window !== 'undefined') {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }
  return true;
}

// Content Security Policy helper
export function getCSPDirectives(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' wss: https:",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; ');
}

// Rate limiting helper for client-side
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private maxRequests: number = 10, private windowMs: number = 60000) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier);
    } else {
      this.requests.clear();
    }
  }
}

// Audit logging helper
export function logSecurityEvent(event: {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    ...event
  };
  
  // In production, this would send to a security monitoring service
  console.warn('[SECURITY EVENT]', logEntry);
  
  // Store locally for debugging (remove in production)
  const existingLogs = decryptLocalStorage('security_logs') || [];
  existingLogs.push(logEntry);
  
  // Keep only last 100 entries
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  encryptLocalStorage('security_logs', existingLogs);
}
