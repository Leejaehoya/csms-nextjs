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
import MeteringReportsPanel from '@/components/ConfigurationPanels/MeteringReportsPanel';
import { useSidebar } from '@/contexts/SidebarContext';
import { chargerService, ChargingStation, Evse, Ess } from '@/services/chargerService';

// Spring Boot API에서 받아오는 데이터를 기존 형식으로 변환
interface ChargingStationLegacy {
  stationName: string;
  region: string;
  address: string;
  stationId: string;
  status: 'Online' | 'Offline';
  updateTime: string;
  latitude?: number;
  longitude?: number;
  evseCount?: number;
  stationLoadKw?: number;
}

export default function ConfigurationPage() {
  const { sidebarCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStationLegacy | null>(null);
  const [stations, setStations] = useState<ChargingStationLegacy[]>([]);
  const [filteredStations, setFilteredStations] = useState<ChargingStationLegacy[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'location' | 'station' | 'id'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'region' | 'status' | 'time'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // EVSE 상태 관리
  const [evses, setEvses] = useState<any[]>([]);
  const [isLoadingEvses, setIsLoadingEvses] = useState(false);
  
  // Connector 상태 관리
  const [connectors, setConnectors] = useState<any[]>([]);
  const [isLoadingConnectors, setIsLoadingConnectors] = useState(false);
  
  // ESS 상태 관리
  const [essList, setEssList] = useState<Ess[]>([]);
  const [isLoadingEss, setIsLoadingEss] = useState(false);

  // Spring Boot API 데이터를 기존 형식으로 변환하는 함수
  const convertToLegacyFormat = (station: ChargingStation): ChargingStationLegacy => {
    return {
      stationName: station.stationAlias,
      region: station.roadAddress.split(' ')[0] || '',
      address: station.roadAddress,
      stationId: station.stationId.toString(),
      status: station.stationStatus === 'online' ? 'Online' : 'Offline',
      updateTime: station.updateTime,
      latitude: station.latitude,
      longitude: station.longitude,
      evseCount: station.evseCount,
      stationLoadKw: station.stationLoadKw
    };
  };

  // Spring Boot API를 통한 데이터 로드
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        const stationData = await chargerService.getChargers();
        const legacyStations = stationData.map(convertToLegacyFormat);
        
        setStations(legacyStations);
        setFilteredStations(legacyStations);
      } catch (error) {
        console.error('Failed to load stations:', error);
        // Fallback to local API if Spring Boot is not available
        try {
          const response = await fetch('/api/chargers');
          if (response.ok) {
            const fallbackData = await response.json();
            setStations(fallbackData);
            setFilteredStations(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  // 선택된 충전소의 EVSE 데이터 로드
  useEffect(() => {
    const loadEvses = async () => {
      if (!selectedStation) {
        setEvses([]);
        return;
      }

      try {
        setIsLoadingEvses(true);
        const evseData = await chargerService.getEvses(parseInt(selectedStation.stationId));
        setEvses(evseData);
      } catch (error) {
        console.error('Failed to load EVSEs:', error);
        // Fallback to local API
        try {
          const response = await fetch(`/api/chargers/${selectedStation.stationId}/evses`);
          if (response.ok) {
            const fallbackData = await response.json();
            setEvses(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Fallback EVSE API also failed:', fallbackError);
          setEvses([]);
        }
      } finally {
        setIsLoadingEvses(false);
      }
    };

    loadEvses();
  }, [selectedStation]);

  // 선택된 충전소의 ESS 데이터 로드
  useEffect(() => {
    const loadEss = async () => {
      if (!selectedStation) {
        setEssList([]);
        return;
      }

      try {
        setIsLoadingEss(true);
        const essData = await chargerService.getEss(parseInt(selectedStation.stationId));
        setEssList(essData);
      } catch (error) {
        console.error('Failed to load ESS:', error);
        // Fallback to local API
        try {
          const response = await fetch(`/api/chargers/${selectedStation.stationId}/ess`);
          if (response.ok) {
            const fallbackData = await response.json();
            setEssList(fallbackData);
          }
        } catch (fallbackError) {
          console.error('Fallback ESS API also failed:', fallbackError);
          setEssList([]);
        }
      } finally {
        setIsLoadingEss(false);
      }
    };

    loadEss();
  }, [selectedStation]);

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
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* 충전소 상태 정보 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Station Info</span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">ID: {selectedStation?.stationId||'No ID'}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedStation?.stationName || 'No station name'}</p>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStation?.address || 'No address'}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedStation?.region || 'No region'}</p>
                          </div>
                        </div>                      
                      </div>
                      
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">EVSE & ESS</span>
                        </div>
                        
                        {/* EVSE 개수 */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">EVSE Count</span>
                            {isLoadingEvses ? (
                              <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">{evses.length}</span>
                            )}
                          </div>
                        </div>

                        {/* ESS 정보 */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">ESS Status</span>
                            {isLoadingEss ? (
                              <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            ) : (
                              <span className="text-sm font-medium text-gray-900">{essList.length} units</span>
                            )}
                          </div>
                          
                          {/* ESS 상태별 개수 */}
                          {essList.length > 0 && (
                            <div className="space-y-1">
                              {Object.entries(
                                essList.reduce((acc, ess) => {
                                  acc[ess.essStatus] = (acc[ess.essStatus] || 0) + 1;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      status === 'online' ? 'bg-green-500' : 
                                      status === 'offline' ? 'bg-gray-500' : 
                                      status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    <span className="text-xs text-gray-600 capitalize">{status}</span>
                                  </div>
                                  <span className="text-xs font-medium text-gray-900">{count as number}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* ESS 용량 정보 */}
                        {essList.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-500">Total Capacity</span>
                              <span className="text-xs font-medium text-gray-900">
                                {essList.reduce((sum, ess) => sum + (ess.capacityKwh || 0), 0).toFixed(1)} kWh
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Avg SOC</span>
                              <span className="text-xs font-medium text-gray-900">
                                {essList.length > 0 ? 
                                  (essList.reduce((sum, ess) => sum + (ess.socPercent || 0), 0) / essList.length).toFixed(1) + '%' : 
                                  'N/A'
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">Status</span>
                        </div>
                        
                        {/* ESS 충전량 상태 */}
                        <div className="mb-3">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-500">ESS SOC</span>
                            <span className="text-sm font-medium text-gray-900">
                              {essList.length > 0 ? 
                                (essList.reduce((sum, ess) => sum + (ess.socPercent || 0), 0) / essList.length).toFixed(1) + '%' : 
                                'N/A'
                              }
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" 
                              style={{
                                width: essList.length > 0 ? 
                                  `${Math.min(100, Math.max(0, essList.reduce((sum, ess) => sum + (ess.socPercent || 0), 0) / essList.length))}%` : 
                                  '0%'
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* EVSE 상태 */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500">EVSE Status</span>
                            {isLoadingEvses && (
                              <div className="w-3 h-3 border border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            )}
                          </div>
                          {evses.length > 0 ? (
                            <div className="space-y-1">
                              {evses.slice(0, 3).map((evse, index) => (
                                <div key={evse.evse_id} className="flex items-center justify-between">
                                  <span className="text-xs text-gray-600">EVSE {evse.evse_id}</span>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      evse.status === 'available' ? 'bg-green-500' : 
                                      evse.status === 'occupied' ? 'bg-blue-500' : 'bg-red-500'
                                    }`}></div>
                                    <span className={`text-xs font-medium ${
                                      evse.status === 'available' ? 'text-green-600' : 
                                      evse.status === 'occupied' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                      {evse.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {evses.length > 3 && (
                                <p className="text-xs text-gray-400 text-center">
                                  +{evses.length - 3} more EVSEs
                                </p>
                              )}
                            </div>
                          ) : !isLoadingEvses ? (
                            <p className="text-xs text-gray-400">No EVSE data</p>
                          ) : null}
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
                <div className="p-4 lg:p-6">
                  {selectedOperation === 'metering' && selectedStation ? (
                    <MeteringReportsPanel selectedStation={selectedStation} />
                  ) : (
                    <div className="text-center py-6 lg:py-8">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                        <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm lg:text-lg">Select a charging station first</p>
                      <p className="text-gray-400 text-xs lg:text-sm mt-1">Then configure operations in the right Operation Panel</p>
                    </div>
                  )}
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
                    <button 
                      onClick={() => setSelectedOperation('metering')}
                      className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors group ${
                        selectedOperation === 'metering' ? 'bg-indigo-50 text-indigo-700' : ''
                      }`}
                    >
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