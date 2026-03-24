// 密码管理工具

import { CryptoUtils } from './crypto';

export interface PasswordHash {
  hash: string;
  salt: string;
  iterations: number;
}

export class PasswordUtils {
  private static readonly DEFAULT_ITERATIONS = 10000;
  private static readonly SALT_LENGTH = 32;

  /**
   * 哈希密码
   */
  static hashPassword(password: string, salt?: string): PasswordHash {
    const passwordSalt = salt || CryptoUtils.generateSalt(this.SALT_LENGTH);
    const hash = CryptoUtils.pbkdf2(password, passwordSalt, this.DEFAULT_ITERATIONS);

    return {
      hash,
      salt: passwordSalt,
      iterations: this.DEFAULT_ITERATIONS,
    };
  }

  /**
   * 验证密码
   */
  static verifyPassword(password: string, storedHash: PasswordHash): boolean {
    const computedHash = CryptoUtils.pbkdf2(password, storedHash.salt, storedHash.iterations);
    return computedHash === storedHash.hash;
  }

  /**
   * 生成随机密码
   */
  static generateRandomPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 验证密码强度
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // 检查长度
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('密码长度至少8位');
    }

    // 检查大写字母
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('应包含大写字母');
    }

    // 检查小写字母
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('应包含小写字母');
    }

    // 检查数字
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('应包含数字');
    }

    // 检查特殊字符
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('应包含特殊字符');
    }

    // 检查常见弱密码
    const commonPasswords = ['password', '123456', 'admin', 'root', 'qwerty'];
    if (commonPasswords.includes(password.toLowerCase())) {
      score = 0;
      feedback.push('密码过于常见');
    }

    // 检查连续字符
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('不应包含重复字符');
    }

    const isValid = score >= 3;

    return {
      isValid,
      score,
      feedback,
    };
  }

  /**
   * 生成密码重置令牌
   */
  static generateResetToken(): string {
    return CryptoUtils.generateUUID() + CryptoUtils.generateUUID();
  }

  /**
   * 加密敏感数据（用于存储）
   */
  static encryptSensitiveData(data: string): string {
    return CryptoUtils.encrypt(data, process.env.PASSWORD_ENCRYPTION_KEY || 'default-password-key');
  }

  /**
   * 解密敏感数据
   */
  static decryptSensitiveData(encryptedData: string): string {
    return CryptoUtils.decrypt(encryptedData, process.env.PASSWORD_ENCRYPTION_KEY || 'default-password-key');
  }

  /**
   * 安全比较字符串（防止时序攻击）
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * 生成密码强度指示器
   */
  static getPasswordStrengthIndicator(password: string): {
    strength: 'weak' | 'medium' | 'strong' | 'very-strong';
    color: string;
    percentage: number;
  } {
    const { score } = this.validatePasswordStrength(password);

    if (score <= 1) {
      return { strength: 'weak', color: '#ff4444', percentage: 25 };
    } else if (score <= 2) {
      return { strength: 'medium', color: '#ffaa00', percentage: 50 };
    } else if (score <= 3) {
      return { strength: 'strong', color: '#00aa44', percentage: 75 };
    } else {
      return { strength: 'very-strong', color: '#00aa44', percentage: 100 };
    }
  }
}
