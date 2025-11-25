// ✅ Generic structure for all successful backend responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?:string;
}
