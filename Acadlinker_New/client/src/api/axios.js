import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log("Backend API URL:", API_URL); // Must print http://127.0.0.1:5000

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;
