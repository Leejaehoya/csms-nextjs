import axios from 'axios';

// Spring Boot 백엔드 API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090/';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 요청 인터셉터 (인증 토큰, 로깅 등)
apiClient.interceptors.request.use(
  (config) => {
    // 인증 토큰이 있으면 헤더에 추가
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 요청 로깅
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리, 로깅 등)
apiClient.interceptors.response.use(
  (response) => {
    // 성공 응답 로깅
    console.log(`[API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // 에러 응답 로깅
    console.error('[API Response Error]', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data
    });

    // 401 Unauthorized - 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
    }

    // 403 Forbidden - 권한 없음
    if (error.response?.status === 403) {
      console.error('Access denied. Insufficient permissions.');
    }

    // 500 Internal Server Error
    if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
