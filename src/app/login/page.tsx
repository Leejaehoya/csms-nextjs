'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Activity, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // 로그인 검증 로직
    if (username === "admin" && password === "admin1") {
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError("잘못된 사용자 이름 또는 비밀번호입니다.");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-emerald-50/30 flex">
      {/* 좌측 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="max-w-3xl w-full">
          <div className="mb-8">
            <div className="mb-3">
              {/* 로고 */}
              <div className="flex items-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-18 h-18 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-7xl font-bold bg-gradient-to-r from-slate-800 to-indigo-600 bg-clip-text text-transparent mb-2 leading-tight">
                    CSMS
                  </h1>
                  <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-3xl lg:text-6xl font-light text-slate-700 mb-6 leading-tight">
                Charging Station Management System
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                전기차 충전소의 효율적인 운영과 관리를 위한 통합 플랫폼
              </p>
            </div>

            {/* 기능 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 hover:border-indigo-300/60 hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">실시간 모니터링</h3>
                <p className="text-slate-600 text-sm leading-relaxed">충전소 상태를 실시간으로 모니터링하고 관리합니다.</p>
              </div>

              <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 hover:border-emerald-300/60 hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">데이터 분석</h3>
                <p className="text-slate-600 text-sm leading-relaxed">충전 데이터를 분석하여 운영 효율성을 향상시킵니다.</p>
              </div>

              <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/60 hover:border-slate-300/60 hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-500/10">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-slate-500/25 transition-all duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">원격 제어</h3>
                <p className="text-slate-600 text-sm leading-relaxed">충전기를 원격으로 제어하고 설정을 관리합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 우측 로그인 섹션 */}
      <div className="w-full lg:w-[420px] bg-white/90 backdrop-blur-xl border-l border-slate-200/60 flex items-center justify-center p-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">로그인</h2>
            <p className="text-slate-600 text-lg">계정에 로그인하여 시스템에 접속하세요</p>
          </div>

          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <div className="input-container">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="사용자 이름"
                    required
                    disabled={isLoading}
                    className="form-input"
                  />
                  <label htmlFor="username" className="input-label">사용자 이름</label>
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호"
                    required
                    disabled={isLoading}
                    className="form-input pr-12"
                  />
                  <label htmlFor="password" className="input-label">비밀번호</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          </div>

          {/* 하단 정보 */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500">
              CSMS v1.0.0 • AI Powered
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-form-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          position: relative;
        }

        .input-container {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          font-size: 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 0.75rem;
          background: #f8fafc;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-input:focus + .input-label,
        .form-input:not(:placeholder-shown) + .input-label {
          transform: translateY(-2.5rem) scale(0.85);
          color: #6366f1;
          background: white;
          padding: 0 0.5rem;
        }

        .input-label {
          position: absolute;
          left: 1.25rem;
          top: 1rem;
          color: #64748b;
          font-size: 1rem;
          pointer-events: none;
          transition: all 0.2s ease;
          transform-origin: left top;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #475569;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.75rem;
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1rem;
        }

        .login-button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #4f46e5 0%, #059669 100%);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-button.loading {
          background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
