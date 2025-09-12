'use client';

import { useState, useEffect } from 'react';
import {
  Plug,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { useSidebar } from '@/contexts/SidebarContext';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'available' | 'occupied' | 'unavailable' | 'maintenance';
  connectors: {
    id: number;
    status: 'available' | 'occupied' | 'unavailable';
    power: number;
    lastUsed?: string;
  }[];
  lastUpdate: string;
}

export default function AvailabilityPage() {
  const { sidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'unavailable' | 'maintenance'>('all');
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 필터링된 충전소 목록
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'occupied': return 'text-blue-600 bg-blue-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return '사용가능';
      case 'occupied': return '사용중';
      case 'unavailable': return '사용불가';
      case 'maintenance': return '점검중';
      default: return '알 수 없음';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'occupied': return <Clock className="w-4 h-4" />;
      case 'unavailable': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getConnectorStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'occupied': return 'text-blue-600 bg-blue-100';
      case 'unavailable': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConnectorStatusText = (status: string) => {
    switch (status) {
      case 'available': return '사용가능';
      case 'occupied': return '사용중';
      case 'unavailable': return '사용불가';
      default: return '알 수 없음';
    }
  };

  // 샘플 데이터 로드
  useEffect(() => {
    setStations([
      {
        id: 'CS001',
        name: '서울역 충전소',
        location: '서울특별시 중구',
        status: 'available',
        connectors: [
          { id: 1, status: 'available', power: 50.0 },
          { id: 2, status: 'occupied', power: 50.0, lastUsed: '2024-01-15 14:30:25' }
        ],
        lastUpdate: '2024-01-15 14:30:25'
      },
      {
        id: 'CS002',
        name: '강남역 충전소',
        location: '서울특별시 강남구',
        status: 'occupied',
        connectors: [
          { id: 1, status: 'occupied', power: 22.0, lastUsed: '2024-01-15 14:25:10' },
          { id: 2, status: 'unavailable', power: 22.0 }
        ],
        lastUpdate: '2024-01-15 14:25:10'
      },
      {
        id: 'CS003',
        name: '부산역 충전소',
        location: '부산광역시 동구',
        status: 'maintenance',
        connectors: [
          { id: 1, status: 'unavailable', power: 50.0 },
          { id: 2, status: 'unavailable', power: 50.0 }
        ],
        lastUpdate: '2024-01-15 14:20:45'
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
                    <Plug className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">EVSE 가용성</h1>
                    <p className="text-sm text-gray-500">충전소 및 커넥터 가용성을 실시간으로 확인할 수 있습니다</p>
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
                      placeholder="충전소명, 위치, ID로 검색..."
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
                      <option value="available">사용가능</option>
                      <option value="occupied">사용중</option>
                      <option value="unavailable">사용불가</option>
                      <option value="maintenance">점검중</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 충전소 목록 */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-12">
                      <Plug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
                      <p className="text-gray-400 text-sm mt-1">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                      <div key={station.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* 충전소 기본 정보 */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
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

                        {/* 커넥터 정보 */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">커넥터 상태</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {station.connectors.map((connector) => (
                              <div key={connector.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">커넥터 {connector.id}</span>
                                  <span className="text-xs text-gray-500">({connector.power}kW)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConnectorStatusColor(connector.status)}`}>
                                    {getConnectorStatusText(connector.status)}
                                  </span>
                                  {connector.lastUsed && (
                                    <span className="text-xs text-gray-400">
                                      {connector.lastUsed}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 마지막 업데이트 */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
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
                  <span>총 {filteredStations.length}개의 충전소</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      사용가능: {filteredStations.filter(s => s.status === 'available').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      사용중: {filteredStations.filter(s => s.status === 'occupied').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      사용불가: {filteredStations.filter(s => s.status === 'unavailable').length}
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
