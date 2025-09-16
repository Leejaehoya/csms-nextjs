# Spring Boot 백엔드 연동 가이드

## 🚀 개요

이 Next.js 프로젝트는 Spring Boot 백엔드와 연동할 수 있도록 구성되어 있습니다. Spring Boot 서버가 실행 중이지 않을 때는 로컬 Next.js API로 자동 fallback됩니다.

## 📋 필요한 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Spring Boot Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Database Configuration (if using direct DB connection)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=csms_db

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Spring Boot 백엔드 API 엔드포인트

Spring Boot 서버에서 다음 API 엔드포인트를 구현해야 합니다:

#### 충전소 관련 API
```
GET /api/chargers                    # 모든 충전소 조회
GET /api/chargers/{id}               # 특정 충전소 상세 정보
GET /api/chargers/{id}/evses         # 충전소의 EVSE 목록
GET /api/chargers/{id}/ess           # 충전소의 ESS 목록
GET /api/chargers/{id}/meter-values  # 충전소의 계측값 데이터
GET /api/chargers/{id}/evses/{evseId}/connectors  # EVSE의 커넥터 목록

PUT /api/chargers/{id}/status        # 충전소 상태 업데이트
PUT /api/chargers/{id}/evses/{evseId}/status  # EVSE 상태 업데이트
PUT /api/chargers/{id}/ess/{essId}/status     # ESS 상태 업데이트
```

### 3. API 응답 형식

모든 API는 다음 형식으로 응답해야 합니다:

```json
{
  "success": true,
  "data": {
    // 실제 데이터
  },
  "message": "Success",
  "timestamp": "2025-09-15T10:30:00Z"
}
```

### 4. 데이터 모델

#### ChargingStation
```json
{
  "stationId": 1,
  "stationAlias": "서울역 충전소",
  "roadAddress": "서울특별시 중구 한강대로 405",
  "stationStatus": "online",
  "updateTime": "2025-09-15T10:30:00Z",
  "evseCount": 4,
  "stationLoadKw": 150.0,
  "latitude": 37.5665,
  "longitude": 126.9780
}
```

#### Evse
```json
{
  "evseId": 1,
  "stationId": 1,
  "status": "available",
  "maxPowerKw": 50.0,
  "connectorCount": 2,
  "updateTime": "2025-09-15T10:30:00Z"
}
```

#### Ess
```json
{
  "essId": 1,
  "stationId": 1,
  "manufacturer": "PowerCell",
  "model": "PX-100",
  "serialNumber": "PX100-SEA-0001",
  "commissionedAt": "2023-03-10T00:00:00Z",
  "warrantyUntil": "2028-03-10T00:00:00Z",
  "capacityKwh": 100.0,
  "ratedPowerKw": 50.0,
  "maxChargePowerKw": 50.0,
  "maxDischargePowerKw": 50.0,
  "voltageMin": 350.0,
  "voltageMax": 800.0,
  "phases": 3,
  "essStatus": "online",
  "socPercent": 62.5,
  "sohPercent": 96.0,
  "temperatureC": 27.5,
  "cycleCount": 410,
  "lastUpdateAt": "2025-09-15T10:30:00Z"
}
```

## 🔧 Spring Boot 설정 예시

### CORS 설정
```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3001")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Controller 예시
```java
@RestController
@RequestMapping("/api/chargers")
@CrossOrigin(origins = "http://localhost:3001")
public class ChargerController {
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChargingStation>>> getAllChargers() {
        List<ChargingStation> stations = chargerService.getAllChargers();
        return ResponseEntity.ok(new ApiResponse<>(true, stations, "Success"));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChargingStation>> getChargerById(@PathVariable Long id) {
        ChargingStation station = chargerService.getChargerById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, station, "Success"));
    }
    
    @GetMapping("/{id}/evses")
    public ResponseEntity<ApiResponse<List<Evse>>> getEvses(@PathVariable Long id) {
        List<Evse> evses = chargerService.getEvsesByStationId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, evses, "Success"));
    }
    
    @GetMapping("/{id}/ess")
    public ResponseEntity<ApiResponse<List<Ess>>> getEss(@PathVariable Long id) {
        List<Ess> essList = chargerService.getEssByStationId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, essList, "Success"));
    }
}
```

## 🚀 실행 방법

### 1. Spring Boot 서버 실행
```bash
# Spring Boot 프로젝트에서
./mvnw spring-boot:run
# 또는
java -jar your-app.jar
```

### 2. Next.js 개발 서버 실행
```bash
# Next.js 프로젝트에서
npm run dev
```

### 3. 접속
- Next.js: http://localhost:3001
- Spring Boot API: http://localhost:8080/api

## 🔄 Fallback 동작

Spring Boot 서버가 실행되지 않거나 연결에 실패할 경우, 자동으로 Next.js의 로컬 API로 fallback됩니다. 이는 개발 중에 백엔드 서버 없이도 프론트엔드를 테스트할 수 있게 해줍니다.

## 📝 로깅

API 호출과 응답은 브라우저 콘솔에서 확인할 수 있습니다:
- `[API Request]` - 요청 로그
- `[API Response]` - 성공 응답 로그
- `[API Response Error]` - 에러 응답 로그

## 🛠️ 문제 해결

### CORS 오류
Spring Boot에서 CORS 설정을 확인하세요.

### 연결 오류
1. Spring Boot 서버가 실행 중인지 확인
2. 포트 번호가 올바른지 확인 (기본: 8080)
3. 환경 변수 `NEXT_PUBLIC_API_BASE_URL`이 올바른지 확인

### 데이터 형식 오류
API 응답이 위의 형식과 일치하는지 확인하세요.
