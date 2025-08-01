
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blocked?: boolean;
  blockedUntil?: number;
}

export const useRateLimiting = (key: string, config: RateLimitConfig) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(config.maxAttempts);

  const checkRateLimit = useCallback((): boolean => {
    const storageKey = `rate_limit_${key}`;
    const now = Date.now();
    
    let record: AttemptRecord;
    try {
      const stored = localStorage.getItem(storageKey);
      record = stored ? JSON.parse(stored) : { count: 0, firstAttempt: now };
    } catch {
      record = { count: 0, firstAttempt: now };
    }

    // Check if currently blocked
    if (record.blocked && record.blockedUntil && now < record.blockedUntil) {
      setIsBlocked(true);
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000);
      toast.error(`Rate limited. Try again in ${remainingTime} seconds.`);
      return false;
    }

    // Reset window if expired
    if (now - record.firstAttempt > config.windowMs) {
      record = { count: 0, firstAttempt: now, blocked: false };
    }

    // Increment attempt count
    record.count++;

    // Check if limit exceeded
    if (record.count > config.maxAttempts) {
      record.blocked = true;
      record.blockedUntil = now + (config.blockDurationMs || config.windowMs);
      
      localStorage.setItem(storageKey, JSON.stringify(record));
      
      setIsBlocked(true);
      setRemainingAttempts(0);
      
      const blockDuration = Math.ceil((config.blockDurationMs || config.windowMs) / 1000);
      toast.error(`Too many attempts. Blocked for ${blockDuration} seconds.`);
      return false;
    }

    // Update storage and state
    localStorage.setItem(storageKey, JSON.stringify(record));
    setRemainingAttempts(config.maxAttempts - record.count);
    setIsBlocked(false);
    
    return true;
  }, [key, config]);

  const resetRateLimit = useCallback(() => {
    const storageKey = `rate_limit_${key}`;
    localStorage.removeItem(storageKey);
    setIsBlocked(false);
    setRemainingAttempts(config.maxAttempts);
  }, [key, config.maxAttempts]);

  return {
    checkRateLimit,
    resetRateLimit,
    isBlocked,
    remainingAttempts
  };
};
