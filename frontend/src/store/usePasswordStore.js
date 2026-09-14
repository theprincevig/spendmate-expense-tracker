import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { API_PATHS } from '../utils/apiPaths';
import { useAuthStore } from './useAuthStore';

export const usePasswordStore = create((set) => ({
    authUser: useAuthStore.getState(),

    changePassLoading: false,   // Change password loading state
    forgotPassLoading: false,   // Forgot password loading state
    resetPassLoading: false,    // Reset password loading state

    changePassword: async (oldPassword, newPassword) => {
        set({ changePassLoading: true });
        try {
            const res = await axiosInstance.post(
                API_PATHS.PASSWORD.CHANGE,
                { oldPassword, newPassword }
            );

            // Force logout
            await axiosInstance.delete(API_PATHS.AUTH.LOGOUT);
            set({ authUser: null });

            return res.data;

        } catch (error) {
            console.error(`Change password error: ${error}`);
            throw error.response?.data || error;

        } finally {
            set({ changePassLoading: false });
        }
    },

    forgotPassword: async (email) => {
        set({ forgotPassLoading: true });
        try {
            const res = await axiosInstance.post(
                API_PATHS.PASSWORD.FORGOT,
                { email }
            );

            return res.data;
        } catch (error) {
            console.error(`Forgot password error: ${error}`);
            throw error.response?.data || error;

        } finally {
            set({ forgotPassLoading: false });
        }
    },

    forgotPassOTPVerify: async (email, otp) => {
        try {
            const res = await axiosInstance.post(
                API_PATHS.PASSWORD.FORGOT_OTP_VERIFY,
                { email, otp }
            );

            return res.data;
        } catch (error) {
            console.error(`Forgot password OTP verification error: ${error}`);
            throw error.response?.data || error;
        }
    },

    resetPassword: async (token, newPassword) => {
        set({ resetPassLoading: true });
        try {
            const res = await axiosInstance.post(
                API_PATHS.PASSWORD.RESET(token),
                { newPassword }
            );

            return res.data;
        } catch (error) {
            console.error(`Reset password error: ${error}`);
            throw error.response?.data || error;

        } finally {
            set({ resetPassLoading: false });
        }
    },
}));