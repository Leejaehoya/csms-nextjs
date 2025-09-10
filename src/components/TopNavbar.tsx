'use client';

import { useState } from 'react';
import { 
  Bell, 
  Settings, 
  Menu, 
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';

interface LogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  source: string;
}

export default function TopNavbar() {
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logs: LogEntry[] = [
    {
      id: '1',
      type: 'info',
      message: '시스템이 정상적으로 시작되었습니다.',
      timestamp: new Date(),
      source: 'System'
    },
    {
      id: '2',
      type: 'success',
      message: '서울역 충전소 데이터가 성공적으로 동기화되었습니다.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      source: 'Charging Station'
    },
    {
      id: '3',
      type: 'warning',
      message: '부산역 충전소의 온도가 임계값에 근접했습니다.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      source: 'Monitoring'
    },
    {
      id: '4',
      type: 'error',
      message: '강남역 충전소와의 통신이 3분간 중단되었습니다.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      source: 'Communication'
    },
    {
      id: '5',
      type: 'info',
      message: '새로운 충전소가 등록되었습니다: 인천공항 충전소',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      source: 'Registration'
    }
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getLogBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-l-green-500';
      case 'warning': return 'bg-yellow-50 border-l-yellow-500';
      case 'error': return 'bg-red-50 border-l-red-500';
      default: return 'bg-blue-50 border-l-blue-500';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const errorCount = logs.filter(log => log.type === 'error').length;
  const warningCount = logs.filter(log => log.type === 'warning').length;

  return (
    <>
      {/* 상단 고정 네비게이션 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 로고 및 브랜딩 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CSMS</h1>
                  <p className="text-sm text-gray-500">Charging Station Management System</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 알림 및 설정 */}
            <div className="flex items-center gap-2">
              {/* 알림 버튼 */}
              <div className="relative">
                <button
                  onClick={() => setIsLogsOpen(!isLogsOpen)}
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="시스템 로그"
                >
                  <Bell className="w-5 h-5" />
                  {(errorCount > 0 || warningCount > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {errorCount + warningCount}
                    </span>
                  )}
                </button>

                {/* 로그 드롭다운 */}
                {isLogsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">시스템 로그</h3>
                        <button
                          onClick={() => setIsLogsOpen(false)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {logs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>로그가 없습니다</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {logs.map((log) => (
                            <div
                              key={log.id}
                              className={`p-3 border-l-4 ${getLogBgColor(log.type)}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getLogIcon(log.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-500">
                                      {log.source}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {formatTime(log.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {log.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>총 {logs.length}개 로그</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            오류 {errorCount}개
                          </span>
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            경고 {warningCount}개
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 설정 버튼 */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <p className="text-gray-500">모바일 메뉴 내용</p>
            </div>
          </div>
        </div>
      )}

      {/* 오버레이 */}
      {isLogsOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsLogsOpen(false)}
        />
      )}
    </>
  );
}
