import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { API_PATHS } from "../utils/apiPaths";
import { currencyConfig } from "../config/currency.Config";

// helper function for change currency easily
const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    currencyDetails: currencyConfig[user.currency] || currencyConfig.INR,
  };
};

export const useAuthStore = create((set) => ({
  authUser: null,

  isCheckingAuth: true,
  isSigningUp: false, // Signup loading state
  isVerifing: false,
  isLoggingIn: false, // Login loading state
  isUpdatingProfile: false, // Profile update loading state

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get(API_PATHS.AUTH.CHECK_AUTH);
      const { user } = res.data;

      set({ authUser: normalizeUser(user) });
      return user;
    } catch (error) {
      console.error(`Check Auth error: ${error}`);
      set({ authUser: null });
      return null;
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, data);
      const { user } = res.data;

      if (user) {
        set({
          authUser: normalizeUser(user),
        });
      }
      return res.data;
    } catch (error) {
      console.error(`Singup error: ${error}`);
      throw error.response?.data || error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyEmail: async (email, otp) => {
    set({ isVerifing: true });
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.EMAIL_VERIFY, {
        email,
        otp,
      });

      if (res.data?.success) {
        set((state) => {
          const updatedUser = { ...state.authUser, isVerified: true };

          return { authUser: normalizeUser(updatedUser) };
        });
      }
      return res.data;
    } catch (error) {
      console.error(`Email verification error: ${error}`);
      throw error.response?.data || error;
    } finally {
      set({ isVerifing: false });
    }
  },

  resendVerifyEmail: async (email) => {
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.RESEND_EMAIL_VERIFY, {
        email,
      });
      return res.data;
    } catch (error) {
      console.error(`Resend email verification error: ${error}`);
      throw error.response?.data || error;
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, data);
      const { user } = res.data;

      set({ authUser: normalizeUser(user) });
      return user;
    } catch (error) {
      console.error(`Login error: ${error}`);
      throw error.response?.data || error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.delete(API_PATHS.AUTH.LOGOUT);
      set({ authUser: null });
    } catch (error) {
      console.error(`Logout error: ${error}`);
      throw error.response?.data || error;
    }
  },

  viewProfile: async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.PROFILE.ME);
      const { user } = res.data;

      if (res.data?.user) {
        set({ authUser: normalizeUser(user) });
        return user;
      } else {
        console.error("Failed to fetch own profile: ", res.data?.error);
        return null;
      }
    } catch (error) {
      console.error(`View profile error: ${error}`);
      throw error.response?.data || error;
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append(
        "profileData",
        JSON.stringify({
          fullName: data.fullName,
          dob: data.dob,
          gender: data.gender,
          phone: data.phone,
          country: data.country,
        }),
      );
      if (data.profilePic) formData.append("picture", data.profilePic);

      const res = await axiosInstance.put(API_PATHS.PROFILE.ME, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { user } = res.data;

      if (res.data?.user) {
        set({ authUser: normalizeUser(user) });
        return user;
      } else {
        console.error("No user object returned from server");
        return null;
      }
    } catch (error) {
      console.error(`Update profile error: ${error}`);
      throw error.response?.data || error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  changeCurrency: async (currency) => {
    try {
      const res = await axiosInstance.patch(API_PATHS.PROFILE.CHANGE_CURRENCY, {
        currency,
      });

      const { user } = res.data;
      set({ authUser: normalizeUser(user) });

      return user;
    } catch (error) {
      console.error(`Change currency error: ${error}`);
      throw error.response?.data || error;
    }
  },
}));
