// 데이터베이스 테이블 타입 정의

export interface ChargingStation {
  station_id: number;
  station_alias: string;
  road_address: string;
  station_status: 'online' | 'offline';
  update_time: Date;
  evse_count: number;
  station_load_kw: number;
  latitude: number | null;
  longitude: number | null;
}

export interface Evse {
  evse_id: number;
  station_id: number;
  status: 'available' | 'occupied' | 'faulted';
  max_power_kw: number;
  connector_count: number;
  update_time: Date;
}

export interface Connector {
  connector_id: number;
  evse_id: number;
  connector_type: 'CCS' | 'CHAdeMO' | 'AC_Type2' | 'GB_T' | 'Other';
  max_power_kw: number;
  status: 'available' | 'occupied' | 'faulted';
  update_time: Date;
}

export interface MeterValue {
  meter_value_id: number;
  station_id: number;
  evse_id: number;
  connector_id: number | null;
  transaction_id: string | null;
  sampled_at: Date;
  location: 'Body' | 'Cable' | 'EV' | 'Inlet' | 'Outlet';
  created_at: Date;
}

export interface Ess {
  ess_id: number;
  station_id: number;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  commissioned_at: Date | null;
  warranty_until: Date | null;
  capacity_kwh: number;
  rated_power_kw: number | null;
  max_charge_power_kw: number | null;
  max_discharge_power_kw: number | null;
  voltage_min: number | null;
  voltage_max: number | null;
  phases: number | null;
  ess_status: 'online' | 'offline' | 'faulted' | 'maintenance';
  soc_percent: number | null;
  soh_percent: number | null;
  temperature_c: number | null;
  cycle_count: number | null;
  last_update_at: Date;
}

// API 응답용 확장 타입
export interface ChargingStationWithDetails extends ChargingStation {
  evses: EvseWithDetails[];
  total_connectors: number;
  available_connectors: number;
  occupied_connectors: number;
  faulted_connectors: number;
}

export interface EvseWithDetails extends Evse {
  connectors: Connector[];
}

// 프론트엔드에서 사용하는 기존 타입과의 호환성을 위한 변환 타입
export interface ChargingStationLegacy {
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
