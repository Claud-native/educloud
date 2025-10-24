import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js';

// Clave pública RSA del backend - OBLIGATORIA desde variables de entorno
const PUBLIC_KEY = import.meta.env.VITE_RSA_PUBLIC_KEY;

if (!PUBLIC_KEY) {
  throw new Error(
    '🔒 FALTA CONFIGURACIÓN DE SEGURIDAD: ' +
    'La variable VITE_RSA_PUBLIC_KEY no está configurada. ' +
    'Crea un archivo .env con la clave pública RSA del backend.'
  );
}

// Clave para cifrado simétrico AES - OBLIGATORIA desde variables de entorno
const AES_SECRET_KEY = import.meta.env.VITE_AES_SECRET_KEY;

if (!AES_SECRET_KEY) {
  throw new Error(
    '🔒 FALTA CONFIGURACIÓN DE SEGURIDAD: ' +
    'La variable VITE_AES_SECRET_KEY no está configurada. ' +
    'Crea un archivo .env con una clave secreta AES.'
  );
}

/**
 * Servicio de cifrado para el frontend
 */
export class CryptoService {
  private encrypt: JSEncrypt;

  constructor() {
    this.encrypt = new JSEncrypt();
    this.encrypt.setPublicKey(PUBLIC_KEY);
  }

  /**
   * Cifra una contraseña usando RSA con la clave pública
   * @param password - Contraseña en texto plano
   * @returns Contraseña cifrada en base64
   */
  encryptPassword(password: string): string {
    try {
      const encrypted = this.encrypt.encrypt(password);
      if (!encrypted) {
        throw new Error('Error al cifrar la contraseña');
      }
      return encrypted;
    } catch (error) {
      console.error('Error en encryptPassword:', error);
      throw error;
    }
  }

  /**
   * Genera un hash SHA-256 de un texto
   * Útil para verificaciones adicionales
   * @param text - Texto a hashear
   * @returns Hash en formato hexadecimal
   */
  generateHash(text: string): string {
    return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
  }

  /**
   * Cifra datos sensibles con AES (cifrado simétrico)
   * Útil para almacenamiento local temporal
   * @param data - Datos a cifrar
   * @returns Datos cifrados
   */
  encryptAES(data: string): string {
    return CryptoJS.AES.encrypt(data, AES_SECRET_KEY).toString();
  }

  /**
   * Descifra datos cifrados con AES
   * @param ciphertext - Datos cifrados
   * @returns Datos descifrados
   */
  decryptAES(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Genera un nonce/timestamp para prevenir ataques de replay
   * @returns Timestamp actual
   */
  generateNonce(): string {
    return Date.now().toString();
  }

  /**
   * Genera una firma HMAC para verificar integridad de mensajes
   * @param message - Mensaje a firmar
   * @param key - Clave secreta
   * @returns Firma HMAC
   */
  generateHMAC(message: string, key: string): string {
    return CryptoJS.HmacSHA256(message, key).toString();
  }

  /**
   * Almacena datos sensibles cifrados en localStorage
   * @param key - Clave para almacenar
   * @param data - Datos a almacenar
   */
  secureStore(key: string, data: string): void {
    const encrypted = this.encryptAES(data);
    localStorage.setItem(key, encrypted);
  }

  /**
   * Recupera y descifra datos de localStorage
   * @param key - Clave a recuperar
   * @returns Datos descifrados o null si no existe
   */
  secureRetrieve(key: string): string | null {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      return this.decryptAES(encrypted);
    } catch {
      return null;
    }
  }

  /**
   * Elimina datos sensibles de localStorage
   * @param key - Clave a eliminar
   */
  secureRemove(key: string): void {
    localStorage.removeItem(key);
  }
}

// Instancia singleton del servicio de cifrado
export const cryptoService = new CryptoService();

/**
 * Hook de React para usar el servicio de cifrado
 */
export const useCrypto = () => cryptoService;
