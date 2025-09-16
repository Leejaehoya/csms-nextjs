'use client';

import { useState, useRef, useEffect } from 'react';
import {
  BarChart3,
  Settings,
  Clock,
  Calendar,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  Activity,
  FileText,
  ChevronDown,
  Check,
  Send
} from 'lucide-react';

interface ChargingStation {
  stationName: string;
  region: string;
  address: string;
  stationId: string;
  status: 'Online' | 'Offline';
  updateTime: string;
}

interface MeteringReportsPanelProps {
  selectedStation: ChargingStation | null;
}

// Custom Dropdown Component
interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function CustomDropdown({ options, value, onChange, placeholder, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-400 flex items-center justify-between"
      >
        <div>
          <span className="text-gray-900 font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.description && (
            <p className="text-xs text-gray-500 mt-0.5">{selectedOption.description}</p>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="py-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between ${
                  value === option.value ? 'bg-indigo-50' : ''
                }`}
              >
                <div>
                  <span className={`font-medium ${value === option.value ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {option.label}
                  </span>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
                {value === option.value && (
                  <Check className="w-4 h-4 text-indigo-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom SVG Icons
const ReadingTypeIcon = () => (
  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7M3 7H21M8 11H16M8 15H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoadSettingsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MeteringReportsPanel({ selectedStation }: MeteringReportsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  
  // Metering Configuration States
  const [interval, setInterval] = useState('3600');
  const [measurementType, setMeasurementType] = useState('energy');
  const [measurementUnit, setMeasurementUnit] = useState('kWh');

  // New Configuration States
  const [targetComponent, setTargetComponent] = useState('station');
  const [dataDirection, setDataDirection] = useState('from-grid');
  const [transactionAlerts, setTransactionAlerts] = useState({
    enabled: true,
    start: true,
    end: true,
    during: false
  });

  // Dropdown options
  const measurementTypeOptions: DropdownOption[] = [
    { value: 'reactive-power', label: 'Reactive Power', description: 'Reactive power measurement' },
    { value: 'power', label: 'Power', description: 'Active power measurement' },
    { value: 'energy', label: 'Energy', description: 'Cumulative electrical energy' },
    { value: 'power-factor', label: 'Power Factor', description: 'Power factor measurement' },
    { value: 'soc', label: 'SoC', description: 'State of Charge measurement' },
    { value: 'voltage', label: 'Voltage', description: 'Voltage measurement' },
    { value: 'current', label: 'Current', description: 'Current measurement' }
  ];

  // Dynamic unit options based on measurement type
  const getUnitOptions = (type: string): DropdownOption[] => {
    switch (type) {
      case 'reactive-power':
      case 'power':
        return [
          { value: 'W', label: 'W', description: 'Watt' },
          { value: 'kW', label: 'kW', description: 'Kilowatt' },
          { value: 'MW', label: 'MW', description: 'Megawatt' }
        ];
      case 'energy':
        return [
          { value: 'Wh', label: 'Wh', description: 'Watt-hour' },
          { value: 'kWh', label: 'kWh', description: 'Kilowatt-hour' },
          { value: 'MWh', label: 'MWh', description: 'Megawatt-hour' }
        ];
      case 'power-factor':
        return [
          { value: 'ratio', label: 'Ratio', description: 'Power factor ratio (0-1)' },
          { value: 'percent', label: 'Percent', description: 'Power factor percentage' }
        ];
      case 'soc':
        return [
          { value: 'percent', label: 'Percent', description: 'State of Charge percentage' },
          { value: 'ratio', label: 'Ratio', description: 'State of Charge ratio (0-1)' }
        ];
      case 'voltage':
        return [
          { value: 'V', label: 'V', description: 'Volt' },
          { value: 'kV', label: 'kV', description: 'Kilovolt' },
          { value: 'mV', label: 'mV', description: 'Millivolt' }
        ];
      case 'current':
        return [
          { value: 'A', label: 'A', description: 'Ampere' },
          { value: 'kA', label: 'kA', description: 'Kiloampere' },
          { value: 'mA', label: 'mA', description: 'Milliampere' }
        ];
      default:
        return [
          { value: 'unit', label: 'Unit', description: 'Default unit' }
        ];
    }
  };


  const componentOptions: DropdownOption[] = [
    { value: 'station', label: 'Charging Station', description: 'Entire charging station' },
    { value: 'evse', label: 'EVSE', description: 'Electric Vehicle Supply Equipment' },
    { value: 'inlet', label: 'Inlet', description: 'Power input connection' },
    { value: 'outlet', label: 'Outlet', description: 'Power output connection' }
  ];

  const directionOptions: DropdownOption[] = [
    { value: 'from-grid', label: 'From Grid', description: 'Energy flowing from grid to vehicle' },
    { value: 'to-grid', label: 'To Grid', description: 'Energy flowing from vehicle to grid' },
    { value: 'both', label: 'Both Directions', description: 'Bidirectional energy flow' }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 1000);
  };

  const handleLoadSettings = async () => {
    setIsLoadingSettings(true);
    // Simulate API call to load settings
    setTimeout(() => {
      // Simulate loaded settings
      setInterval('1800');
      setMeasurementType('energy');
      setMeasurementUnit('kWh');
      setTargetComponent('evse');
      setDataDirection('from-grid');
      setTransactionAlerts({
        enabled: true,
        start: true,
        end: true,
        during: false
      });
      setIsLoadingSettings(false);
    }, 1000);
  };

  // Update unit when measurement type changes
  const handleMeasurementTypeChange = (type: string) => {
    setMeasurementType(type);
    const availableUnits = getUnitOptions(type);
    if (availableUnits.length > 0) {
      setMeasurementUnit(availableUnits[0].value);
    }
  };

  const handleSend = async () => {
    if (!selectedStation) {
      setSendError('No station selected');
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      // URL 파라미터로 데이터 전송
      const queryParams = new URLSearchParams({
        stationId: selectedStation.stationId,
        targetComponent,
        dataDirection,
        measurementType,
        measurementUnit,
        interval,
        alertsEnabled: transactionAlerts.enabled.toString(),
        alertsStart: transactionAlerts.start.toString(),
        alertsEnd: transactionAlerts.end.toString(),
        alertsDuring: transactionAlerts.during.toString()
      });

      // Next.js API 프록시를 통해 Spring Boot API 호출 (GET 방식)
      const response = await fetch(`/api/setvariables/create?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      console.log('[MeteringReportsPanel] API response:', data);
      
      setIsSent(true);
      setTimeout(() => setIsSent(false), 5000);
    } catch (error: any) {
      console.error('[MeteringReportsPanel] Error calling API:', error);
      
      // 에러 메시지 설정
      setSendError(error.message || 'Failed to send configuration. Please try again.');
      
      // 에러 메시지 자동 제거
      setTimeout(() => setSendError(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedStation) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg mb-2">No station selected</p>
        <p className="text-gray-400 text-sm">Please select a charging station to configure metering settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Metering & Reports Configuration</h3>
          <p className="text-sm text-gray-500">Station: {selectedStation.stationId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSettings}
            disabled={isLoadingSettings}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isLoadingSettings ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LoadSettingsIcon />
            )}
            {isLoadingSettings ? 'Loading...' : 'Load Settings'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isSaved
                ? 'bg-green-100 text-green-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaved ? 'Saved' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ReadingType */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ReadingTypeIcon />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">ReadingType</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Component
            </label>
            <CustomDropdown
              options={componentOptions}
              value={targetComponent}
              onChange={setTargetComponent}
              placeholder="Select target component"
            />
            <p className="text-xs text-gray-500 mt-1">Which component to monitor for metering</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Direction
            </label>
            <CustomDropdown
              options={directionOptions}
              value={dataDirection}
              onChange={setDataDirection}
              placeholder="Select data direction"
            />
            <p className="text-xs text-gray-500 mt-1">Energy flow direction to monitor</p>
          </div>
        </div>
      </div>

      {/* Measurement */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Measurement</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Type
            </label>
            <CustomDropdown
              options={measurementTypeOptions}
              value={measurementType}
              onChange={handleMeasurementTypeChange}
              placeholder="Select measurement type"
            />
            <p className="text-xs text-gray-500 mt-1">Type of measurement to perform</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Unit
            </label>
            <CustomDropdown
              options={getUnitOptions(measurementType)}
              value={measurementUnit}
              onChange={setMeasurementUnit}
              placeholder="Select measurement unit"
            />
            <p className="text-xs text-gray-500 mt-1">Unit for {measurementType} measurements</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interval
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
                max="86400"
              />
              <span className="text-sm text-gray-500">seconds</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Measurement and reporting interval</p>
          </div>
        </div>
      </div>


      {/* Transaction Alert Settings */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Transaction Alert Settings</h4>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-700">Enable Transaction Alerts</h5>
              <p className="text-xs text-gray-500">Receive notifications for charging transactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={transactionAlerts.enabled}
                onChange={(e) => setTransactionAlerts(prev => ({ ...prev, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {transactionAlerts.enabled && (
            <div className="pl-4 border-l-2 border-orange-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Transaction Start</h5>
                  <p className="text-xs text-gray-500">Alert when charging session begins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transactionAlerts.start}
                    onChange={(e) => setTransactionAlerts(prev => ({ ...prev, start: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Transaction End</h5>
                  <p className="text-xs text-gray-500">Alert when charging session completes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transactionAlerts.end}
                    onChange={(e) => setTransactionAlerts(prev => ({ ...prev, end: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">During Transaction</h5>
                  <p className="text-xs text-gray-500">Alert during active charging session</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={transactionAlerts.during}
                    onChange={(e) => setTransactionAlerts(prev => ({ ...prev, during: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Error Message */}
      {sendError && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-red-900">Error</h5>
              <p className="text-xs text-red-700 mt-1">{sendError}</p>
            </div>
            <button
              onClick={() => setSendError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-blue-900">Status</h5>
              <p className="text-xs text-blue-700 mt-1">
                Component <strong>{targetComponent}</strong> with energy flow <strong>{dataDirection}</strong> Measuring <strong>{measurementType}</strong> every <strong>{interval}</strong> seconds in <strong>{measurementUnit}</strong> units.
                {transactionAlerts.enabled && ' Transaction alerts enabled.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={isSending}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-4 ${
              isSent
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : isSent ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isSending ? 'Sending...' : isSent ? 'Sent' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
