import { NextResponse } from 'next/server';
import { EvseQueries } from '@/lib/queries';
import { testConnection } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stationId = parseInt(params.id);
    
    if (isNaN(stationId)) {
      return NextResponse.json(
        { error: '유효하지 않은 충전소 ID입니다.' },
        { status: 400 }
      );
    }

    // 데이터베이스 연결 테스트
    const isConnected = await testConnection();
    if (!isConnected) {
      return NextResponse.json(
        { error: '데이터베이스 연결에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 충전소의 EVSE 목록 조회
    const evses = await EvseQueries.getEvsesByStationId(stationId);

    return NextResponse.json(evses);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
