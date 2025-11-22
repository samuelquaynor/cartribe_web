import { api } from './api';
import {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User,
    RefreshTokenResponse,
    UpdateUserRequest,
    ChangePasswordRequest,
    UpdateEmailRequest,
    DeleteUserRequest
} from '@/types/auth';
import {
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
} from '@/types/api';

/**
 * Authentication Service - Handles all auth-related API calls
 */
export class AuthService {
    /**
     * Login user with email and password
     */
    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const loginData: LoginRequest = {
            email: credentials.email,
            password: credentials.password,
        };

        const response = await api.post<any>('/auth/login', loginData);

        // Handle different possible response structures
        const data = response.data;
        let authResponse: AuthResponse;

        // Backend wraps response in { data: { user_id, access_token, ... } }
        const responseData = data.data || data;
        const userId = responseData.user_id || responseData.userId || responseData.id;

        if (responseData.accessToken || responseData.access_token || responseData.token) {
            // Standard structure or alternative field names
            authResponse = {
                user: responseData.user || responseData.userData || responseData.profile || {
                    id: userId,
                    email: credentials.email,
                    firstName: responseData.firstName || responseData.first_name,
                    lastName: responseData.lastName || responseData.last_name
                },
                accessToken: responseData.accessToken || responseData.access_token || responseData.token,
                refreshToken: responseData.refreshToken || responseData.refresh_token,
                expiresIn: responseData.expiresIn || responseData.expires_in || responseData.expires
            };
        } else {
            throw new Error('Invalid login response structure');
        }

        return authResponse;
    }

    /**
     * Register new user
     */
    static async register(userData: RegisterData): Promise<AuthResponse> {
        const registerData: RegisterRequest = {
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
        };

        const response = await api.post<any>('/auth/register', registerData);

        // Handle different possible response structures
        const data = response.data;
        let authResponse: AuthResponse;

        // Backend wraps response in { data: { user_id, access_token, ... } }
        const responseData = data.data || data;
        const userId = responseData.user_id || responseData.userId || responseData.id;

        if (responseData.accessToken || responseData.access_token || responseData.token) {
            // Standard structure or alternative field names
            authResponse = {
                user: responseData.user || responseData.userData || responseData.profile || {
                    id: userId,
                    email: userData.email,
                    firstName: userData.firstName || responseData.firstName || responseData.first_name,
                    lastName: userData.lastName || responseData.lastName || responseData.last_name
                },
                accessToken: responseData.accessToken || responseData.access_token || responseData.token,
                refreshToken: responseData.refreshToken || responseData.refresh_token,
                expiresIn: responseData.expiresIn || responseData.expires_in || responseData.expires
            };
        } else {
            throw new Error('Invalid registration response structure');
        }

        return authResponse;
    }

    /**
     * Logout user
     */
    static async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Even if logout fails on server, we should clear local tokens
            console.warn('Logout request failed:', error);
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(): Promise<RefreshTokenResponse> {
        const response = await api.post<RefreshTokenResponse>('/auth/refresh');
        return response.data;
    }

    /**
     * Get current user profile
     */
    static async getCurrentUser(): Promise<User> {
        const response = await api.get<any>('/auth/me');
        
        // Handle API response structure
        const data = response.data;
        if (data.data) {
            return data.data;
        }
        return data;
    }

    /**
     * Get user by ID
     */
    static async getUserById(userId: string): Promise<User> {
        const response = await api.get<any>(`/users/${userId}`);
        
        // Handle API response structure
        const data = response.data;
        if (data.data) {
            return data.data;
        }
        return data;
    }

    /**
     * Update user profile
     */
    static async updateProfile(userData: UpdateUserRequest): Promise<User> {
        const response = await api.put<any>('/auth/profile', userData);
        
        // Handle API response structure
        const data = response.data;
        if (data.data) {
            return data.data;
        }
        return data;
    }

    /**
     * Change password
     */
    static async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
        await api.post('/auth/change-password', passwordData);
    }

    /**
     * Request password reset
     */
    static async forgotPassword(email: string): Promise<void> {
        const requestData: ForgotPasswordRequest = { email };
        await api.post('/auth/forgot-password', requestData);
    }

    /**
     * Reset password with token
     */
    static async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
        await api.post('/auth/reset-password', resetData);
    }

    /**
     * Verify email address
     */
    static async verifyEmail(token: string): Promise<void> {
        await api.post('/auth/verify-email', { token });
    }

    /**
     * Resend email verification
     */
    static async resendVerificationEmail(): Promise<void> {
        await api.post('/auth/resend-verification');
    }

    /**
     * Update email address
     */
    static async updateEmail(emailData: UpdateEmailRequest): Promise<void> {
        await api.put('/auth/update-email', emailData);
    }

    /**
     * Send email verification
     */
    static async sendEmailVerification(email: string): Promise<void> {
        await api.post('/auth/send-verification', { email });
    }

    /**
     * Delete user account
     */
    static async deleteAccount(password: string): Promise<void> {
        await api.delete('/auth/profile', { data: { password } });
    }

    /**
     * Get user activity/logs
     */
    static async getUserActivity(): Promise<any[]> {
        const response = await api.get<any[]>('/auth/activity');
        return response.data;
    }

    /**
     * Check if email is available
     */
    static async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
        const response = await api.get<{ available: boolean }>(`/auth/check-email?email=${encodeURIComponent(email)}`);
        return response.data;
    }

    /**
     * Social login (Google, etc.)
     */
    static async socialLogin(provider: string, token: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>(`/auth/social/${provider}`, { token });
        return response.data;
    }

    /**
     * Link social account
     */
    static async linkSocialAccount(provider: string, token: string): Promise<void> {
        await api.post(`/auth/social/${provider}/link`, { token });
    }

    /**
     * Unlink social account
     */
    static async unlinkSocialAccount(provider: string): Promise<void> {
        await api.delete(`/auth/social/${provider}/link`);
    }
}
