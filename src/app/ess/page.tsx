'use client';

import { useState, useEffect } from 'react';
import {
  Battery,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  AlertTriangle
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { useSidebar } from '@/contexts/SidebarContext';

interface ESSStation {
  id: string;
  name: string;
  location: string;
  batteryLevel: number;
  status: 'charging' | 'discharging' | 'idle' | 'maintenance';
  power: number;
  capacity: number;
  temperature: number;
  lastUpdate: string;
  alerts: string[];
}

export default function ESSPage() {
  const { sidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'charging' | 'discharging' | 'idle' | 'maintenance'>('all');
  const [stations, setStations] = useState<ESSStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 필터링된 ESS 목록
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charging': return 'text-green-600 bg-green-100';
      case 'discharging': return 'text-blue-600 bg-blue-100';
      case 'idle': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'charging': return '충전중';
      case 'discharging': return '방전중';
      case 'idle': return '대기중';
      case 'maintenance': return '점검중';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'charging': return <TrendingUp className="w-4 h-4" />;
      case 'discharging': return <TrendingDown className="w-4 h-4" />;
      case 'idle': return <Activity className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 30) return 'text-blue-600';
    if (temp < 40) return 'text-green-600';
    if (temp < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // 샘플 데이터 로드
  useEffect(() => {
    setStations([
      {
        id: 'ESS001',
        name: '서울역 ESS',
        location: '서울특별시 중구',
        batteryLevel: 85,
        status: 'charging',
        power: 50.5,
        capacity: 100,
        temperature: 35.2,
        lastUpdate: '2024-01-15 14:30:25',
        alerts: []
      },
      {
        id: 'ESS002',
        name: '강남역 ESS',
        location: '서울특별시 강남구',
        batteryLevel: 45,
        status: 'discharging',
        power: -30.2,
        capacity: 100,
        temperature: 42.1,
        lastUpdate: '2024-01-15 14:25:10',
        alerts: ['배터리 온도 높음']
      },
      {
        id: 'ESS003',
        name: '부산역 ESS',
        location: '부산광역시 동구',
        batteryLevel: 15,
        status: 'maintenance',
        power: 0,
        capacity: 100,
        temperature: 28.5,
        lastUpdate: '2024-01-15 14:20:45',
        alerts: ['배터리 잔량 부족', '정기 점검 필요']
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
                    <Battery className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">충전소 ESS 확인</h1>
                    <p className="text-sm text-gray-500">ESS 배터리 상태 및 성능을 모니터링할 수 있습니다</p>
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
                      placeholder="ESS명, 위치, ID로 검색..."
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
                      <option value="charging">충전중</option>
                      <option value="discharging">방전중</option>
                      <option value="idle">대기중</option>
                      <option value="maintenance">점검중</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ESS 목록 */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-12">
                      <Battery className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
                      <p className="text-gray-400 text-sm mt-1">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                      <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* ESS 기본 정보 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                              <Battery className="w-5 h-5 text-white" />
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

                        {/* 배터리 정보 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {/* 배터리 잔량 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">배터리 잔량</span>
                              <span className={`text-lg font-bold ${getBatteryColor(station.batteryLevel)}`}>
                                {station.batteryLevel}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  station.batteryLevel >= 80 ? 'bg-green-500' :
                                  station.batteryLevel >= 50 ? 'bg-yellow-500' :
                                  station.batteryLevel >= 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${station.batteryLevel}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* 전력 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">전력</span>
                              <span className={`text-lg font-bold ${station.power > 0 ? 'text-green-600' : station.power < 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                                {station.power > 0 ? '+' : ''}{station.power}kW
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {station.power > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-500" />
                              ) : station.power < 0 ? (
                                <TrendingDown className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Activity className="w-4 h-4 text-gray-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {station.power > 0 ? '충전중' : station.power < 0 ? '방전중' : '대기중'}
                              </span>
                            </div>
                          </div>

                          {/* 온도 */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">온도</span>
                              <span className={`text-lg font-bold ${getTemperatureColor(station.temperature)}`}>
                                {station.temperature}°C
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="w-4 h-4 text-orange-500" />
                              <span className="text-xs text-gray-500">
                                {station.temperature < 30 ? '정상' : station.temperature < 40 ? '주의' : '경고'}
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
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
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
                  <span>총 {filteredStations.length}개의 ESS</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      충전중: {filteredStations.filter(s => s.status === 'charging').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-blue-500" />
                      방전중: {filteredStations.filter(s => s.status === 'discharging').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      대기중: {filteredStations.filter(s => s.status === 'idle').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
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
