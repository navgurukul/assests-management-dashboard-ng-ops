import CryptoJS from 'crypto-js';

const STORAGE_SECRET = process.env.NEXT_PUBLIC_STORAGE_SECRET;

/**
 * Encrypt a JavaScript object/value and return a string suitable for localStorage.
 * @param {*} data - Any JSON-serializable value
 * @returns {string|null} - AES-encrypted string, or null on failure
 */
export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, STORAGE_SECRET).toString();
  } catch (error) {
    console.error('Error encrypting storage data:', error);
    return null;
  }
};

/**
 * Decrypt an AES-encrypted localStorage string and return the original value.
 * Falls back gracefully for legacy plain-JSON values (transition period).
 * @param {string|null} encryptedString - Value from localStorage
 * @returns {*} - The original value, or null on failure
 */
export const decryptData = (encryptedString) => {
  if (!encryptedString) return null;

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedString, STORAGE_SECRET);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedString) {
      // Could be a legacy plain-JSON value stored before encryption was introduced
      return JSON.parse(encryptedString);
    }

    return JSON.parse(decryptedString);
  } catch {
    // Fallback: try parsing as plain JSON (legacy / migration support)
    try {
      return JSON.parse(encryptedString);
    } catch {
      return null;
    }
  }
};
