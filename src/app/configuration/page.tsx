'use client';

import { useState, useEffect } from 'react';
import {
  Power,
  Search,
  Zap,
  Shield,
  Link,
  BarChart3,
  Cpu,
  AlertTriangle,
  Activity,
  Calendar,
  MapPin as Location
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import PageHeader from '@/components/PageHeader';
import { useSidebar } from '@/contexts/SidebarContext';

interface ChargingStation {
  stationName: string;
  region: string;
  address: string;
  stationId: string;
  status: 'Online' | 'Offline';
  updateTime: string;
}

export default function ConfigurationPage() {
  const { sidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'location' | 'station' | 'id'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'region' | 'status' | 'time'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // API를 통한 데이터 로드
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/chargers');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const stationData: ChargingStation[] = await response.json();
        
        setStations(stationData);
        setFilteredStations(stationData);
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  // 검색 및 필터링 함수
  const filterAndSearchStations = () => {
    let filtered = [...stations];

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(station => {
        const searchLower = searchTerm.toLowerCase();
        switch (selectedFilter) {
          case 'location':
            return station.region.toLowerCase().includes(searchLower) || 
                   station.address.toLowerCase().includes(searchLower);
          case 'station':
            return station.stationName.toLowerCase().includes(searchLower);
          case 'id':
            return station.stationId.toLowerCase().includes(searchLower);
          default:
            return station.stationName.toLowerCase().includes(searchLower) ||
                   station.region.toLowerCase().includes(searchLower) ||
                   station.address.toLowerCase().includes(searchLower) ||
                   station.stationId.toLowerCase().includes(searchLower);
        }
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortBy) {
        case 'name':
          aValue = a.stationName;
          bValue = b.stationName;
          break;
        case 'region':
          aValue = a.region;
          bValue = b.region;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'time':
          aValue = new Date(a.updateTime).getTime();
          bValue = new Date(b.updateTime).getTime();
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredStations(filtered);
  };

  // 검색어나 필터가 변경될 때마다 필터링 실행
  useEffect(() => {
    filterAndSearchStations();
  }, [searchTerm, selectedFilter, sortBy, sortOrder, stations]);

  // 필터 변경 핸들러
  const handleFilterChange = (filter: 'all' | 'location' | 'station' | 'id') => {
    setSelectedFilter(filter);
    setShowFilter(false);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (sort: 'name' | 'region' | 'status' | 'time') => {
    if (sortBy === sort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sort);
      setSortOrder('asc');
    }
    setShowSort(false);
  };

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
            marginTop: 'var(--top-navbar-height, 64px)',
            height: 'calc(100vh - var(--top-navbar-height, 64px))',
            '--sidebar-width': sidebarCollapsed ? '80px' : '256px'
          } as React.CSSProperties}
        >
          {/* 상단 제목 - 고정 */}
          <PageHeader 
            showSearch={true}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isLoading={isLoading}
            onRefresh={() => setIsLoading(true)}
            showFilter={showFilter}
            onFilterToggle={() => setShowFilter(!showFilter)}
            showSort={showSort}
            onSortToggle={() => setShowSort(!showSort)}
            showMap={showMap}
            onMapToggle={() => setShowMap(!showMap)}
            totalCount={stations.length}
            selectedStation={selectedStation}
            selectedFilter={selectedFilter}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            stations={stations}
            onStationSelect={setSelectedStation}
          />
          
          {/* 메인 콘텐츠 */}
          <div className="flex-1 overflow-hidden">
            <div className="bg-white shadow-sm border-t-0 border-b border-gray-200 h-full flex">
              {/* 충전소 목록 및 Configuration */}
              <div className="flex-1 flex flex-col">
                {/* 충전소 상태 정보 */}
                <div className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Station ID</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{selectedStation?.stationId||'No ID'}</p>                        
                      </div>
                      
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Location className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Address</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{selectedStation?.address || 'No address'}</p>
                        <p className="text-sm text-gray-500 mt-1">{selectedStation?.region || 'No region'}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Status</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-sm font-medium text-gray-900 ${selectedStation?.status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedStation?.status || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500">status</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div className={`h-2 rounded-full ${selectedStation?.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`} 
                               style={{width: selectedStation?.status === 'Online' ? '100%' : '0%'}}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Usage Analytics</h4>
                        <span className="text-sm text-gray-500">Real-time data</span>
                      </div>
                      <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        <div className="text-center">
                          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Chart visualization area</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration 섹션 */}
                <div className="flex-1 p-4 lg:p-6">
                  <div className="text-center py-6 lg:py-8">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                      <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm lg:text-lg">기능을 선택하세요</p>
                    <p className="text-gray-400 text-xs lg:text-sm mt-1">우측 Functional block에서 기능을 클릭하세요</p>
                  </div>
                </div>
              </div>

              {/* Operation 패널 */}
              <div className="w-80 border-l border-gray-200 flex flex-col">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <h2 className="text-sm lg:text-base font-semibold text-gray-900">Operation</h2>
                </div>
                
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                  <div className="space-y-2">
                    {/* Acess & Session */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Link className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Acess & Session</span>
                    </button>

                    {/* Power & Load */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Zap className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Power & Load</span>
                    </button>

                    {/* Metering & Reports */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Activity className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Metering & Reports</span>
                    </button>

                    {/* Firmware & Software */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Cpu className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Firmware & Software</span>
                    </button>

                    {/* Security */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Shield className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Security</span>
                    </button>

                    {/* Safety */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <AlertTriangle className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Safety</span>
                    </button>

                    {/* Schedules */}
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group">
                      <Calendar className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">Schedules</span>
                    </button>
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