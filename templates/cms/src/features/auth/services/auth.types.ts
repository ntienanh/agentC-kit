export interface CmsRole {
  id: string | number;
  name: string;
  type?: string;
}

export interface CmsUser {
  id: string | number;
  username?: string;
  email: string;
  displayName?: string | null;
  avatar?: string | null;
  phone?: string | null;
  accessibleStoreIds?: string[];
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  role?: CmsRole;
}

export interface LoginRequest {
  identifier?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  jwt?: string;
  refreshToken: string;
  user: CmsUser;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  jwt: string;
  refreshToken: string;
  user: CmsUser;
}

export interface GetProfileResponse {
  user: CmsUser;
}

export interface UpdateProfileRequest {
  displayName: string;
}

export interface UpdateProfileResponse {
  user: CmsUser;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  data: {
    message: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  data: {
    message: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  message: string;
}

export interface CmsRefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type LoginPayload = LoginRequest;
export type RegisterPayload = RegisterRequest;
export type UpdateProfilePayload = UpdateProfileRequest;
export type ForgotPasswordDto = ForgotPasswordRequest;
export type ResetPasswordDto = ResetPasswordRequest;
export type ChangePasswordPayload = ChangePasswordRequest;
