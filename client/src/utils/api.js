import axios from "axios";

// Create an axios instance that automatically uses the current hostname
// This ensures it works on localhost (localhost:5001) and on network (192.168.x.x:5001)
const baseURL = process.env.REACT_APP_API_URL || `/api`;

const api = axios.create({
    baseURL,
});

// Add a request interceptor to include the token if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
