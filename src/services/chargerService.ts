import apiClient from '@/lib/axios-client';

// Spring Boot API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ChargingStation {
  stationId: number;
  stationAlias: string;
  roadAddress: string;
  stationStatus: 'online' | 'offline';
  updateTime: string;
  evseCount: number;
  stationLoadKw: number;
  latitude?: number;
  longitude?: number;
}

export interface Evse {
  evseId: number;
  stationId: number;
  status: 'available' | 'occupied' | 'faulted';
  maxPowerKw: number;
  connectorCount: number;
  updateTime: string;
}

export interface Connector {
  connectorId: number;
  evseId: number;
  connectorType: 'CCS' | 'CHAdeMO' | 'AC_Type2' | 'GB_T' | 'Other';
  maxPowerKw: number;
  status: 'available' | 'occupied' | 'faulted';
  updateTime: string;
}

export interface Ess {
  essId: number;
  stationId: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  commissionedAt?: string;
  warrantyUntil?: string;
  capacityKwh: number;
  ratedPowerKw?: number;
  maxChargePowerKw?: number;
  maxDischargePowerKw?: number;
  voltageMin?: number;
  voltageMax?: number;
  phases?: number;
  essStatus: 'online' | 'offline' | 'faulted' | 'maintenance';
  socPercent?: number;
  sohPercent?: number;
  temperatureC?: number;
  cycleCount?: number;
  lastUpdateAt: string;
}

export interface MeterValue {
  meterValueId: number;
  stationId: number;
  evseId: number;
  connectorId?: number;
  transactionId?: string;
  sampledAt: string;
  location: 'Body' | 'Cable' | 'EV' | 'Inlet' | 'Outlet';
  createdAt: string;
}

// 충전소 관련 API 서비스
export const chargerService = {
  // 모든 충전소 조회
  getChargers: async (): Promise<ChargingStation[]> => {
    const response = await apiClient.get<ApiResponse<ChargingStation[]>>('/chargers');
    return response.data.data;
  },

  // 특정 충전소 상세 정보 조회
  getChargerById: async (id: number): Promise<ChargingStation> => {
    const response = await apiClient.get<ApiResponse<ChargingStation>>(`/chargers/${id}`);
    return response.data.data;
  },

  // 충전소의 EVSE 목록 조회
  getEvses: async (stationId: number): Promise<Evse[]> => {
    const response = await apiClient.get<ApiResponse<Evse[]>>(`/chargers/${stationId}/evses`);
    return response.data.data;
  },

  // 충전소의 ESS 목록 조회
  getEss: async (stationId: number): Promise<Ess[]> => {
    const response = await apiClient.get<ApiResponse<Ess[]>>(`/chargers/${stationId}/ess`);
    return response.data.data;
  },

  // 충전소의 계측값 데이터 조회
  getMeterValues: async (stationId: number, limit: number = 100): Promise<MeterValue[]> => {
    const response = await apiClient.get<ApiResponse<MeterValue[]>>(
      `/chargers/${stationId}/meter-values?limit=${limit}`
    );
    return response.data.data;
  },

  // EVSE의 커넥터 목록 조회
  getConnectors: async (stationId: number, evseId: number): Promise<Connector[]> => {
    const response = await apiClient.get<ApiResponse<Connector[]>>(
      `/chargers/${stationId}/evses/${evseId}/connectors`
    );
    return response.data.data;
  },

  // 충전소 상태 업데이트
  updateStationStatus: async (stationId: number, status: 'online' | 'offline'): Promise<void> => {
    await apiClient.put(`/chargers/${stationId}/status`, { status });
  },

  // EVSE 상태 업데이트
  updateEvseStatus: async (stationId: number, evseId: number, status: 'available' | 'occupied' | 'faulted'): Promise<void> => {
    await apiClient.put(`/chargers/${stationId}/evses/${evseId}/status`, { status });
  },

  // ESS 상태 업데이트
  updateEssStatus: async (stationId: number, essId: number, status: 'online' | 'offline' | 'faulted' | 'maintenance'): Promise<void> => {
    await apiClient.put(`/chargers/${stationId}/ess/${essId}/status`, { status });
  }
};
