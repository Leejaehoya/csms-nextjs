'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { useSidebar } from '@/contexts/SidebarContext';

interface UtilityStation {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  powerConsumption: number;
  powerGeneration: number;
  efficiency: number;
  lastUpdate: string;
  alerts: string[];
}

export default function UtilityPage() {
  const { sidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  const [stations, setStations] = useState<UtilityStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 필터링된 유틸리티 목록
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return '온라인';
      case 'offline': return '오프라인';
      case 'maintenance': return '점검중';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 샘플 데이터 로드
  useEffect(() => {
    setStations([
      {
        id: 'UTIL001',
        name: '서울역 유틸리티',
        location: '서울특별시 중구',
        status: 'online',
        powerConsumption: 150.5,
        powerGeneration: 200.0,
        efficiency: 95.2,
        lastUpdate: '2024-01-15 14:30:25',
        alerts: []
      },
      {
        id: 'UTIL002',
        name: '강남역 유틸리티',
        location: '서울특별시 강남구',
        status: 'online',
        powerConsumption: 120.3,
        powerGeneration: 180.0,
        efficiency: 87.5,
        lastUpdate: '2024-01-15 14:25:10',
        alerts: ['효율성 저하']
      },
      {
        id: 'UTIL003',
        name: '부산역 유틸리티',
        location: '부산광역시 동구',
        status: 'maintenance',
        powerConsumption: 0,
        powerGeneration: 0,
        efficiency: 0,
        lastUpdate: '2024-01-15 14:20:45',
        alerts: ['정기 점검 중']
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* 상단 네비게이션 바 */}
      <TopNavbar />

      <div className="flex flex-1">
        {/* 좌측 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 영역 */}
        <div
          className="flex-1 flex flex-col transition-all duration-300 sidebar-responsive"
          style={{
            marginTop: '64px',
            height: 'calc(100vh - 64px)',
            '--sidebar-width': sidebarCollapsed ? '80px' : '256px'
          } as React.CSSProperties}
        >
          {/* 메인 콘텐츠 */}
          <div className="flex-1 p-4 lg:p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 h-full flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">유틸리티 현황</h1>
                    <p className="text-sm text-gray-500">전력 소비 및 생산 현황을 모니터링할 수 있습니다</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLoading(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* 검색 및 필터 */}
              <div className="mb-6 space-y-4">
                {/* 검색바 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="유틸리티명, 위치, ID로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="all">모든 상태</option>
                      <option value="online">온라인</option>
                      <option value="offline">오프라인</option>
                      <option value="maintenance">점검중</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 유틸리티 목록 */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
                      <p className="text-gray-400 text-sm mt-1">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                      <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* 유틸리티 기본 정보 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{station.name}</h3>
                              <p className="text-sm text-gray-500">{station.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(station.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                              {getStatusText(station.status)}
                            </span>
                          </div>
                        </div>

                        {/* 전력 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* 전력 소비 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">전력 소비</span>
                              <span className="text-lg font-bold text-red-600">
                                {station.powerConsumption}kW
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-red-500" />
                              <span className="text-xs text-gray-500">소비량</span>
                            </div>
                          </div>

                          {/* 전력 생산 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">전력 생산</span>
                              <span className="text-lg font-bold text-green-600">
                                {station.powerGeneration}kW
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-gray-500">생산량</span>
                            </div>
                          </div>

                          {/* 효율성 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">효율성</span>
                              <span className={`text-lg font-bold ${getEfficiencyColor(station.efficiency)}`}>
                                {station.efficiency}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-gray-500">
                                {station.efficiency >= 90 ? '우수' : station.efficiency >= 80 ? '양호' : '개선필요'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 알림 */}
                        {station.alerts.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">알림</h4>
                            <div className="space-y-1">
                              {station.alerts.map((alert, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                                  <span className="text-sm text-yellow-800">{alert}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 마지막 업데이트 */}
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">마지막 업데이트: {station.lastUpdate}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 하단 통계 */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>총 {filteredStations.length}개의 유틸리티</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      온라인: {filteredStations.filter(s => s.status === 'online').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      오프라인: {filteredStations.filter(s => s.status === 'offline').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      점검중: {filteredStations.filter(s => s.status === 'maintenance').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
