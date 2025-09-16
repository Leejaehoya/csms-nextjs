'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 설정 (Next.js에서 필요)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ChargingStation {
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

export default function MapComponent() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 충전소 데이터 로드
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
      } catch (error) {
        console.error('Failed to load stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isLoading) return;

    // 지도 초기화
    const map = L.map(mapContainerRef.current).setView([36.5, 127.5], 7);
    mapRef.current = map;

    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 기존 마커 제거
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // 데이터베이스에서 가져온 충전소 마커 추가
    stations.forEach((station) => {
      // 위도/경도가 있는 경우에만 마커 추가
      if (station.latitude && station.longitude) {
        const marker = L.marker([station.latitude, station.longitude]).addTo(map);
        
        // 상태에 따른 아이콘 색상 설정
        const iconColor = station.status === 'Online' ? '#22c55e' : '#ef4444';
        
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background-color: ${iconColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        
        marker.setIcon(customIcon);
        marker.bindPopup(`
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${station.stationName}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">ID: ${station.stationId}</p>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">${station.address}</p>
            <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px;">
              <div style="
                width: 8px;
                height: 8px;
                background-color: ${iconColor};
                border-radius: 50%;
              "></div>
              <span style="color: ${iconColor}; font-weight: 500; font-size: 12px;">
                ${station.status === 'Online' ? '정상 운영' : '연결 끊김'}
              </span>
            </div>
            ${station.evseCount ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 11px;">EVSE: ${station.evseCount}개</p>` : ''}
            ${station.stationLoadKw ? `<p style="margin: 2px 0 0 0; color: #666; font-size: 11px;">부하: ${station.stationLoadKw}kW</p>` : ''}
          </div>
        `);
        
        markersRef.current.push(marker);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stations, isLoading]);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-lg flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">충전소 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
}
