import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const axiosInstance = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export { axiosInstance };
