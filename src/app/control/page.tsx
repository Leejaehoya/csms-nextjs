'use client';

import { useState, useEffect } from 'react';
import { 
  Zap, 
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import { useSidebar } from '@/contexts/SidebarContext';

interface ChargingStation {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'maintenance';
  power: number;
  current: number;
  voltage: number;
  temperature: number;
  lastUpdate: string;
}

export default function ControlPage() {
  const { sidebarCollapsed } = useSidebar();
  const [stations, setStations] = useState<ChargingStation[]>([
    {
      id: 'CS001',
      name: '서울역 충전소',
      location: '서울특별시 중구',
      status: 'online',
      power: 50.5,
      current: 125.2,
      voltage: 380.0,
      temperature: 45.2,
      lastUpdate: '2024-01-15 14:30:25'
    },
    {
      id: 'CS002',
      name: '강남역 충전소',
      location: '서울특별시 강남구',
      status: 'offline',
      power: 0,
      current: 0,
      voltage: 0,
      temperature: 25.1,
      lastUpdate: '2024-01-15 14:25:10'
    },
    {
      id: 'CS003',
      name: '부산역 충전소',
      location: '부산광역시 동구',
      status: 'maintenance',
      power: 0,
      current: 0,
      voltage: 0,
      temperature: 28.5,
      lastUpdate: '2024-01-15 14:20:45'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'maintenance'>('all');
  const [activeFeatures, setActiveFeatures] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAlphabetical, setIsAlphabetical] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  // 필터링된 충전소 목록
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleFeatureClick = (feature: string) => {
    if (activeFeatures.includes(feature)) {
      // 이미 활성화된 기능이면 비활성화
      setActiveFeatures(activeFeatures.filter(f => f !== feature));
      if (activeTab === feature) {
        setActiveTab(activeFeatures.length > 1 ? activeFeatures[0] : null);
      }
    } else {
      // 새로운 기능 활성화
      setActiveFeatures([...activeFeatures, feature]);
      setActiveTab(feature);
    }
  };

  const toggleAlphabetical = () => {
    setIsAlphabetical(!isAlphabetical);
  };

  const handleStationClick = (stationId: string) => {
    setSelectedStation(selectedStation === stationId ? null : stationId);
  };

  const closeTab = (feature: string) => {
    setActiveFeatures(activeFeatures.filter(f => f !== feature));
    if (activeTab === feature) {
      const remainingFeatures = activeFeatures.filter(f => f !== feature);
      setActiveTab(remainingFeatures.length > 0 ? remainingFeatures[0] : null);
    }
  };

  // 기능 목록 정의 (요청하신 순서)
  const featuresInOrder = [
    'Security',
    'Provisioning', 
    'Authorization',
    'Local Authorization List Management',
    'Transactions',
    'Remote Control',
    'Availability',
    'Reservation',
    'Tariff And Cost',
    'Meter Values',
    'Smart Charging',
    'Firmware Management',
    'Certificate Management',
    'Diagnostics',
    'Display Message',
    'Data Transfer',
    'Bidirectional Power Transfer',
    'DER Control',
    'Battery Swapping'
  ];

  // 정렬된 기능 목록
  const sortedFeatures = isAlphabetical 
    ? [...featuresInOrder].sort() 
    : featuresInOrder;

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

  const renderFeaturePanel = (feature: string) => {
    switch (feature) {
      case 'Authorization':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Authorization</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">ID Token 관리</h4>
                <p className="text-sm text-blue-700">충전소 인증 토큰을 관리합니다.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">권한 설정</h4>
                <p className="text-sm text-green-700">사용자 권한을 설정하고 관리합니다.</p>
              </div>
            </div>
          </div>
        );
      
      case 'Availability':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">충전소 상태</h4>
                <p className="text-sm text-green-700">실시간 충전소 가용성을 확인합니다.</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">예약 관리</h4>
                <p className="text-sm text-yellow-700">충전소 예약 현황을 관리합니다.</p>
              </div>
            </div>
          </div>
        );

      case 'Remote Control':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Remote Control</h3>
            <div className="space-y-3">
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">원격 제어</h4>
                <p className="text-sm text-red-700">충전소를 원격으로 제어합니다.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">시작/중지</h4>
                <p className="text-sm text-blue-700">충전 세션을 원격으로 시작하거나 중지합니다.</p>
              </div>
            </div>
          </div>
        );

      case 'Meter Values':
        return (
          <div className="flex flex-col h-full">
            {/* Transaction Meter Values - 상단 50% */}
            <div className="flex-1 border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Meter Values</h3>
              <div className="space-y-3">
                {/* Transaction Meter Values 설정 항목들 */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'SampledDataTxStartedMeasurands',
                      'SampledDataTxUpdatedMeasurands',
                      'SampledDataTxUpdatedInterval',
                      'SampledDataTxEndedMeasurands',
                      'SampledDataTxEndedInterval',
                      'SampledDataUpstreamMeasurands',
                      'SampledDataUpstreamInterval'
                    ].map((item) => (
                      <button
                        key={item}
                        className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        onClick={() => console.log(`Transaction Meter Values 설정: ${item}`)}
                      >
                        <div className="text-sm font-medium text-gray-900">{item}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Clock-Aligned Meter Values - 하단 50% */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Clock-Aligned Meter Values</h3>
              <div className="space-y-3">
                {/* Clock-Aligned Meter Values 설정 항목들 */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'AlignedDataMeasurands',
                      'AlignedDataInterval',
                      'AlignedDataTxEndedMeasurands',
                      'AlignedDataTxEndedInterval',
                      'AlignedDataSendDuringIdle',
                      'AlignedDataUpstreamMeasurands',
                      'AlignedDataUpstreamInterval'
                    ].map((item) => (
                      <button
                        key={item}
                        className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        onClick={() => console.log(`Clock-Aligned Meter Values 설정: ${item}`)}
                      >
                        <div className="text-sm font-medium text-gray-900">{item}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">{feature}</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600">{feature} 기능이 선택되었습니다.</p>
              <p className="text-sm text-gray-500 mt-2">이 기능의 상세 설정을 여기서 관리할 수 있습니다.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* 상단 네비게이션 바 */}
      <TopNavbar />
      
      <div className="flex flex-1">
        {/* 좌측 사이드바 */}
        <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col transition-all duration-300" style={{marginLeft: sidebarCollapsed ? '80px' : '256px', marginTop: '64px', height: 'calc(100vh - 64px)'}}>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-full">
            {/* 충전소 목록 */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-shrink-0 flex flex-col">
                {/* 검색 및 필터 - 고정 */}
                <div className="mb-6 space-y-4 flex-shrink-0">
                  {/* 검색바와 새로고침 버튼 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="충전소명, 위치, ID로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">총 {filteredStations.length}개</span>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 상태 필터 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setStatusFilter('online')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === 'online'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      온라인
                    </button>
                    <button
                      onClick={() => setStatusFilter('offline')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === 'offline'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      오프라인
                    </button>
                    <button
                      onClick={() => setStatusFilter('maintenance')}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        statusFilter === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      점검중
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto max-h-80">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">검색 결과가 없습니다</p>
                      <p className="text-gray-400 text-sm mt-1">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                    <div
                      key={station.id}
                      onClick={() => handleStationClick(station.id)}
                      className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedStation === station.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{station.name}</h3>
                            <p className="text-sm text-gray-500">{station.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                            {getStatusText(station.status)}
                          </span>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">마지막 업데이트</p>
                            <p className="text-xs text-gray-400">{station.lastUpdate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* Configuration Panel */}
              <div className="mt-6 flex-1 flex flex-col">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      {/* Configuration 제목과 탭들 */}
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                        {activeFeatures.length > 0 && (
                          <div className="flex overflow-x-auto">
                            {activeFeatures.map((feature) => (
                              <button
                                key={feature}
                                onClick={() => setActiveTab(feature)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                  activeTab === feature
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{feature}</span>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      closeTab(feature);
                                    }}
                                    className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* 모두 닫기 버튼 */}
                      {activeFeatures.length > 0 && (
                        <button
                          onClick={() => {
                            setActiveFeatures([]);
                            setActiveTab(null);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          모두 닫기
                        </button>
                      )}
                    </div>
                    
                    {activeFeatures.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-lg">기능을 선택하세요</p>
                        <p className="text-gray-400 text-sm mt-1">우측 Functional block에서 기능을 클릭하세요</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col mt-4">
                        {/* 탭 내용 */}
                        <div className="flex-1 overflow-y-auto">
                          {activeTab && renderFeaturePanel(activeTab)}
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* functional block 패널 */}
            <div className="lg:col-span-1 flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Functional block</h2>
                  <button
                    onClick={toggleAlphabetical}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      isAlphabetical
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isAlphabetical ? "원래 순서로 되돌리기" : "알파벳 순으로 정렬"}
                  >
                    A-Z
                  </button>
                </div>
                
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {sortedFeatures.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => handleFeatureClick(feature)}
                      className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-colors border ${
                        activeFeatures.includes(feature)
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
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
