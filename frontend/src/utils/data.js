import {
  LayoutDashboard,
  HandCoins,
  WalletMinimal,
  User,
  LogOut,
} from "lucide-react";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    id: "02",
    icon: WalletMinimal,
    label: "Income",
    path: "/income",
  },
  {
    id: "03",
    icon: HandCoins,
    label: "Expense",
    path: "/expense",
  },
  {
    id: "04",
    icon: User,
    label: "Profile",
    path: "/profile",
  },
  {
    id: "05",
    icon: LogOut,
    label: "Logout",
    path: "logout",
  },
];
