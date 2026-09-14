const apiFetch = fetch;
import { DEFAULT_JSON_HEADERS } from '@/shared/constants';
import type { ApiResponse } from '@/shared/lib/http/types';
import { AUTH_INTERNAL_ENDPOINTS } from './auth.endpoints';
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  CmsUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdateProfileRequest,
} from './auth.types';

const E = AUTH_INTERNAL_ENDPOINTS;

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    let res: Response;
    try {
      res = await apiFetch(E.LOGIN, {
        method: 'POST',
        headers: DEFAULT_JSON_HEADERS,
        body: JSON.stringify(data),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          data: null,
          error: {
            code: 504,
            message: 'Login request timeout. Please check backend/redis/database health.',
          },
        };
      }

      return {
        data: null,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Login failed',
        },
      };
    } finally {
      clearTimeout(timeout);
    }

    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: { code: res.status, message: json.error?.message || 'Login failed', details: json.error?.details },
      };
    return { data: json, error: undefined };
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    const res = await apiFetch(E.REGISTER, { method: 'POST', headers: DEFAULT_JSON_HEADERS, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: { code: res.status, message: json.error?.message || 'Register failed', details: json.error?.details },
      };
    return { data: json, error: undefined };
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const res = await apiFetch(E.LOGOUT, { method: 'POST', headers: DEFAULT_JSON_HEADERS });
    if (!res.ok) {
      const json = await res.json();
      return {
        data: null,
        error: { code: res.status, message: json.error?.message || 'Logout failed', details: json.error?.details },
      };
    }
    return { data: null, error: undefined };
  },

  getProfile: async (): Promise<ApiResponse<CmsUser>> => {
    const res = await apiFetch(E.PROFILE, { method: 'GET', headers: DEFAULT_JSON_HEADERS });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Failed to fetch profile',
          details: json.error?.details,
        },
      };
    return { data: json, error: undefined };
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<CmsUser>> => {
    const res = await apiFetch(E.PROFILE, { method: 'PUT', headers: DEFAULT_JSON_HEADERS, body: JSON.stringify(data) });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Update profile failed',
          details: json.error?.details,
        },
      };
    return { data: json, error: undefined };
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<ChangePasswordResponse>> => {
    const res = await apiFetch(E.CHANGE_PASSWORD, {
      method: 'POST',
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Change password failed',
          details: json.error?.details,
        },
      };
    return { data: json, error: undefined };
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<ForgotPasswordResponse>> => {
    const res = await apiFetch(E.FORGOT_PASSWORD, {
      method: 'POST',
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Forgot password request failed',
          details: json.error?.details,
        },
      };
    return { data: { data: { message: json.message } }, error: undefined };
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<ResetPasswordResponse>> => {
    const res = await apiFetch(E.RESET_PASSWORD, {
      method: 'POST',
      headers: DEFAULT_JSON_HEADERS,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Reset password failed',
          details: json.error?.details,
        },
      };
    return { data: { data: { message: json.message } }, error: undefined };
  },

  refreshToken: async (): Promise<ApiResponse<RefreshTokenResponse>> => {
    const res = await apiFetch(E.REFRESH, { method: 'POST', headers: DEFAULT_JSON_HEADERS });
    const json = await res.json();
    if (!res.ok)
      return {
        data: null,
        error: {
          code: res.status,
          message: json.error?.message || 'Token refresh failed',
          details: json.error?.details,
        },
      };
    return { data: { message: json.message }, error: undefined };
  },
};
