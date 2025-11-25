export interface AxiosErrorResponse {
  Success?: boolean;
  Exception?: string;
   message?: string; 
  Path?: string;
  Method?: string;
  StatusCode?: number;
  Timestamp?: string;
  success?:boolean;
}

