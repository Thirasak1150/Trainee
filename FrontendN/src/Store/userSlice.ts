// src/store/userSlice.ts
import type { MenuHeader } from "@/app/components/app-sidebar";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getCookie } from "@/app/components/get-cookie";

interface UserState {
  user_uuid: string | null;
  userRole: string | null;
  userEmail: string | null;
  fullName: string | null;
  domains_id: string | null;
  domain_name: string | null;
  menu: MenuHeader[];
}

const initialState: UserState = {
  user_uuid: getCookie("user_uuid") || null,
  userRole: getCookie("userRole") || null,
  userEmail: getCookie("email") || null,
  fullName: getCookie("full_name") || null,
  domains_id: getCookie("domains_id") || null,
  domain_name: getCookie("domain_name") || null,
  menu: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserUuid: (state, action: PayloadAction<string | null>) => {
      state.user_uuid = action.payload;
    },
    setUserRole: (state, action: PayloadAction<string | null>) => {
      state.userRole = action.payload;
    },
    setUserEmail: (state, action: PayloadAction<string | null>) => {
      state.userEmail = action.payload;
    },
    setFullName: (state, action: PayloadAction<string | null>) => {
      state.fullName = action.payload;
    },
    setMenu: (state, action: PayloadAction<MenuHeader[]>) => {
      state.menu = action.payload;
    },
    setDomainsId: (state, action: PayloadAction<string | null>) => {
      state.domains_id = action.payload;
    },
    setDomainName: (state, action: PayloadAction<string | null>) => {
      state.domain_name = action.payload;
    },
    resetUser: (state) => {
      state.user_uuid = null;
      state.userRole = null;
      state.userEmail = null;
      state.fullName = null;
      state.menu = [];
    },
  },
});

export const {
  setUserUuid,
  setUserRole,
  setUserEmail,
  setFullName,
  setMenu,
  setDomainsId,
  setDomainName,
  resetUser,
} = userSlice.actions;

export default userSlice.reducer;
