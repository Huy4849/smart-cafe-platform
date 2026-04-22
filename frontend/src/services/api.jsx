import axios from "axios";

const api = axios.create({
    baseURL: "/api",
});

// Request Interceptor: Tự động gắn token vào mỗi request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Xử lý các lỗi hệ thống (đặc biệt là 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Nếu nhận lỗi 401 từ server
        if (error.response && error.response.status === 401) {
            console.error("Session expired or Unauthorized. Redirecting to login...");
            
            // Xóa thông tin đăng nhập cũ
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // Điều hướng về trang login (dùng window.location để force reload state)
            if (window.location.pathname !== '/login') {
                window.location.href = "/login";
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
