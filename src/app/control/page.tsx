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

interface SelectedVariable {
  variable: string;
  dataType: string;
}

export default function ControlPage() {
  const { sidebarCollapsed } = useSidebar();
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [variableDataTypes, setVariableDataTypes] = useState<{[key: string]: string}>({});
  const [addedVariables, setAddedVariables] = useState<SelectedVariable[]>([]);
  
  // Interval Variables 상태
  const [selectedIntervalVariables, setSelectedIntervalVariables] = useState<string[]>([]);
  const [intervalVariableTypes, setIntervalVariableTypes] = useState<{[key: string]: string}>({});
  const [intervalVariableValues, setIntervalVariableValues] = useState<{[key: string]: string}>({});
  const [addedIntervalVariables, setAddedIntervalVariables] = useState<{[key: string]: {type: string, value: string}}[]>([]);
  
  // Clock-Aligned Meter Values 상태
  const [selectedClockAlignedVariables, setSelectedClockAlignedVariables] = useState<string[]>([]);
  const [clockAlignedVariableTypes, setClockAlignedVariableTypes] = useState<{[key: string]: string}>({});
  const [clockAlignedVariableValues, setClockAlignedVariableValues] = useState<{[key: string]: string}>({});
  const [addedClockAlignedVariables, setAddedClockAlignedVariables] = useState<{[key: string]: {type: string, value: string}}[]>([]);
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
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Authorization</h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="p-3 lg:p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1 lg:mb-2 text-sm lg:text-base">ID Token 관리</h4>
                <p className="text-xs lg:text-sm text-blue-700">충전소 인증 토큰을 관리합니다.</p>
              </div>
              <div className="p-3 lg:p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1 lg:mb-2 text-sm lg:text-base">권한 설정</h4>
                <p className="text-xs lg:text-sm text-green-700">사용자 권한을 설정하고 관리합니다.</p>
              </div>
            </div>
          </div>
        );
      
      case 'Availability':
        return (
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Availability</h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="p-3 lg:p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1 lg:mb-2 text-sm lg:text-base">충전소 상태</h4>
                <p className="text-xs lg:text-sm text-green-700">실시간 충전소 가용성을 확인합니다.</p>
              </div>
              <div className="p-3 lg:p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-1 lg:mb-2 text-sm lg:text-base">예약 관리</h4>
                <p className="text-xs lg:text-sm text-yellow-700">충전소 예약 현황을 관리합니다.</p>
              </div>
            </div>
          </div>
        );

      case 'Remote Control':
        return (
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">Remote Control</h3>
            <div className="space-y-2 lg:space-y-3">
              <div className="p-3 lg:p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-1 lg:mb-2 text-sm lg:text-base">원격 제어</h4>
                <p className="text-xs lg:text-sm text-red-700">충전소를 원격으로 제어합니다.</p>
              </div>
              <div className="p-3 lg:p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1 lg:mb-2 text-sm lg:text-base">시작/중지</h4>
                <p className="text-xs lg:text-sm text-blue-700">충전 세션을 원격으로 시작하거나 중지합니다.</p>
              </div>
            </div>
          </div>
        );

      case 'Meter Values':
        return (
          <div className="flex flex-col h-full">
            {/* Transaction Meter Values - 상단 50% */}
            <div className="flex-1 border-b border-gray-200 pb-2 lg:pb-3 mb-2 lg:mb-3">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <h3 className="text-sm lg:text-base font-semibold text-gray-900">Transaction Meter Values</h3>
                <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                  + SampledDataCtrlr 추가
                </button>
              </div>
              
              <div className="space-y-2 lg:space-y-3">
                {/* SampledDataCtrlr 컴포넌트 설정 */}
                <div className="bg-gray-50 from-indigo-50 border border-indigo-200 rounded-lg p-3 lg:p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs lg:text-sm font-semibold text-indigo-900">SampledDataCtrlr</h4>
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-800">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Variable 선택 */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Variable 선택</label>
                      <select
                        value=""
                        onChange={(e) => {
                          const selectedVariable = e.target.value;
                          if (selectedVariable && !selectedVariables.includes(selectedVariable)) {
                            setSelectedVariables(prev => [...prev, selectedVariable]);
                          }
                        }}
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="">Variable을 선택하세요</option>
                        {[
                          'SampledDataTxStartedMeasurands',
                          'SampledDataTxUpdatedMeasurands',
                          'SampledDataTxEndedMeasurands'
                        ].filter(variable => !selectedVariables.includes(variable))
                        .map((variable) => (
                          <option key={variable} value={variable}>
                            {variable}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 데이터 타입 선택 */}
                    {selectedVariables.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">데이터 타입 선택</label>
                        <div className="space-y-2">
                          {selectedVariables.sort().map((variable) => (
                            <div key={variable} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                <span className="text-xs font-medium text-indigo-900 min-w-0 flex-1 truncate">{variable}</span>
                              </div>
                              <select
                                value={variableDataTypes[variable] || ''}
                                onChange={(e) => setVariableDataTypes(prev => ({
                                  ...prev,
                                  [variable]: e.target.value
                                }))}
                                className="text-xs border border-gray-300 rounded px-3 py-2 bg-white flex-1 min-w-0 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                              >
                                <option value="">데이터 타입 선택</option>
                                {[
                                  'Current.Export',
                                  'Current.Export.Minimum',
                                  'Current.Export.Offered',
                                  'Current.Import',
                                  'Current.Import.Minimum',
                                  'Current.Import.Offered',
                                  'Current.Offered',
                                  'Display.BatteryEnergyCapacity',
                                  'Display.ChargingComplete',
                                  'Display.InletHot',
                                  'Display.MaximumSOC',
                                  'Display.MinimumSOC',
                                  'Display.PresentSOC',
                                  'Display.RemainingTimeToMaximumSOC',
                                  'Display.RemainingTimeToMinimumSOC',
                                  'Display.RemainingTimeToTargetSOC',
                                  'Display.TargetSOC',
                                  'Energy.Active.Import.CableLoss',
                                  'Energy.Active.Import.Interval',
                                  'Energy.Active.Import.LocalGeneration.Register',
                                  'Energy.Active.Import.Register',
                                  'Energy.Active.Net',
                                  'Energy.Active.SetPpoint.Interval',
                                  'Energy.Apparent.Export',
                                  'Energy.Apparent.Import',
                                  'Energy.Apparent.Net',
                                  'Energy.Reactive.Export.Interval',
                                  'Energy.Reactive.Export.Register',
                                  'Energy.Reactive.Import.Interval',
                                  'Energy.Reactive.Import.Register',
                                  'Energy.Reactive.Net',
                                  'EnergyRequest.Bulk',
                                  'EnergyRequest.Maximum',
                                  'EnergyRequest.Maximum.V2X',
                                  'EnergyRequest.Minimum',
                                  'EnergyRequest.Minimum.V2X',
                                  'EnergyRequest.Target',
                                  'Frequency',
                                  'Power.Active.Export',
                                  'Power.Active.Import',
                                  'Power.Active.Residual',
                                  'Power.Active.Setpoint',
                                  'Power.Export.Minimum',
                                  'Power.Export.Offered',
                                  'Power.Factor',
                                  'Power.Import.Minimum',
                                  'Power.Import.Offered',
                                  'Power.Offered',
                                  'Power.Reactive.Epxort',
                                  'Power.Reactive.Import',
                                  'SoC',
                                  'Voltage',
                                  'Voltage.Maximum',
                                  'Voltage.Minimum'
                                ].map((dataType) => (
                                  <option key={dataType} value={dataType}>
                                    {dataType}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => {
                                  setSelectedVariables(prev => prev.filter(item => item !== variable));
                                  setVariableDataTypes(prev => {
                                    const newDataTypes = { ...prev };
                                    delete newDataTypes[variable];
                                    return newDataTypes;
                                  });
                                }}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newVariables = selectedVariables
                              .filter(variable => variableDataTypes[variable])
                              .map(variable => ({
                                variable,
                                dataType: variableDataTypes[variable]
                              }));
                            setAddedVariables(prev => [...prev, ...newVariables]);
                            setSelectedVariables([]);
                            setVariableDataTypes({});
                          }}
                          disabled={!selectedVariables.some(variable => variableDataTypes[variable])}
                          className="w-full text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded p-2 transition-colors"
                        >
                          선택된 Variable 추가
                        </button>
                      </div>
                    )}

                    {/* 추가된 Variables */}
                    {addedVariables.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">추가된 Variables</label>
                        <div className="space-y-1">
                          {addedVariables
                            .sort((a, b) => a.variable.localeCompare(b.variable))
                            .map((item, index) => (
                            <div key={`${item.variable}-${index}`} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                  <span className="text-xs font-medium text-green-900 truncate">{item.variable}</span>
                                  <span className="text-xs text-green-600 flex-shrink-0">→</span>
                                  <span className="text-xs text-green-700 truncate">{item.dataType}</span>
                                </div>
                              </div>
                              <button 
                                className="text-xs text-green-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                                onClick={() => setAddedVariables(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interval Variables */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">Interval Variables</label>
                      
                      {/* Variable 선택 */}
                      <select
                        value=""
                        onChange={(e) => {
                          const selectedVariable = e.target.value;
                          if (selectedVariable && !selectedIntervalVariables.includes(selectedVariable)) {
                            setSelectedIntervalVariables(prev => [...prev, selectedVariable]);
                          }
                        }}
                        className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="">Interval Variable을 선택하세요</option>
                        {[
                          'SampledDataTxUpdatedInterval',
                          'SampledDataTxEndedInterval'
                        ].filter(variable => !selectedIntervalVariables.includes(variable))
                        .map((variable) => (
                          <option key={variable} value={variable}>
                            {variable}
                          </option>
                        ))}
                      </select>

                      {/* 선택된 Variables */}
                      {selectedIntervalVariables.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-700">선택된 Interval Variables</label>
                          <div className="space-y-2">
                            {selectedIntervalVariables.sort().map((variable) => (
                              <div key={variable} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                                  <span className="text-xs font-medium text-indigo-900 min-w-0 flex-1 truncate">{variable}</span>
                                </div>
                                <div className="flex gap-2 flex-1">
                                  <select
                                    value={intervalVariableTypes[variable] || ''}
                                    onChange={(e) => setIntervalVariableTypes(prev => ({
                                      ...prev,
                                      [variable]: e.target.value
                                    }))}
                                    className="text-xs border border-gray-300 rounded px-3 py-2 bg-white flex-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                  >
                                    <option value="">타입 선택</option>
                                    <option value="Clock">Clock</option>
                                    <option value="Sample.Periodic">Sample.Periodic</option>
                                    <option value="Sample.Clock">Sample.Clock</option>
                                  </select>
                                  <input 
                                    type="number"
                                    placeholder="초"
                                    value={intervalVariableValues[variable] || ''}
                                    onChange={(e) => setIntervalVariableValues(prev => ({
                                      ...prev,
                                      [variable]: e.target.value
                                    }))}
                                    className="text-xs border border-gray-300 rounded px-3 py-2 w-20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                  />
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedIntervalVariables(prev => prev.filter(item => item !== variable));
                                    setIntervalVariableTypes(prev => {
                                      const newTypes = { ...prev };
                                      delete newTypes[variable];
                                      return newTypes;
                                    });
                                    setIntervalVariableValues(prev => {
                                      const newValues = { ...prev };
                                      delete newValues[variable];
                                      return newValues;
                                    });
                                  }}
                                  className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              const newVariables = selectedIntervalVariables
                                .filter(variable => intervalVariableTypes[variable] && intervalVariableValues[variable])
                                .map(variable => ({
                                  [variable]: {
                                    type: intervalVariableTypes[variable],
                                    value: intervalVariableValues[variable]
                                  }
                                }));
                              setAddedIntervalVariables(prev => [...prev, ...newVariables]);
                              setSelectedIntervalVariables([]);
                              setIntervalVariableTypes({});
                              setIntervalVariableValues({});
                            }}
                            disabled={!selectedIntervalVariables.some(variable => intervalVariableTypes[variable] && intervalVariableValues[variable])}
                            className="w-full text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded p-2 transition-colors"
                          >
                            선택된 Interval Variables 추가
                          </button>
                        </div>
                      )}

                      {/* 추가된 Interval Variables */}
                      {addedIntervalVariables.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-700">추가된 Interval Variables</label>
                          <div className="space-y-1">
                            {addedIntervalVariables.map((item, index) => {
                              const variable = Object.keys(item)[0];
                              const { type, value } = item[variable];
                              return (
                                <div key={`${variable}-${index}`} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                      <span className="text-xs font-medium text-green-900 truncate">{variable}</span>
                                      <span className="text-xs text-green-600 flex-shrink-0">→</span>
                                      <span className="text-xs text-green-700 truncate">{type}</span>
                                      <span className="text-xs text-green-600 flex-shrink-0">({value}초)</span>
                                    </div>
                                  </div>
                                  <button 
                                    className="text-xs text-green-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                                    onClick={() => setAddedIntervalVariables(prev => prev.filter((_, i) => i !== index))}
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <button className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                      저장
                    </button>
                    <button className="text-xs text-gray-600 hover:text-gray-800">
                      취소
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clock-Aligned Meter Values - 하단 50% */}
            <div className="flex-1">
              <h3 className="text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3">Clock-Aligned Meter Values</h3>
              <div className="space-y-3">
                {/* Clock-Aligned Meter Values 선택 */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Clock-Aligned Meter Values</label>
                  
                  {/* Variable 선택 */}
                  <select
                    value=""
                    onChange={(e) => {
                      const selectedVariable = e.target.value;
                      if (selectedVariable && !selectedClockAlignedVariables.includes(selectedVariable)) {
                        setSelectedClockAlignedVariables(prev => [...prev, selectedVariable]);
                      }
                    }}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  >
                    <option value="">Clock-Aligned Variable을 선택하세요</option>
                    {[
                      'AlignedDataMeasurands',
                      'AlignedDataInterval',
                      'AlignedDataTxEndedMeasurands',
                      'AlignedDataTxEndedInterval',
                      'AlignedDataSendDuringIdle',
                      'AlignedDataUpstreamMeasurands',
                      'AlignedDataUpstreamInterval'
                    ].filter(variable => !selectedClockAlignedVariables.includes(variable))
                    .map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </select>

                  {/* 선택된 Variables */}
                  {selectedClockAlignedVariables.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">선택된 Clock-Aligned Variables</label>
                      <div className="space-y-2">
                        {selectedClockAlignedVariables.sort().map((variable) => (
                          <div key={variable} className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
                              <span className="text-xs font-medium text-indigo-900 min-w-0 flex-1 truncate">{variable}</span>
                            </div>
                            <div className="flex gap-2 flex-1">
                              <select
                                value={clockAlignedVariableTypes[variable] || ''}
                                onChange={(e) => setClockAlignedVariableTypes(prev => ({
                                  ...prev,
                                  [variable]: e.target.value
                                }))}
                                className="text-xs border border-gray-300 rounded px-3 py-2 bg-white flex-1 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                              >
                                <option value="">타입 선택</option>
                                <option value="Clock">Clock</option>
                                <option value="Sample.Periodic">Sample.Periodic</option>
                                <option value="Sample.Clock">Sample.Clock</option>
                              </select>
                              <input 
                                type="number"
                                placeholder="초"
                                value={clockAlignedVariableValues[variable] || ''}
                                onChange={(e) => setClockAlignedVariableValues(prev => ({
                                  ...prev,
                                  [variable]: e.target.value
                                }))}
                                className="text-xs border border-gray-300 rounded px-3 py-2 w-20 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                              />
                            </div>
                            <button
                              onClick={() => {
                                setSelectedClockAlignedVariables(prev => prev.filter(item => item !== variable));
                                setClockAlignedVariableTypes(prev => {
                                  const newTypes = { ...prev };
                                  delete newTypes[variable];
                                  return newTypes;
                                });
                                setClockAlignedVariableValues(prev => {
                                  const newValues = { ...prev };
                                  delete newValues[variable];
                                  return newValues;
                                });
                              }}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          const newVariables = selectedClockAlignedVariables
                            .filter(variable => clockAlignedVariableTypes[variable] && clockAlignedVariableValues[variable])
                            .map(variable => ({
                              [variable]: {
                                type: clockAlignedVariableTypes[variable],
                                value: clockAlignedVariableValues[variable]
                              }
                            }));
                          setAddedClockAlignedVariables(prev => [...prev, ...newVariables]);
                          setSelectedClockAlignedVariables([]);
                          setClockAlignedVariableTypes({});
                          setClockAlignedVariableValues({});
                        }}
                        disabled={!selectedClockAlignedVariables.some(variable => clockAlignedVariableTypes[variable] && clockAlignedVariableValues[variable])}
                        className="w-full text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded p-2 transition-colors"
                      >
                        선택된 Clock-Aligned Variables 추가
                      </button>
                    </div>
                  )}

                  {/* 추가된 Clock-Aligned Variables */}
                  {addedClockAlignedVariables.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-700">추가된 Clock-Aligned Variables</label>
                      <div className="space-y-1">
                        {addedClockAlignedVariables.map((item, index) => {
                          const variable = Object.keys(item)[0];
                          const { type, value } = item[variable];
                          return (
                            <div key={`${variable}-${index}`} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                  <span className="text-xs font-medium text-green-900 truncate">{variable}</span>
                                  <span className="text-xs text-green-600 flex-shrink-0">→</span>
                                  <span className="text-xs text-green-700 truncate">{type}</span>
                                  <span className="text-xs text-green-600 flex-shrink-0">({value}초)</span>
                                </div>
                              </div>
                              <button 
                                className="text-xs text-green-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                                onClick={() => setAddedClockAlignedVariables(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3 lg:space-y-4">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">{feature}</h3>
            <div className="p-3 lg:p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm lg:text-base">{feature} 기능이 선택되었습니다.</p>
              <p className="text-xs lg:text-sm text-gray-500 mt-1 lg:mt-2">이 기능의 상세 설정을 여기서 관리할 수 있습니다.</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 h-full">
            {/* 충전소 목록 */}
            <div className="lg:col-span-4 flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 flex-shrink-0 flex flex-col">
                {/* 검색 및 필터 - 고정 */}
                <div className="mb-4 lg:mb-6 space-y-3 lg:space-y-4 flex-shrink-0">
                  {/* 검색바와 새로고침 버튼 */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                    <div className="flex-1 relative w-full">
                      <Search className="absolute left-2.5 lg:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 lg:w-4 lg:h-4" />
                      <input
                        type="text"
                        placeholder="충전소명, 위치, ID로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 lg:pl-10 pr-8 lg:pr-10 py-1.5 lg:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-xs lg:text-sm"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-2.5 lg:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs lg:text-sm text-gray-500">총 {filteredStations.length}개</span>
                      <button className="p-1.5 lg:p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 상태 필터 */}
                  <div className="flex gap-1.5 lg:gap-2 flex-wrap">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`px-2.5 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm rounded-lg transition-colors ${
                        statusFilter === 'all'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setStatusFilter('online')}
                      className={`px-2.5 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm rounded-lg transition-colors ${
                        statusFilter === 'online'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      온라인
                    </button>
                    <button
                      onClick={() => setStatusFilter('offline')}
                      className={`px-2.5 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm rounded-lg transition-colors ${
                        statusFilter === 'offline'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      오프라인
                    </button>
                    <button
                      onClick={() => setStatusFilter('maintenance')}
                      className={`px-2.5 lg:px-3 py-1 lg:py-1.5 text-xs lg:text-sm rounded-lg transition-colors ${
                        statusFilter === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      점검중
                    </button>
                  </div>
                </div>

                <div className="space-y-3 lg:space-y-4 flex-1 overflow-y-auto max-h-80">
                  {filteredStations.length === 0 ? (
                    <div className="text-center py-6 lg:py-8">
                      <Search className="w-8 h-8 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3 lg:mb-4" />
                      <p className="text-gray-500 text-sm lg:text-lg">검색 결과가 없습니다</p>
                      <p className="text-gray-400 text-xs lg:text-sm mt-1">다른 검색어나 필터를 시도해보세요</p>
                    </div>
                  ) : (
                    filteredStations.map((station) => (
                    <div
                      key={station.id}
                      onClick={() => handleStationClick(station.id)}
                      className={`p-3 lg:p-4 border rounded-lg transition-all duration-200 cursor-pointer ${
                        selectedStation === station.id
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 lg:gap-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-xs lg:text-sm">{station.name}</h3>
                            <p className="text-xs text-gray-500">{station.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 lg:gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(station.status)}`}>
                            {getStatusText(station.status)}
                          </span>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">마지막 업데이트</p>
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
              <div className="mt-4 lg:mt-6 flex-1 flex flex-col">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 flex-1 flex flex-col">
                    <div className="border-b border-gray-200 pb-3 lg:pb-4">
                      {/* Configuration 제목과 모두 닫기 버튼 */}
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base lg:text-lg font-semibold text-gray-900">Configuration</h2>
                        {activeFeatures.length > 0 && (
                          <button
                            onClick={() => {
                              setActiveFeatures([]);
                              setActiveTab(null);
                            }}
                            className="text-xs lg:text-sm text-gray-500 hover:text-gray-700"
                          >
                            모두 닫기
                          </button>
                        )}
                      </div>
                      
                      {/* 탭들 - 여러 줄로 배치 */}
                      {activeFeatures.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {activeFeatures.map((feature) => (
                            <button
                              key={feature}
                              onClick={() => setActiveTab(feature)}
                              className={`px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === feature
                                  ? 'border-indigo-500 text-indigo-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 lg:gap-2">
                                <span className="truncate">{feature}</span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(feature);
                                  }}
                                  className="ml-1 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                                >
                                  <X className="w-3 h-3" />
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {activeFeatures.length === 0 ? (
                      <div className="text-center py-6 lg:py-8">
                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                          <Zap className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm lg:text-lg">기능을 선택하세요</p>
                        <p className="text-gray-400 text-xs lg:text-sm mt-1">우측 Functional block에서 기능을 클릭하세요</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col mt-3 lg:mt-4">
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-sm lg:text-base font-semibold text-gray-900">Functional block</h2>
                  <button
                    onClick={toggleAlphabetical}
                    className={`px-2.5 lg:px-3 py-1 text-xs rounded-lg transition-colors ${
                      isAlphabetical
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isAlphabetical ? "원래 순서로 되돌리기" : "알파벳 순으로 정렬"}
                  >
                    A-Z
                  </button>
                </div>
                
                <div className="space-y-1.5 lg:space-y-2 flex-1 overflow-y-auto">
                  {sortedFeatures.map((feature) => (
                    <button
                      key={feature}
                      onClick={() => handleFeatureClick(feature)}
                      className={`w-full text-left px-3 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm rounded-lg transition-colors border ${
                        activeFeatures.includes(feature)
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="truncate block">{feature}</span>
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
