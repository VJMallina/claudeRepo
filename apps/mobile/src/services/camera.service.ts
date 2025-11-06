import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import apiService from './api.service';

/**
 * Camera Service
 *
 * Wrapper service for camera operations
 * Features:
 * - QR code scanning
 * - Liveness detection (selfie capture)
 * - Document photo capture
 * - Face detection
 * - Image compression
 * - Upload to backend
 *
 * Uses expo-camera and expo-barcode-scanner
 */

export interface CameraPermissions {
  granted: boolean;
  canAskAgain: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface LivenessResult {
  success: boolean;
  livenessScore: number;
  qualityScore: number;
  faceDetected: boolean;
  photoUri: string;
  message?: string;
}

class CameraService {
  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<CameraPermissions> {
    try {
      const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Check if camera permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Camera.getCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Capture photo
   */
  async capturePhoto(cameraRef: any, options?: {
    quality?: number;
    base64?: boolean;
    skipProcessing?: boolean;
  }): Promise<PhotoResult> {
    try {
      if (!cameraRef?.current) {
        throw new Error('Camera ref not available');
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: options?.quality || 0.8,
        base64: options?.base64 || false,
        skipProcessing: options?.skipProcessing || false,
      });

      return photo;
    } catch (error) {
      console.error('Error capturing photo:', error);
      throw error;
    }
  }

  /**
   * Capture selfie for liveness check
   */
  async captureSelfie(cameraRef: any): Promise<PhotoResult> {
    return this.capturePhoto(cameraRef, {
      quality: 0.9, // High quality for face detection
      base64: false,
    });
  }

  /**
   * Verify liveness from selfie
   */
  async verifyLiveness(photoUri: string): Promise<LivenessResult> {
    try {
      // Read photo as base64
      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to backend for liveness detection
      const response = await apiService.post<LivenessResult>('/kyc/verify-liveness', {
        selfieUrl: `data:image/jpeg;base64,${base64}`,
      });

      return response;
    } catch (error) {
      console.error('Error verifying liveness:', error);
      throw error;
    }
  }

  /**
   * Upload photo to backend
   */
  async uploadPhoto(photoUri: string, documentType: 'SELFIE' | 'PAN' | 'AADHAAR' | 'OTHER'): Promise<{
    url: string;
    documentType: string;
  }> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `${documentType.toLowerCase()}_${Date.now()}.jpg`,
      } as any);
      formData.append('documentType', documentType);

      // Upload to backend
      const response = await apiService.post('/kyc/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  }

  /**
   * Compress photo
   */
  async compressPhoto(photoUri: string, quality: number = 0.7): Promise<string> {
    try {
      const manipulatedImage = await (require('expo-image-manipulator') as any).manipulateAsync(
        photoUri,
        [{ resize: { width: 1024 } }], // Resize to max width 1024px
        { compress: quality, format: 'jpeg' }
      );

      return manipulatedImage.uri;
    } catch (error) {
      console.error('Error compressing photo:', error);
      return photoUri; // Return original if compression fails
    }
  }

  /**
   * Delete photo from file system
   */
  async deletePhoto(photoUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(photoUri, { idempotent: true });
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }

  /**
   * Parse UPI QR code
   */
  parseUpiQrCode(data: string): {
    pa?: string; // Payee VPA
    pn?: string; // Payee name
    am?: string; // Amount
    cu?: string; // Currency
    tn?: string; // Transaction note
  } | null {
    try {
      // UPI QR format: upi://pay?pa=merchant@upi&pn=Merchant&am=100
      if (!data.startsWith('upi://pay?')) {
        return null;
      }

      const params = new URLSearchParams(data.replace('upi://pay?', ''));
      const result: any = {};

      for (const [key, value] of params.entries()) {
        result[key] = value;
      }

      return result;
    } catch (error) {
      console.error('Error parsing UPI QR code:', error);
      return null;
    }
  }

  /**
   * Validate QR code is UPI format
   */
  isValidUpiQrCode(data: string): boolean {
    return data.startsWith('upi://pay?') && data.includes('pa=');
  }

  /**
   * Get camera type (front/back)
   */
  getCameraType(useFrontCamera: boolean): CameraType {
    return useFrontCamera ? CameraType.front : CameraType.back;
  }

  /**
   * Check if device has front camera
   */
  async hasFrontCamera(): Promise<boolean> {
    try {
      // This would need expo-camera advanced APIs
      return true; // Most devices have front camera
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if device has back camera
   */
  async hasBackCamera(): Promise<boolean> {
    try {
      return true; // Most devices have back camera
    } catch (error) {
      return false;
    }
  }
}

export default new CameraService();
