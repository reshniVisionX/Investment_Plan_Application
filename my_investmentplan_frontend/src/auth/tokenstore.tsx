import Cookies from "js-cookie";
import type { Investor } from "../Types/Investor";
const THEME_KEY = "theme";
const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";
const INVESTOR_KEY = "Investor";

export const tokenstore = {
  // ===== TOKEN =====
  getToken() {
    return Cookies.get(TOKEN_KEY) || null;
  },

  setToken(token: string) {
    Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "strict" });
  },

  // ===== ROLE =====
  setRole(role: string) {
    Cookies.set(ROLE_KEY, role, { expires: 7, sameSite: "strict" });
  },

  getRole() {
    return Cookies.get(ROLE_KEY) || null;
  },

  // ===== INVESTOR OBJECT =====
  setInvestor(investor: Investor) {
    // Convert object to JSON before storing
    Cookies.set(INVESTOR_KEY, JSON.stringify(investor), {
      expires: 7,
      sameSite: "strict",
    });
  },

  getInvestor() {
    const data = Cookies.get(INVESTOR_KEY);
    return data ? JSON.parse(data) : null;
  },

   setTheme(theme: "light" | "dark") {
    localStorage.setItem(THEME_KEY, theme);
  },

  getTheme(): "light" | "dark" {
    return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "light";
  },

  // ===== CLEAR ALL =====
  clear() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(ROLE_KEY);
    Cookies.remove(INVESTOR_KEY);
  },
};
