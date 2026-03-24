// 加密解密工具

import CryptoJS from 'crypto-js';
import bs58 from 'bs58';

export class CryptoUtils {
  private static readonly DEFAULT_KEY = 'moontv-default-key-2024';

  /**
   * AES 加密
   */
  static encrypt(text: string, key?: string): string {
    const encryptionKey = key || this.DEFAULT_KEY;
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
  }

  /**
   * AES 解密
   */
  static decrypt(ciphertext: string, key?: string): string {
    try {
      const encryptionKey = key || this.DEFAULT_KEY;
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * 生成随机密钥
   */
  static generateKey(length = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * SHA256 哈希
   */
  static sha256(text: string): string {
    return CryptoJS.SHA256(text).toString();
  }

  /**
   * MD5 哈希
   */
  static md5(text: string): string {
    return CryptoJS.MD5(text).toString();
  }

  /**
   * Base64 编码
   */
  static base64Encode(text: string): string {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text));
  }

  /**
   * Base64 解码
   */
  static base64Decode(encodedText: string): string {
    try {
      return CryptoJS.enc.Base64.parse(encodedText).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Base64 decode failed:', error);
      return '';
    }
  }

  /**
   * Base58 编码
   */
  static base58Encode(text: string): string {
    const bytes = CryptoJS.enc.Utf8.parse(text);
    const uint8Array = new Uint8Array(bytes.sigBytes);
    for (let i = 0; i < bytes.sigBytes; i++) {
      uint8Array[i] = (bytes.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }
    return bs58.encode(uint8Array);
  }

  /**
   * Base58 解码
   */
  static base58Decode(encodedText: string): string {
    try {
      const decoded = bs58.decode(encodedText);
      return CryptoJS.enc.Utf8.stringify(
        CryptoJS.lib.WordArray.create(decoded)
      );
    } catch (error) {
      console.error('Base58 decode failed:', error);
      return '';
    }
  }

  /**
   * 生成随机盐
   */
  static generateSalt(length = 16): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * PBKDF2 密钥派生
   */
  static pbkdf2(password: string, salt: string, iterations = 10000): string {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: iterations,
    }).toString();
  }

  /**
   * HMAC-SHA256
   */
  static hmacSha256(message: string, key: string): string {
    return CryptoJS.HmacSHA256(message, key).toString();
  }

  /**
   * 验证 HMAC
   */
  static verifyHmac(
    message: string,
    key: string,
    expectedHmac: string
  ): boolean {
    const computedHmac = this.hmacSha256(message, key);
    return (
      CryptoJS.enc.Hex.stringify(CryptoJS.enc.Hex.parse(computedHmac)) ===
      CryptoJS.enc.Hex.stringify(CryptoJS.enc.Hex.parse(expectedHmac))
    );
  }

  /**
   * 生成 UUID
   */
  static generateUUID(): string {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }

  /**
   * 简单的字符串混淆（用于客户端存储）
   */
  static obfuscate(text: string): string {
    // 简单的 XOR 混淆，不用于安全目的
    const key = this.DEFAULT_KEY;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return this.base64Encode(result);
  }

  /**
   * 解混淆字符串
   */
  static deobfuscate(obfuscatedText: string): string {
    try {
      const decoded = this.base64Decode(obfuscatedText);
      const key = this.DEFAULT_KEY;
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(
          decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch (error) {
      console.error('Deobfuscation failed:', error);
      return '';
    }
  }
}
