'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Monitor,
  Plug,
  Power,
  Battery,
  MapPin as Location,
  FileText,
  Search,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Map
} from 'lucide-react';

const navigationItems = [
  { 
    icon: Monitor, 
    label: 'Monitoring', 
    path: '/monitoring'
  },
  { 
    icon: Plug, 
    label: 'Availability', 
    path: '/availability'
  },
  { 
    icon: Power, 
    label: 'Configuration', 
    path: '/configuration'
  },
  { 
    icon: FileText, 
    label: 'Logs', 
    path: '/logs'
  },
  { 
    icon: Battery, 
    label: 'ESS', 
    path: '/ess'
  },
  { 
    icon: Location, 
    label: 'Utility', 
    path: '/utility'
  }
];

interface ChargingStation {
  stationName: string;
  region: string;
  address: string;
  stationId: string;
  status: 'Online' | 'Offline';
  updateTime: string;
}

interface PageHeaderProps {
  showSearch?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  showFilter?: boolean;
  onFilterToggle?: () => void;
  showSort?: boolean;
  onSortToggle?: () => void;
  showMap?: boolean;
  onMapToggle?: () => void;
  totalCount?: number;
  selectedStation?: ChargingStation | null;
  selectedFilter?: 'all' | 'location' | 'station' | 'id';
  onFilterChange?: (filter: 'all' | 'location' | 'station' | 'id') => void;
  sortBy?: 'name' | 'region' | 'status' | 'time';
  onSortChange?: (sort: 'name' | 'region' | 'status' | 'time') => void;
  stations?: ChargingStation[];
  onStationSelect?: (station: ChargingStation) => void;
}

export default function PageHeader({ 
  showSearch = false,
  searchTerm = '',
  onSearchChange,
  isLoading = false,
  onRefresh,
  showFilter = false,
  onFilterToggle,
  showSort = false,
  onSortToggle,
  showMap = false,
  onMapToggle,
  totalCount = 0,
  selectedStation = null,
  selectedFilter = 'all',
  onFilterChange,
  sortBy = 'name',
  onSortChange,
  stations = [],
  onStationSelect
}: PageHeaderProps) {
  const pathname = usePathname();
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const currentPage = navigationItems.find(item => item.path === pathname);
  const pageTitle = currentPage?.label || 'Page';

  // 검색어에 따라 필터링된 충전소 목록
  const filteredStations = stations.filter(station => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return station.stationName.toLowerCase().includes(searchLower) ||
           station.region.toLowerCase().includes(searchLower) ||
           station.address.toLowerCase().includes(searchLower) ||
           station.stationId.toLowerCase().includes(searchLower);
  });

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 h-16 flex items-center flex-shrink-0">
      {/* 왼쪽: 페이지 제목 */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
      </div>
      
      {/* 가운데: 검색 기능 */}
      {showSearch && (
        <div className="flex-1 flex flex-col flex justify-center">
          <div className="flex items-center gap-2">
            {/* 지도 버튼 */}
            <button 
              onClick={onMapToggle}
              className={`p-2 rounded-lg transition-colors ${
                showMap 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
            {/* 검색바 */}
            <div className="w-3/3 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by station name, location, or ID..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="w-full pl-8 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm"
              />
              
              {/* 검색 드롭다운 */}
              {showSearchDropdown && filteredStations.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="py-1">
                    {filteredStations.map((station) => (
                      <button
                        key={station.stationId}
                        onClick={() => {
                          onStationSelect?.(station);
                          setShowSearchDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{station.stationName}</h4>
                            <p className="text-xs text-gray-500 mt-1">{station.region} • {station.stationId}</p>
                            <p className="text-xs text-gray-400 mt-1 truncate">{station.address}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              station.status === 'Online' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {station.status}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* 필터 버튼 */}
            <div className="relative">
              <button 
                onClick={onFilterToggle}
                className={`p-2 rounded-lg transition-colors ${
                  showFilter || selectedFilter !== 'all'
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
              </button>
              
              {/* 필터 드롭다운 */}
              {showFilter && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <button
                      onClick={() => onFilterChange?.('all')}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedFilter === 'all' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => onFilterChange?.('location')}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedFilter === 'location' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      Location
                    </button>
                    <button
                      onClick={() => onFilterChange?.('station')}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedFilter === 'station' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      Station
                    </button>
                    <button
                      onClick={() => onFilterChange?.('id')}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                        selectedFilter === 'id' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                      }`}
                    >
                      ID
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 오른쪽: 검색 결과와 새로고침 버튼 */}
      {showSearch && (
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-600 font-medium">Selected:</span>
              {selectedStation ? (
                <span className="text-sm text-indigo-800 font-semibold">{selectedStation.stationId}</span>
              ) : (
                <span className="text-sm text-gray-500 italic">Nothing selected</span>
              )}
            </div>
            <span className="text-sm text-gray-500">Total {totalCount}</span>
            <button 
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
