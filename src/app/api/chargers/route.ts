import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 실제 API 엔드포인트로 변경 필요
    // const response = await fetch(`${process.env.API_BASE_URL}/chargers`);
    // const data = await response.json();
    
    // 개발용 더미 데이터
    const dummyData = [
      {
        id: 'CHG001',
        name: '서울역 충전소',
        location: '서울특별시 중구',
        status: 'normal',
        messageType: 'heartbeat',
        lastConnection: new Date().toISOString()
      },
      {
        id: 'CHG002',
        name: '강남역 충전소',
        location: '서울특별시 강남구',
        status: 'normal',
        messageType: 'bootnotification',
        lastConnection: new Date().toISOString()
      },
      {
        id: 'CHG003',
        name: '부산역 충전소',
        location: '부산광역시 해운대구',
        status: 'disconnected',
        lastConnection: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'CHG004',
        name: '인천공항 충전소',
        location: '인천광역시 중구',
        status: 'normal',
        messageType: 'heartbeat',
        lastConnection: new Date().toISOString()
      },
      {
        id: 'CHG005',
        name: '대전역 충전소',
        location: '대전광역시 동구',
        status: 'disconnected',
        lastConnection: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    return NextResponse.json(dummyData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '데이터를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
