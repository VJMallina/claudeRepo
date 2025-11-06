import { Camera, CameraType } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import CameraService, { LivenessResult, PhotoResult } from '../camera.service';
import apiService from '../api.service';

// Mock dependencies
jest.mock('expo-camera');
jest.mock('expo-file-system');
jest.mock('../api.service');

describe('CameraService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('should request and grant camera permissions', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const result = await CameraService.requestPermissions();

      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('should handle permission denial', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
      });

      const result = await CameraService.requestPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });

    it('should handle permission errors', async () => {
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await CameraService.requestPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
    });
  });

  describe('hasPermissions', () => {
    it('should return true when permissions are granted', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await CameraService.hasPermissions();

      expect(result).toBe(true);
    });

    it('should return false when permissions are not granted', async () => {
      (Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await CameraService.hasPermissions();

      expect(result).toBe(false);
    });
  });

  describe('capturePhoto', () => {
    it('should capture photo with default options', async () => {
      const mockPhoto: PhotoResult = {
        uri: 'file:///path/to/photo.jpg',
        width: 1920,
        height: 1080,
      };

      const mockCameraRef = {
        current: {
          takePictureAsync: jest.fn().mockResolvedValue(mockPhoto),
        },
      };

      const result = await CameraService.capturePhoto(mockCameraRef);

      expect(result).toEqual(mockPhoto);
      expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalledWith({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
    });

    it('should capture photo with custom quality', async () => {
      const mockPhoto: PhotoResult = {
        uri: 'file:///path/to/photo.jpg',
        width: 1920,
        height: 1080,
      };

      const mockCameraRef = {
        current: {
          takePictureAsync: jest.fn().mockResolvedValue(mockPhoto),
        },
      };

      const result = await CameraService.capturePhoto(mockCameraRef, {
        quality: 0.95,
        base64: true,
      });

      expect(result).toEqual(mockPhoto);
      expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalledWith({
        quality: 0.95,
        base64: true,
        skipProcessing: false,
      });
    });

    it('should throw error if camera ref is not available', async () => {
      const mockCameraRef = {
        current: null,
      };

      await expect(CameraService.capturePhoto(mockCameraRef)).rejects.toThrow(
        'Camera ref not available'
      );
    });

    it('should handle capture errors', async () => {
      const mockCameraRef = {
        current: {
          takePictureAsync: jest.fn().mockRejectedValue(new Error('Capture failed')),
        },
      };

      await expect(CameraService.capturePhoto(mockCameraRef)).rejects.toThrow('Capture failed');
    });
  });

  describe('captureSelfie', () => {
    it('should capture selfie with high quality', async () => {
      const mockPhoto: PhotoResult = {
        uri: 'file:///path/to/selfie.jpg',
        width: 1920,
        height: 1080,
      };

      const mockCameraRef = {
        current: {
          takePictureAsync: jest.fn().mockResolvedValue(mockPhoto),
        },
      };

      const result = await CameraService.captureSelfie(mockCameraRef);

      expect(result).toEqual(mockPhoto);
      expect(mockCameraRef.current.takePictureAsync).toHaveBeenCalledWith({
        quality: 0.9,
        base64: false,
      });
    });
  });

  describe('verifyLiveness', () => {
    it('should verify liveness successfully', async () => {
      const photoUri = 'file:///path/to/selfie.jpg';
      const mockBase64 = 'base64encodedimage';

      const mockLivenessResult: LivenessResult = {
        success: true,
        livenessScore: 95,
        qualityScore: 90,
        faceDetected: true,
        photoUri,
        message: 'Liveness verified successfully',
      };

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockBase64);
      (apiService.post as jest.Mock).mockResolvedValue(mockLivenessResult);

      const result = await CameraService.verifyLiveness(photoUri);

      expect(result).toEqual(mockLivenessResult);
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      expect(apiService.post).toHaveBeenCalledWith('/kyc/verify-liveness', {
        selfieUrl: `data:image/jpeg;base64,${mockBase64}`,
      });
    });

    it('should handle liveness verification failure', async () => {
      const photoUri = 'file:///path/to/selfie.jpg';
      const mockBase64 = 'base64encodedimage';

      const mockLivenessResult: LivenessResult = {
        success: false,
        livenessScore: 45,
        qualityScore: 60,
        faceDetected: false,
        photoUri,
        message: 'No face detected',
      };

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockBase64);
      (apiService.post as jest.Mock).mockResolvedValue(mockLivenessResult);

      const result = await CameraService.verifyLiveness(photoUri);

      expect(result.success).toBe(false);
      expect(result.faceDetected).toBe(false);
    });

    it('should handle file read errors', async () => {
      const photoUri = 'file:///invalid/path.jpg';

      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(new Error('File not found'));

      await expect(CameraService.verifyLiveness(photoUri)).rejects.toThrow('File not found');
    });

    it('should handle API errors', async () => {
      const photoUri = 'file:///path/to/selfie.jpg';
      const mockBase64 = 'base64encodedimage';

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockBase64);
      (apiService.post as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(CameraService.verifyLiveness(photoUri)).rejects.toThrow('API error');
    });
  });

  describe('uploadPhoto', () => {
    it('should upload photo successfully', async () => {
      const photoUri = 'file:///path/to/photo.jpg';
      const documentType = 'SELFIE';

      const mockResponse = {
        url: 'https://storage.example.com/selfie_123.jpg',
        documentType: 'SELFIE',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CameraService.uploadPhoto(photoUri, documentType);

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith(
        '/kyc/upload-document',
        expect.any(Object),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    it('should upload PAN document', async () => {
      const photoUri = 'file:///path/to/pan.jpg';
      const documentType = 'PAN';

      const mockResponse = {
        url: 'https://storage.example.com/pan_123.jpg',
        documentType: 'PAN',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CameraService.uploadPhoto(photoUri, documentType);

      expect(result.documentType).toBe('PAN');
    });

    it('should upload Aadhaar document', async () => {
      const photoUri = 'file:///path/to/aadhaar.jpg';
      const documentType = 'AADHAAR';

      const mockResponse = {
        url: 'https://storage.example.com/aadhaar_123.jpg',
        documentType: 'AADHAAR',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CameraService.uploadPhoto(photoUri, documentType);

      expect(result.documentType).toBe('AADHAAR');
    });

    it('should handle upload errors', async () => {
      const photoUri = 'file:///path/to/photo.jpg';

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await expect(CameraService.uploadPhoto(photoUri, 'SELFIE')).rejects.toThrow(
        'Upload failed'
      );
    });
  });

  describe('compressPhoto', () => {
    it('should compress photo with default quality', async () => {
      const photoUri = 'file:///path/to/photo.jpg';
      const compressedUri = 'file:///path/to/photo-compressed.jpg';

      const mockManipulateAsync = jest.fn().mockResolvedValue({
        uri: compressedUri,
      });

      jest.mock('expo-image-manipulator', () => ({
        manipulateAsync: mockManipulateAsync,
      }));

      const manipulator = require('expo-image-manipulator');
      manipulator.manipulateAsync = mockManipulateAsync;

      const result = await CameraService.compressPhoto(photoUri);

      expect(mockManipulateAsync).toHaveBeenCalledWith(
        photoUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.7, format: 'jpeg' }
      );
      expect(result).toBe(compressedUri);
    });

    it('should compress photo with custom quality', async () => {
      const photoUri = 'file:///path/to/photo.jpg';
      const compressedUri = 'file:///path/to/photo-compressed.jpg';

      const mockManipulateAsync = jest.fn().mockResolvedValue({
        uri: compressedUri,
      });

      jest.mock('expo-image-manipulator', () => ({
        manipulateAsync: mockManipulateAsync,
      }));

      const manipulator = require('expo-image-manipulator');
      manipulator.manipulateAsync = mockManipulateAsync;

      const result = await CameraService.compressPhoto(photoUri, 0.5);

      expect(mockManipulateAsync).toHaveBeenCalledWith(
        photoUri,
        [{ resize: { width: 1024 } }],
        { compress: 0.5, format: 'jpeg' }
      );
      expect(result).toBe(compressedUri);
    });

    it('should return original URI if compression fails', async () => {
      const photoUri = 'file:///path/to/photo.jpg';

      const mockManipulateAsync = jest.fn().mockRejectedValue(new Error('Compression failed'));

      jest.mock('expo-image-manipulator', () => ({
        manipulateAsync: mockManipulateAsync,
      }));

      const manipulator = require('expo-image-manipulator');
      manipulator.manipulateAsync = mockManipulateAsync;

      const result = await CameraService.compressPhoto(photoUri);

      expect(result).toBe(photoUri);
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo successfully', async () => {
      const photoUri = 'file:///path/to/photo.jpg';

      (FileSystem.deleteAsync as jest.Mock).mockResolvedValue(undefined);

      await CameraService.deletePhoto(photoUri);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(photoUri, { idempotent: true });
    });

    it('should handle deletion errors gracefully', async () => {
      const photoUri = 'file:///path/to/photo.jpg';

      (FileSystem.deleteAsync as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      // Should not throw
      await expect(CameraService.deletePhoto(photoUri)).resolves.not.toThrow();
    });
  });

  describe('parseUpiQrCode', () => {
    it('should parse valid UPI QR code', () => {
      const qrData = 'upi://pay?pa=merchant@upi&pn=Merchant%20Name&am=100&cu=INR&tn=Payment';

      const result = CameraService.parseUpiQrCode(qrData);

      expect(result).toEqual({
        pa: 'merchant@upi',
        pn: 'Merchant Name',
        am: '100',
        cu: 'INR',
        tn: 'Payment',
      });
    });

    it('should parse UPI QR code without amount', () => {
      const qrData = 'upi://pay?pa=merchant@upi&pn=Merchant';

      const result = CameraService.parseUpiQrCode(qrData);

      expect(result).toEqual({
        pa: 'merchant@upi',
        pn: 'Merchant',
      });
    });

    it('should return null for invalid QR code format', () => {
      const qrData = 'https://example.com/payment';

      const result = CameraService.parseUpiQrCode(qrData);

      expect(result).toBeNull();
    });

    it('should return null for empty string', () => {
      const qrData = '';

      const result = CameraService.parseUpiQrCode(qrData);

      expect(result).toBeNull();
    });

    it('should handle special characters in parameters', () => {
      const qrData = 'upi://pay?pa=test@upi&pn=Test%20%26%20Co&tn=Bill%20%23123';

      const result = CameraService.parseUpiQrCode(qrData);

      expect(result?.pa).toBe('test@upi');
      expect(result?.pn).toBe('Test & Co');
      expect(result?.tn).toBe('Bill #123');
    });

    it('should handle malformed QR codes gracefully', () => {
      const qrData = 'upi://pay?invalid';

      const result = CameraService.parseUpiQrCode(qrData);

      // Should not crash, may return empty object or null
      expect(result).toBeDefined();
    });
  });

  describe('isValidUpiQrCode', () => {
    it('should validate correct UPI QR code', () => {
      expect(CameraService.isValidUpiQrCode('upi://pay?pa=test@upi')).toBe(true);
      expect(CameraService.isValidUpiQrCode('upi://pay?pa=merchant@paytm&pn=Shop')).toBe(true);
    });

    it('should reject invalid UPI QR codes', () => {
      expect(CameraService.isValidUpiQrCode('https://example.com')).toBe(false);
      expect(CameraService.isValidUpiQrCode('upi://pay?pn=NoPA')).toBe(false);
      expect(CameraService.isValidUpiQrCode('')).toBe(false);
      expect(CameraService.isValidUpiQrCode('invalid')).toBe(false);
    });
  });

  describe('getCameraType', () => {
    it('should return front camera type', () => {
      const result = CameraService.getCameraType(true);
      expect(result).toBe(CameraType.front);
    });

    it('should return back camera type', () => {
      const result = CameraService.getCameraType(false);
      expect(result).toBe(CameraType.back);
    });
  });

  describe('hasFrontCamera', () => {
    it('should return true for devices with front camera', async () => {
      const result = await CameraService.hasFrontCamera();
      expect(result).toBe(true);
    });
  });

  describe('hasBackCamera', () => {
    it('should return true for devices with back camera', async () => {
      const result = await CameraService.hasBackCamera();
      expect(result).toBe(true);
    });
  });

  describe('Complete Camera Flow', () => {
    it('should complete full selfie capture and liveness verification', async () => {
      // Step 1: Request permissions
      (Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
      });

      const permResult = await CameraService.requestPermissions();
      expect(permResult.granted).toBe(true);

      // Step 2: Capture selfie
      const mockPhoto: PhotoResult = {
        uri: 'file:///path/to/selfie.jpg',
        width: 1920,
        height: 1080,
      };

      const mockCameraRef = {
        current: {
          takePictureAsync: jest.fn().mockResolvedValue(mockPhoto),
        },
      };

      const photo = await CameraService.captureSelfie(mockCameraRef);
      expect(photo.uri).toBe('file:///path/to/selfie.jpg');

      // Step 3: Verify liveness
      const mockBase64 = 'base64encodedimage';
      const mockLivenessResult: LivenessResult = {
        success: true,
        livenessScore: 95,
        qualityScore: 90,
        faceDetected: true,
        photoUri: photo.uri,
        message: 'Liveness verified',
      };

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockBase64);
      (apiService.post as jest.Mock).mockResolvedValue(mockLivenessResult);

      const livenessResult = await CameraService.verifyLiveness(photo.uri);
      expect(livenessResult.success).toBe(true);
      expect(livenessResult.faceDetected).toBe(true);
    });

    it('should complete full QR scan and payment flow', async () => {
      // Parse QR code
      const qrData = 'upi://pay?pa=merchant@upi&pn=Test%20Merchant&am=500';
      const parsed = CameraService.parseUpiQrCode(qrData);

      expect(parsed?.pa).toBe('merchant@upi');
      expect(parsed?.pn).toBe('Test Merchant');
      expect(parsed?.am).toBe('500');

      // Validate UPI format
      const isValid = CameraService.isValidUpiQrCode(qrData);
      expect(isValid).toBe(true);
    });
  });
});
