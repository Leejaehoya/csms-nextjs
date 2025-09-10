'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Zap, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Clock, 
  Activity,
  TrendingUp,
  Users,
  Battery,
  Filter,
  X,
  Menu,
  Bell,
  Settings,
  Home,
  BarChart3
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { useSidebar } from '@/contexts/SidebarContext';
import dynamic from 'next/dynamic';

// 지도 컴포넌트를 동적으로 로드 (SSR 방지)
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">지도 로딩 중...</div>
});

interface Charger {
  id: string;
  name: string;
  location: string;
  status: 'normal' | 'disconnected';
  messageType?: 'bootnotification' | 'heartbeat';
  lastConnection: Date;
}

export default function DashboardPage() {
  const [normalChargers, setNormalChargers] = useState<Charger[]>([]);
  const [disconnectedChargers, setDisconnectedChargers] = useState<Charger[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(900);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sidebarCollapsed } = useSidebar();

  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState({
    normal: '',
    disconnected: ''
  });

  // 필터 상태
  const [filters, setFilters] = useState({
    city: '',
    district: '',
    subDistrict: ''
  });

  // 데이터 fetch 함수
  const fetchChargerData = async () => {
    setIsLoading(true);
    try {
      // 실제 API 엔드포인트로 변경 필요
      const response = await fetch('/api/chargers');
      if (!response.ok) {
        throw new Error('네트워크 응답이 올바르지 않습니다.');
      }
      const chargerData = await response.json();

      const normal = chargerData.filter((charger: Charger) => charger.status === 'normal');
      const disconnected = chargerData.filter((charger: Charger) => charger.status === 'disconnected');

      setNormalChargers(normal);
      setDisconnectedChargers(disconnected);
      setLastUpdated(new Date());
      setCountdown(900);
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      // 개발용 더미 데이터
      const dummyData: Charger[] = [
        {
          id: 'CHG001',
          name: '서울역 충전소',
          location: '서울특별시 중구',
          status: 'normal',
          messageType: 'heartbeat',
          lastConnection: new Date()
        },
        {
          id: 'CHG002',
          name: '강남역 충전소',
          location: '서울특별시 강남구',
          status: 'normal',
          messageType: 'bootnotification',
          lastConnection: new Date()
        },
        {
          id: 'CHG003',
          name: '부산역 충전소',
          location: '부산광역시 해운대구',
          status: 'disconnected',
          lastConnection: new Date(Date.now() - 3600000)
        }
      ];
      
      const normal = dummyData.filter(charger => charger.status === 'normal');
      const disconnected = dummyData.filter(charger => charger.status === 'disconnected');
      
      setNormalChargers(normal);
      setDisconnectedChargers(disconnected);
      setLastUpdated(new Date());
      setCountdown(900);
    } finally {
      setIsLoading(false);
    }
  };

  // 15분마다 fetchChargerData 실행
  useEffect(() => {
    fetchChargerData();

    const interval = setInterval(() => {
      fetchChargerData();
    }, 900000); // 15분(900000ms)마다 실행

    return () => clearInterval(interval);
  }, []);

  // 1초마다 countdown 감소
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 검색어 변경 핸들러
  const handleSearchChange = (type: 'normal' | 'disconnected', value: string) => {
    setSearchTerm(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // 필터 변경 핸들러
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 필터링된 데이터 반환 함수
  const getFilteredData = (data: Charger[], type: 'normal' | 'disconnected') => {
    return data.filter(charger => {
      const searchMatch =
        charger.name.toLowerCase().includes(searchTerm[type].toLowerCase()) ||
        charger.location.toLowerCase().includes(searchTerm[type].toLowerCase()) ||
        charger.id.toLowerCase().includes(searchTerm[type].toLowerCase());

      const filterMatch =
        (!filters.city || charger.location.includes(filters.city)) &&
        (!filters.district || charger.location.includes(filters.district)) &&
        (!filters.subDistrict || charger.location.includes(filters.subDistrict));

      return searchMatch && filterMatch;
    });
  };

  // 통계 카드 컴포넌트
  const StatCard = ({ title, value, icon, color, trend, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend: boolean;
    subtitle: string;
  }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-center mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color }}>
          {icon}
        </div>
        {trend && <TrendingUp className="w-4 h-4 text-green-500" />}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );

  // 필터 패널 컴포넌트
  const FilterPanel = () => (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all duration-300 ${
      showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
    }`}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">필터</h3>
        <button 
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => setShowFilters(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">시/도</label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            >
              <option value="">전체</option>
              <option value="서울특별시">서울특별시</option>
              <option value="부산광역시">부산광역시</option>
              <option value="인천광역시">인천광역시</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">구/군</label>
            <select
              value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            >
              <option value="">전체</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">동/읍/면</label>
            <select
              value={filters.subDistrict}
              onChange={(e) => handleFilterChange('subDistrict', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all duration-200"
            >
              <option value="">전체</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
          <div className="flex gap-2 flex-wrap">
            {filters.city && (
              <span className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                {filters.city}
                <button onClick={() => handleFilterChange('city', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
            onClick={() => setFilters({ city: '', district: '', subDistrict: '' })}
          >
            필터 초기화
          </button>
        </div>
      </div>
    </div>
  );

  // 데이터 테이블 컴포넌트
  const DataTable = ({ title, data, icon, colorClass, type }: {
    title: string;
    data: Charger[];
    icon: React.ReactNode;
    colorClass: string;
    type: 'normal' | 'disconnected';
  }) => {
    const filteredData = getFilteredData(data, type);

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colorClass}20` }}>
              <div style={{ color: colorClass }}>{icon}</div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <span className="text-sm text-gray-500">({filteredData.length})</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl focus-within:border-blue-500 transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm[type]}
              onChange={(e) => handleSearchChange(type, e.target.value)}
              className="border-none outline-none text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">충전소 ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">충전소 이름</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">위치</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">메시지 타입</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">최종 연결</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((charger) => (
                <tr key={charger.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-blue-500 font-semibold">{charger.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{charger.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {charger.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {type === 'normal' ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        charger.messageType === 'bootnotification' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {charger.messageType === 'bootnotification' ? '부트 알림' : '하트비트'}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      {charger.lastConnection.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 text-sm font-medium ${
                      type === 'normal' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        type === 'normal' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {type === 'normal' ? '정상' : '연결 끊김'}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4 text-gray-400">
                      <Activity className="w-12 h-12" />
                      <p className="text-lg font-medium">데이터가 없습니다</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 업데이트 상태 컴포넌트
  const UpdateStatus = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    
    return (
      <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>마지막 업데이트: {lastUpdated ? lastUpdated.toLocaleTimeString() : '데이터 없음'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4" />
            <span>다음 업데이트까지: {minutes}분 {seconds}초</span>
          </div>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={fetchChargerData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? '업데이트 중...' : '지금 업데이트'}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* 상단 네비게이션 바 */}
      <TopNavbar />
      
      <div className="flex">
        {/* 좌측 사이드바 */}
          <Sidebar />

      {/* 모바일 사이드바 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">CSMS</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
                  <Home className="w-5 h-5" />
                  대시보드
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
                  <BarChart3 className="w-5 h-5" />
                  분석
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
                  <MapPin className="w-5 h-5" />
                  지도
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
                  <Settings className="w-5 h-5" />
                  설정
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

        {/* 메인 콘텐츠 영역 */}
        <div className="flex-1 flex flex-col transition-all duration-300" style={{marginLeft: sidebarCollapsed ? '80px' : '256px', marginTop: '64px'}}>
        {/* 상단 헤더 (모바일용) */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          {/* 헤더 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">충전소 관리 대시보드</h1>
              <p className="text-gray-600">실시간 충전소 상태 모니터링</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 px-4 py-2 gradient-primary text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                필터
              </button>
              <UpdateStatus />
            </div>
          </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="총 충전소"
              value={normalChargers.length + disconnectedChargers.length}
              icon={<Battery className="w-6 h-6" />}
              color="#58a6ff"
              trend={true}
              subtitle="전체 충전소 수"
            />
        <StatCard
          title="정상 운영"
          value={normalChargers.length}
          icon={<Zap className="w-6 h-6" />}
          color="#22c55e"
          trend={true}
          subtitle="정상 상태 충전소"
        />
        <StatCard
          title="연결 끊김"
          value={disconnectedChargers.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="#ef4444"
          trend={false}
          subtitle="연결 끊긴 충전소"
        />
        <StatCard
          title="운영률"
          value={`${normalChargers.length > 0 ? Math.round((normalChargers.length / (normalChargers.length + disconnectedChargers.length)) * 100) : 0}%`}
          icon={<Activity className="w-6 h-6" />}
          color="#8b5cf6"
          trend={true}
          subtitle="정상 운영 비율"
        />
      </div>

      {/* 데이터 테이블 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <DataTable 
          title="정상 충전소" 
          data={normalChargers} 
          icon={<Zap className="w-5 h-5" />} 
          colorClass="#22c55e" 
          type="normal" 
        />
        <DataTable 
          title="연결 끊긴 충전소" 
          data={disconnectedChargers} 
          icon={<AlertTriangle className="w-5 h-5" />} 
          colorClass="#ef4444" 
          type="disconnected" 
        />
      </div>

      {/* 시각화 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gray-50">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">충전소 위치</h3>
          </div>
          <div className="h-96">
            <MapComponent />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex items-center gap-3 p-6 border-b border-gray-200 bg-gray-50">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">사용량 통계</h3>
          </div>
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
              <Activity className="w-12 h-12" />
              <p className="text-lg font-medium">차트 데이터 준비 중...</p>
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
