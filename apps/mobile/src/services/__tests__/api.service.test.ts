import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import apiService from '../api.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    it('should get access token from secure store', async () => {
      const mockToken = 'test-access-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const token = await apiService.getAccessToken();

      expect(token).toBe(mockToken);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('access_token');
    });

    it('should set access token in secure store', async () => {
      const mockToken = 'new-access-token';
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await apiService.setAccessToken(mockToken);

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', mockToken);
    });

    it('should get refresh token from secure store', async () => {
      const mockToken = 'test-refresh-token';
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockToken);

      const token = await apiService.getRefreshToken();

      expect(token).toBe(mockToken);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('refresh_token');
    });

    it('should set both tokens', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await apiService.setTokens('access', 'refresh');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('access_token', 'access');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refresh_token', 'refresh');
    });

    it('should clear all tokens', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

      await apiService.clearTokens();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('access_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refresh_token');
    });

    it('should check if user is authenticated', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token');

      const isAuth = await apiService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false if no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const isAuth = await apiService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = { data: mockData };

      mockedAxios.create = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      // Create new instance for testing
      const testService = new (apiService.constructor as any)();
      const result = await testService.get('/test');

      expect(result).toEqual(mockData);
    });

    it('should make POST request', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = { data: mockData };
      const postData = { name: 'Test' };

      mockedAxios.create = jest.fn().mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const testService = new (apiService.constructor as any)();
      const result = await testService.post('/test', postData);

      expect(result).toEqual(mockData);
    });

    it('should make PUT request', async () => {
      const mockData = { id: 1, name: 'Updated' };
      const mockResponse = { data: mockData };
      const putData = { name: 'Updated' };

      mockedAxios.create = jest.fn().mockReturnValue({
        put: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const testService = new (apiService.constructor as any)();
      const result = await testService.put('/test/1', putData);

      expect(result).toEqual(mockData);
    });

    it('should make DELETE request', async () => {
      const mockResponse = { data: { message: 'Deleted' } };

      mockedAxios.create = jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue(mockResponse),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const testService = new (apiService.constructor as any)();
      const result = await testService.delete('/test/1');

      expect(result).toEqual({ message: 'Deleted' });
    });
  });
});
