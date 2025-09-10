'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 설정 (Next.js에서 필요)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent() {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 지도 초기화
    const map = L.map(mapContainerRef.current).setView([36.5, 127.5], 7);
    mapRef.current = map;

    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // 샘플 마커 추가
    const sampleMarkers = [
      { lat: 37.5665, lng: 126.9780, name: '서울역 충전소', status: 'normal' },
      { lat: 37.4979, lng: 127.0276, name: '강남역 충전소', status: 'normal' },
      { lat: 35.1796, lng: 129.0756, name: '부산역 충전소', status: 'disconnected' },
    ];

    sampleMarkers.forEach(({ lat, lng, name, status }) => {
      const marker = L.marker([lat, lng]).addTo(map);
      
      // 상태에 따른 아이콘 색상 설정
      const iconColor = status === 'normal' ? '#22c55e' : '#ef4444';
      
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
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-weight: bold;">${name}</h3>
          <p style="margin: 0; color: ${iconColor}; font-weight: 500;">
            ${status === 'normal' ? '정상 운영' : '연결 끊김'}
          </p>
        </div>
      `);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
}
