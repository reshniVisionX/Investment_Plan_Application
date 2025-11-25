import axios from 'axios';
import { tokenstore } from '../auth/tokenstore';

export const http = axios.create({
    baseURL : import.meta.env.VITE_BASE_URL,
    headers: {
        "Content-Type" : "application/json"
    }
});

http.interceptors.request.use((config)=>{
  const token = tokenstore.getToken();
  if(token){
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

