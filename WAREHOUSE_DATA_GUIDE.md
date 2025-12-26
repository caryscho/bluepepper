# Warehouse 3D 구축을 위한 데이터 가이드

## 📐 필요한 정보 (도면에서 추출해야 할 것들)

### 1. 기본 구조 정보
- **전체 크기**
  - 길이 (Length/X-axis)
  - 너비 (Width/Z-axis)  
  - 높이 (Height/Y-axis)
  - 단위 (미터, 피트 등)

- **바닥 (Floor)**
  - 바닥 두께
  - 바닥 재질/색상 (선택사항)

### 2. 기둥 (Columns/Pillars)
- **위치 (Position)**
  - 각 기둥의 X, Z 좌표
  - 기둥 간격 (Grid spacing)
  
- **크기**
  - 기둥 폭 (Width)
  - 기둥 깊이 (Depth)
  - 기둥 높이 (Height)

- **재질**
  - 콘크리트, 철강 등 (시각화용)

### 3. 벽 (Walls)
- **외벽 (Exterior Walls)**
  - 두께
  - 높이
  - 위치 (평면도에서)

- **내벽 (Interior Walls)**
  - 구역 분리용 벽
  - 위치와 크기

### 4. 문 (Doors)
- **위치**
  - 벽의 어느 부분에 있는지
  - 높이
  
- **크기**
  - 너비
  - 높이

### 5. 창문 (Windows)
- **위치와 크기**
  - 각 창문의 위치
  - 너비, 높이

### 6. 선반/랙 (Shelves/Racks)
- **배치**
  - 각 선반의 위치 (X, Z 좌표)
  - 선반 간격
  
- **크기**
  - 길이, 너비, 높이
  - 단 (Tier) 수

### 7. 조명 (Lighting)
- **위치**
  - 각 조명의 X, Y, Z 좌표
  - 조명 간격
  
- **타입**
  - 천장 조명, 벽 조명 등

### 8. IoT 센서 위치
- **센서 배치**
  - 각 센서의 정확한 위치 (X, Y, Z)
  - 센서 ID/이름

---

## 📄 도면 형식별 처리 방법

### 1. PDF/DWG (AutoCAD) 도면
**방법:**
- AutoCAD에서 데이터 추출
- 수동 측정 및 좌표 기록
- 또는 CAD → JSON/CSV 변환 도구 사용

**필요한 정보:**
- 평면도 (Floor Plan)
- 정면도 (Elevation)
- 단면도 (Section)

### 2. 이미지 (PNG/JPG) 도면
**방법:**
- 이미지를 보고 수동으로 측정
- 스케일 확인 (예: 1cm = 1m)
- 좌표계 설정

**도구:**
- 이미지 편집기로 픽셀 측정
- 스케일 계산

### 3. JSON/CSV 데이터
**가장 이상적!**
- 이미 구조화된 데이터
- 바로 코드에서 사용 가능

**예시 형식:**
```json
{
  "warehouse": {
    "dimensions": { "length": 50, "width": 30, "height": 10 },
    "columns": [
      { "x": 5, "z": 5, "width": 0.5, "depth": 0.5, "height": 10 }
    ],
    "walls": [...],
    "shelves": [...]
  }
}
```

### 4. GLTF/OBJ/3D 모델 파일
**가장 쉬움!**
- 이미 3D 모델이 있으면 바로 로드 가능
- React Three Fiber에서 `useGLTF` 사용

---

## 🛠️ 구현 방법

### 방법 1: 수동 데이터 입력 (JSON)
도면을 보고 JSON 파일로 변환

```typescript
// warehouse-config.json
{
  "dimensions": {
    "length": 50,  // 미터
    "width": 30,
    "height": 10
  },
  "columns": [
    { "x": 5, "z": 5, "size": 0.5, "height": 10 },
    { "x": 15, "z": 5, "size": 0.5, "height": 10 },
    // ... 더 많은 기둥들
  ],
  "walls": [
    { "start": [0, 0], "end": [50, 0], "height": 10, "thickness": 0.3 }
  ],
  "shelves": [
    { "x": 10, "z": 10, "length": 5, "width": 2, "height": 3, "tiers": 4 }
  ],
  "lights": [
    { "x": 5, "y": 9, "z": 5 },
    { "x": 15, "y": 9, "z": 5 }
  ]
}
```

### 방법 2: CAD 파일 파싱
- DWG → JSON 변환 도구 사용
- 또는 AutoCAD API 사용

### 방법 3: 3D 모델 파일 로드
GLTF/OBJ 파일이 있으면 바로 사용

```tsx
import { useGLTF } from '@react-three/drei'

function WarehouseModel() {
  const { scene } = useGLTF('/warehouse.gltf')
  return <primitive object={scene} />
}
```

---

## 📋 체크리스트: 도면에서 추출할 정보

### 필수 정보
- [ ] 전체 warehouse 크기 (길이, 너비, 높이)
- [ ] 기둥 위치와 크기
- [ ] 벽 위치와 두께
- [ ] 문 위치와 크기
- [ ] 선반/랙 위치와 크기
- [ ] 조명 위치
- [ ] 센서 위치 (IoT)

### 선택 정보
- [ ] 창문 위치
- [ ] 계단/엘리베이터
- [ ] 화물 적재 구역
- [ ] 사무실/구역 분리

---

## 💡 실용적인 접근 방법

### Step 1: 간단한 버전부터 시작
1. 전체 크기만 먼저 (큰 박스)
2. 기둥 추가
3. 선반 추가
4. 센서 마커 추가

### Step 2: 점진적으로 정확도 향상
- 처음엔 대략적인 크기로 시작
- 나중에 정확한 측정값으로 업데이트

### Step 3: 도면이 없을 때
- 실제 warehouse 방문하여 측정
- 또는 사진으로 대략적인 크기 추정
- 스케일 참조물 사용 (예: 사람, 팔레트)

---

## 🔧 추천 도구

### 도면 분석
- **AutoCAD** - DWG 파일 읽기
- **Fusion 360** - 3D 모델링
- **Blender** - 3D 모델 편집/변환
- **ImageJ** - 이미지 측정

### 데이터 변환
- **DWG to JSON** 변환기
- **CSV to JSON** 변환기
- **Excel** - 데이터 정리 후 JSON 변환

---

## 📝 다음 단계

1. **도면 받기** - 어떤 형식인지 확인
2. **데이터 추출** - 필요한 정보 리스트업
3. **JSON 구조 설계** - 데이터 형식 정의
4. **코드로 구현** - React Three Fiber로 렌더링

