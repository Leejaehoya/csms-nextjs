import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // CSV 파일 읽기
    const csvPath = path.join(process.cwd(), 'public', 'charging_stations.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // CSV 파싱
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const stations = lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',');
        return {
          stationName: values[0]?.trim() || '',
          region: values[1]?.trim() || '',
          address: values[2]?.trim() || '',
          stationId: values[3]?.trim() || '',
          status: values[4]?.trim() === 'Online' ? 'Online' : 'Offline',
          updateTime: values[5]?.trim() || ''
        };
      });

    return NextResponse.json(stations);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
