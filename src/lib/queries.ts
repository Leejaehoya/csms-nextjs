import pool from './database';
import { 
  ChargingStation, 
  Evse, 
  Connector, 
  MeterValue, 
  Ess,
  ChargingStationWithDetails,
  EvseWithDetails,
  ChargingStationLegacy 
} from '@/types/database';

// 충전소 관련 쿼리
export class ChargingStationQueries {
  // 모든 충전소 조회
  static async getAllStations(): Promise<ChargingStation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM ChargingStation ORDER BY station_id'
    );
    return rows as ChargingStation[];
  }

  // ID로 충전소 조회
  static async getStationById(stationId: number): Promise<ChargingStation | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM ChargingStation WHERE station_id = ?',
      [stationId]
    );
    const stations = rows as ChargingStation[];
    return stations.length > 0 ? stations[0] : null;
  }

  // 충전소와 관련된 모든 정보 조회 (EVSE, Connector 포함)
  static async getStationWithDetails(stationId: number): Promise<ChargingStationWithDetails | null> {
    // 충전소 기본 정보
    const station = await this.getStationById(stationId);
    if (!station) return null;

    // EVSE 정보 조회
    const [evseRows] = await pool.execute(
      'SELECT * FROM Evse WHERE station_id = ? ORDER BY evse_id',
      [stationId]
    );
    const evses = evseRows as Evse[];

    // 각 EVSE의 Connector 정보 조회
    const evsesWithDetails: EvseWithDetails[] = [];
    for (const evse of evses) {
      const [connectorRows] = await pool.execute(
        'SELECT * FROM Connector WHERE evse_id = ? ORDER BY connector_id',
        [evse.evse_id]
      );
      const connectors = connectorRows as Connector[];
      
      evsesWithDetails.push({
        ...evse,
        connectors
      });
    }

    // 통계 계산
    const totalConnectors = evsesWithDetails.reduce((sum, evse) => sum + evse.connectors.length, 0);
    const availableConnectors = evsesWithDetails.reduce((sum, evse) => 
      sum + evse.connectors.filter(c => c.status === 'available').length, 0
    );
    const occupiedConnectors = evsesWithDetails.reduce((sum, evse) => 
      sum + evse.connectors.filter(c => c.status === 'occupied').length, 0
    );
    const faultedConnectors = evsesWithDetails.reduce((sum, evse) => 
      sum + evse.connectors.filter(c => c.status === 'faulted').length, 0
    );

    return {
      ...station,
      evses: evsesWithDetails,
      total_connectors: totalConnectors,
      available_connectors: availableConnectors,
      occupied_connectors: occupiedConnectors,
      faulted_connectors: faultedConnectors
    };
  }

  // 온라인 충전소만 조회
  static async getOnlineStations(): Promise<ChargingStation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM ChargingStation WHERE station_status = "online" ORDER BY station_id'
    );
    return rows as ChargingStation[];
  }

  // 지역별 충전소 조회
  static async getStationsByRegion(region: string): Promise<ChargingStation[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM ChargingStation WHERE road_address LIKE ? ORDER BY station_id',
      [`%${region}%`]
    );
    return rows as ChargingStation[];
  }
}

// EVSE 관련 쿼리
export class EvseQueries {
  // 충전소의 모든 EVSE 조회
  static async getEvsesByStationId(stationId: number): Promise<Evse[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM Evse WHERE station_id = ? ORDER BY evse_id',
      [stationId]
    );
    return rows as Evse[];
  }

  // ID로 EVSE 조회
  static async getEvseById(evseId: number): Promise<Evse | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM Evse WHERE evse_id = ?',
      [evseId]
    );
    const evses = rows as Evse[];
    return evses.length > 0 ? evses[0] : null;
  }
}

// Connector 관련 쿼리
export class ConnectorQueries {
  // EVSE의 모든 Connector 조회
  static async getConnectorsByEvseId(evseId: number): Promise<Connector[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM Connector WHERE evse_id = ? ORDER BY connector_id',
      [evseId]
    );
    return rows as Connector[];
  }

  // ID로 Connector 조회
  static async getConnectorById(connectorId: number): Promise<Connector | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM Connector WHERE connector_id = ?',
      [connectorId]
    );
    const connectors = rows as Connector[];
    return connectors.length > 0 ? connectors[0] : null;
  }
}

// MeterValue 관련 쿼리
export class MeterValueQueries {
  // 충전소의 최근 계측값 조회
  static async getRecentMeterValues(stationId: number, limit: number = 100): Promise<MeterValue[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM MeterValue WHERE station_id = ? ORDER BY sampled_at DESC LIMIT ?',
      [stationId, limit]
    );
    return rows as MeterValue[];
  }

  // EVSE의 최근 계측값 조회
  static async getRecentMeterValuesByEvse(evseId: number, limit: number = 50): Promise<MeterValue[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM MeterValue WHERE evse_id = ? ORDER BY sampled_at DESC LIMIT ?',
      [evseId, limit]
    );
    return rows as MeterValue[];
  }

  // Connector의 최근 계측값 조회
  static async getRecentMeterValuesByConnector(connectorId: number, limit: number = 50): Promise<MeterValue[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM MeterValue WHERE connector_id = ? ORDER BY sampled_at DESC LIMIT ?',
      [connectorId, limit]
    );
    return rows as MeterValue[];
  }
}

// ESS 관련 쿼리
export class EssQueries {
  // 충전소의 ESS 조회
  static async getEssByStationId(stationId: number): Promise<Ess[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM Ess WHERE station_id = ? ORDER BY ess_id',
      [stationId]
    );
    return rows as Ess[];
  }

  // ID로 ESS 조회
  static async getEssById(essId: number): Promise<Ess | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM Ess WHERE ess_id = ?',
      [essId]
    );
    const essList = rows as Ess[];
    return essList.length > 0 ? essList[0] : null;
  }

  // 모든 ESS 조회
  static async getAllEss(): Promise<Ess[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM Ess ORDER BY station_id, ess_id'
    );
    return rows as Ess[];
  }

  // 상태별 ESS 조회
  static async getEssByStatus(status: 'online' | 'offline' | 'faulted' | 'maintenance'): Promise<Ess[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM Ess WHERE ess_status = ? ORDER BY station_id, ess_id',
      [status]
    );
    return rows as Ess[];
  }
}

// 레거시 호환성을 위한 변환 함수
export function convertToLegacyFormat(station: ChargingStation): ChargingStationLegacy {
  return {
    stationName: station.station_alias,
    region: station.road_address.split(' ')[0] || '', // 주소에서 첫 번째 단어를 지역으로 사용
    address: station.road_address,
    stationId: station.station_id.toString(),
    status: station.station_status === 'online' ? 'Online' : 'Offline',
    updateTime: station.update_time.toISOString(),
    latitude: station.latitude || undefined,
    longitude: station.longitude || undefined,
    evseCount: station.evse_count,
    stationLoadKw: station.station_load_kw
  };
}

export function convertArrayToLegacyFormat(stations: ChargingStation[]): ChargingStationLegacy[] {
  return stations.map(convertToLegacyFormat);
}
