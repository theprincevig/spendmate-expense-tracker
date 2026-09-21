import {
    KeyRound,
    Mail,
    ShieldCheck
} from "lucide-react";

/* ==================================================
   Variant Definitions
   Each variant mirrors a real password flow:
   - change: current, new, confirm
   - forgot: email -> OTP
   - reset:  new, confirm
   ================================================== */

export const VARIANTS = [
    {
        key: "change",
        title: "Change Password",
        subtitle: "Confirm your current password to continue",
        icon: <KeyRound size={18} />,
        iconClass: "brand-gradient",
        fields: [
            { label: "Current password", masked: true, filled: 10 },
            { label: "New password", masked: true, filled: 7 },
            { label: "Confirm new password", masked: true, filled: 7 }
        ]
    },
    {
        key: "forgot",
        title: "Forgot Password",
        subtitle: "We'll send a code to verify it's you",
        icon: <Mail size={18} />,
        iconClass: "expense-gradient",
        fields: [
            { label: "Email address", masked: false, value: "you@spendmate.com" },
            { label: "Verification code", otp: true }
        ]
    },
    {
        key: "reset",
        title: "Reset Password",
        subtitle: "Choose a new password for your account",
        icon: <ShieldCheck size={18} />,
        iconClass: "income-gradient",
        fields: [
            { label: "New password", masked: true, filled: 9 },
            { label: "Confirm new password", masked: true, filled: 9 }
        ]
    }
];

export const CYCLE_MS = 4500;