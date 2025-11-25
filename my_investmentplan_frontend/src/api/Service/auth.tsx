import { http } from "../http";

export type LoginRequest = {
  username: string;
  passwordHash: string;
};

export type LoginResponse = {
  token: string;
  role: string;
};

//  Login
export async function getToken(req: LoginRequest): Promise<LoginResponse> {
  const { data } = await http.post<LoginResponse>("Token/login", req);
  return data;
}

//  Send OTP
export async function sendOtp(email: string, mobile: string) {
  const { data } = await http.post<{ success: boolean }>("otp/OTPVerify/send", {
    email,
    mobile,
  });
  return data;
}

//  Verify OTP
export async function verifyOtp(email: string, mobile: string, otp: string) {
  const { data } = await http.post<{ success: boolean }>("otp/OTPVerify/verify", {
    email,
    mobile,
    otp,
  });
  return data;
}
