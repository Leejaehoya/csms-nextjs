import { NextRequest, NextResponse } from 'next/server';

// Spring Boot API 기본 URL
const SPRING_BOOT_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8090';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // URL 파라미터에서 데이터 추출
    const stationId = searchParams.get('stationId');
    const targetComponent = searchParams.get('targetComponent');
    const dataDirection = searchParams.get('dataDirection');
    const measurementType = searchParams.get('measurementType');
    const measurementUnit = searchParams.get('measurementUnit');
    const interval = searchParams.get('interval');
    const alertsEnabled = searchParams.get('alertsEnabled');
    const alertsStart = searchParams.get('alertsStart');
    const alertsEnd = searchParams.get('alertsEnd');
    const alertsDuring = searchParams.get('alertsDuring');
    
    console.log('[API Proxy] Received GET request with params:', {
      stationId,
      targetComponent,
      dataDirection,
      measurementType,
      measurementUnit,
      interval,
      alertsEnabled,
      alertsStart,
      alertsEnd,
      alertsDuring
    });
    
    // URL 파라미터로 Spring Boot API 호출
    const queryParams = new URLSearchParams({
      stationId: stationId || '',
      targetComponent: targetComponent || '',
      dataDirection: dataDirection || '',
      measurementType: measurementType || '',
      measurementUnit: measurementUnit || '',
      interval: interval || '',
      alertsEnabled: alertsEnabled || 'false',
      alertsStart: alertsStart || 'false',
      alertsEnd: alertsEnd || 'false',
      alertsDuring: alertsDuring || 'false'
    });
    
    const response = await fetch(`${SPRING_BOOT_API_URL}/api/setvariables/create?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API Proxy] Spring Boot API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: `Spring Boot API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[API Proxy] Spring Boot API response:', data);
    
    return NextResponse.json({
      success: true,
      data: data,
      message: 'Configuration sent successfully'
    });

  } catch (error: any) {
    console.error('[API Proxy] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to connect to Spring Boot API',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
