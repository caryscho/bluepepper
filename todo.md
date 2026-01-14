# 🚀 BluePepper 프로젝트 베타 출시 체크리스트

## 📦 1. 코드 정리 및 최적화 (Performance & Clean Code)

### 1.1 불필요한 파일 삭제
- [ ] `src/entity/device/ui/InstalledDevice copy.tsx` 삭제 (백업 파일)
- [ ] `src/features/device-detail/ui/DeviceDetailModal.tsx` 삭제 (현재 DeviceDetailBox 사용 중)
- [ ] `src/App.css` 확인 후 미사용 시 삭제
- [ ] `src/assets/react.svg`, `public/vite.svg` 등 기본 템플릿 에셋 삭제

### 1.2 Console.log & 디버깅 코드 제거
- [ ] `src/entity/device/ui/InstalledDevice.tsx` (line 83) - "무슨클릭임 1111" 제거
- [ ] 전체 프로젝트 `console.log` 검색 후 제거

### 1.3 주석 처리된 코드 삭제
- [ ] `src/pages/glb-uploader/index.tsx` (line 411-416) - 주석 처리된 샘플 버튼 코드 삭제
- [ ] 전체 프로젝트에서 주석 처리된 대량 코드 블록 검색 및 삭제

---

## 🔄 2. 중복 코드 통합 (Code Deduplication)

### 2.1 WarehouseViewer vs GlbUploader 중복 로직
**문제:** 두 페이지가 거의 동일한 로직을 중복 구현

#### 공통으로 추출할 항목:
- [ ] **상태 관리 중복**
  - `installedDevices` 상태
  - `selectedDevice` 상태
  - `hoveredDevice` 상태
  - `isAddDeviceMode` 상태
  - `showDeviceList` 상태
  - `focusTarget` 상태

- [ ] **핸들러 함수 중복**
  - `handleDeviceClick`
  - `handleDeviceHover`
  - `handleCloseDeviceDetail`
  - `handleDeleteDevice`
  - `handleFocusDevice` / `handleFocusDeviceLocal`
  - `handleChangePosition`
  - `handleHeightChange`

- [ ] **컴포넌트 사용 중복**
  - `Controls` 컴포넌트
  - `DeviceList` 컴포넌트
  - `DeviceDetailBox` 컴포넌트
  - `DeviceSelector` 컴포넌트

#### 통합 방안:
- [ ] **Option A: 전역 Store 도입 (추천)**
  - Zustand 또는 Jotai 설치
  - `useDeviceStore` 생성하여 모든 디바이스 관련 상태/로직 통합
  - `useCameraStore` 생성하여 카메라 제어 로직 통합
  - `useUIStore` 생성하여 모달/리스트 표시 상태 통합

- [ ] **Option B: 공통 훅 추출**
  - `useDeviceManagement` 훅 생성
  - `useCameraControl` 훅 생성
  - 두 페이지에서 공통 훅 사용

### 2.2 중복 컴포넌트 정리
- [ ] `CameraFocusController` (glb-uploader) ↔ `useFocusTarget` 사용 패턴 통일
- [ ] `orbitControlsRef` 관리 방식 통일

---

## 🏗️ 3. 상태 관리 개선 (State Management)

### 3.1 전역 상태 관리 도입
- [ ] **Zustand 설치** (가벼움, 추천)
  ```bash
  npm install zustand
  ```

- [ ] **Store 구조 설계**
  - `stores/useDeviceStore.ts` - 디바이스 CRUD 로직
  - `stores/useCameraStore.ts` - 카메라 포커스/리셋
  - `stores/useUIStore.ts` - 모달/리스트 표시 상태
  - `stores/useWarehouseStore.ts` - 창고 데이터/설정

### 3.2 useWarehouseViewer 리팩토링
**문제:** 현재 한 훅에 모든 로직이 집중 (252줄)

- [ ] Store로 마이그레이션 후 훅 크기 축소
- [ ] 로직 분리: UI 상태 vs 데이터 상태

---

## 🎨 4. TypeScript 타입 개선 (Type Safety)

### 4.1 `any` 타입 제거
**발견된 파일들:**
- [ ] `src/entity/device/ui/InstalledDevice.tsx`
- [ ] `src/widgets/warehouse-viewer/ui/controls/HeatmapLayer.tsx`
- [ ] `src/widgets/warehouse-viewer/ui/SpaceThreeDViewer.tsx`
- [ ] `src/pages/glb-uploader/index.tsx`
- [ ] `src/features/device-list/ui/DeviceList.tsx`
- [ ] `src/widgets/warehouse-viewer/model/useWarehouseViewer.ts`
- [ ] `src/widgets/warehouse-viewer/ui/SpaceTwoDViewer.tsx`

### 4.2 공통 타입 정의 강화
- [ ] `src/types/device.ts` - Device 인터페이스 완성
- [ ] `src/types/warehouse.ts` - Warehouse 인터페이스 완성
- [ ] Three.js 이벤트 타입 정의 (`ThreeEvent` from `@react-three/fiber`)
- [ ] OrbitControls ref 타입 정의

---

## ⚡ 5. 성능 최적화 (Performance)

### 5.1 React 최적화
- [ ] **미적용 컴포넌트에 React.memo 추가**
  - `DeviceList.tsx`
  - `DeviceDetailBox.tsx`
  - `DeviceSelector.tsx`
  - `HeightController.tsx`
  - `Controls` 하위 컴포넌트들

- [ ] **useMemo / useCallback 추가**
  - 반복 렌더링되는 컴포넌트의 props
  - 계산 비용이 큰 값들 (Three.js 객체 생성 등)

### 5.2 Three.js 최적화
- [ ] **인스턴싱 확장**
  - `Walls.tsx` → `InstancedWalls.tsx` 마이그레이션 완료 확인
  - `Shelves.tsx` → `InstancedShelves.tsx` 마이그레이션 완료 확인
  - `Columns.tsx` → `InstancedColumns.tsx` 마이그레이션 완료 확인

- [ ] **텍스처/재질 최적화**
  - 동일 재질 재사용 (Material 캐싱)
  - 텍스처 해상도 조정 (Heatmap gradient 등)

- [ ] **LOD (Level of Detail) 고려**
  - 카메라 거리에 따른 디바이스 디테일 조정

### 5.3 번들 크기 최적화
- [ ] `vite.config.js`에 chunk splitting 설정
- [ ] `rollup-plugin-visualizer`로 번들 분석
- [ ] 불필요한 Three.js import tree-shaking 확인

---

## 🛡️ 6. 프로덕션 준비 (Production Ready)

### 6.1 에러 핸들링
- [ ] **에러 바운더리 추가**
  - `src/shared/ui/ErrorBoundary.tsx` 생성
  - 주요 페이지에 적용

- [ ] **GLB 로딩 실패 처리**
  - glb-uploader에서 잘못된 파일 업로드 시 에러 메시지
  - useGLTF 에러 핸들링

- [ ] **네트워크 에러 처리**
  - 창고 데이터 로딩 실패 시 fallback UI

### 6.2 로딩 상태 개선
- [ ] 모든 비동기 작업에 로딩 인디케이터 추가
- [ ] Skeleton UI 고려 (DeviceList, DetailBox 등)
- [ ] Progressive loading (큰 GLB 파일)

### 6.3 환경 변수 설정
- [ ] `.env.example` 파일 생성
- [ ] 개발/프로덕션 환경 분리
- [ ] API 엔드포인트 환경 변수화 (향후 백엔드 연동 대비)

### 6.4 README 업데이트
- [ ] 프로젝트 소개 작성
- [ ] 기능 목록 정리
- [ ] 설치 및 실행 방법
- [ ] 기술 스택 명시
- [ ] 스크린샷/데모 영상 추가

### 6.5 빌드 및 배포
- [ ] `npm run build` 에러 없이 통과 확인
- [ ] 빌드 산출물 크기 확인 (<5MB 목표)
- [ ] Vercel/Netlify 등 배포 설정
- [ ] 환경 변수 배포 환경 설정

---

## 🧪 7. 테스트 및 QA (Quality Assurance)

### 7.1 기능 테스트
- [ ] **WarehousePage**
  - 디바이스 추가/삭제
  - 디바이스 클릭 → 상세 정보 표시
  - 디바이스 포커스 (카메라 이동)
  - 히트맵 토글
  - 2D/3D 전환
  - 카메라 리셋

- [ ] **GlbUploaderPage**
  - GLB 파일 업로드
  - 모델 스케일 조정
  - 디바이스 배치
  - 디바이스 높이 조절 (HeightController)
  - 디바이스 포커스
  - 디바이스 삭제

### 7.2 브라우저 호환성
- [ ] Chrome (최신)
- [ ] Firefox (최신)
- [ ] Safari (최신)
- [ ] Edge (최신)

### 7.3 성능 테스트
- [ ] 50개 이상 디바이스 설치 시 성능 확인 (60fps 유지)
- [ ] 큰 GLB 파일 (>10MB) 로딩 테스트
- [ ] 모바일 디바이스 성능 (옵션)

---

## 📝 8. 문서화 (Documentation)

### 8.1 코드 주석
- [ ] 복잡한 Three.js 로직에 주석 추가
- [ ] 커스텀 훅에 JSDoc 추가
- [ ] 유틸 함수에 설명 추가

### 8.2 아키텍처 문서
- [ ] `ARCHITECTURE.md` 생성
  - 프로젝트 구조 설명
  - 디렉토리 구조 가이드
  - 상태 관리 플로우
  - 주요 컴포넌트 다이어그램

### 8.3 데이터 가이드
- [ ] `WAREHOUSE_DATA_GUIDE.md` 업데이트 (이미 존재)
- [ ] GLB 파일 요구사항 문서화

---

## 🎯 9. UX/UI 개선 (User Experience)

### 9.1 사용성 개선
- [ ] 툴팁 추가 (버튼 hover 시 설명)
- [ ] 키보드 단축키 (ESC로 모달 닫기 등)
- [ ] 디바이스 드래그 앤 드롭 (현재는 클릭)
- [ ] Undo/Redo 기능 (디바이스 배치)

### 9.2 시각적 피드백
- [ ] 디바이스 배치 시 Valid/Invalid 색상 구분 명확화
- [ ] 로딩 애니메이션 개선
- [ ] 성공/에러 토스트 메시지
- [ ] 트랜지션 애니메이션 통일

### 9.3 접근성
- [ ] 버튼에 aria-label 추가
- [ ] 포커스 인디케이터 확인
- [ ] 키보드 네비게이션 지원

---

## 🔒 10. 보안 및 검증 (Security)

### 10.1 입력 검증
- [ ] GLB 파일 타입 검증 (확장자 + MIME type)
- [ ] 파일 크기 제한 (최대 50MB)
- [ ] 숫자 입력 범위 검증 (targetModelSize 등)

### 10.2 의존성 보안
- [ ] `npm audit` 실행 및 취약점 수정
- [ ] 의존성 버전 업데이트

---

## 🚀 11. 최종 릴리스 전 체크

- [ ] 모든 console.log 제거 확인
- [ ] 주석 처리된 코드 모두 삭제
- [ ] 중복 파일 모두 삭제
- [ ] 타입 에러 0개
- [ ] Lint 에러 0개
- [ ] 빌드 성공
- [ ] 프로덕션 빌드 테스트
- [ ] 모든 기능 정상 작동 확인
- [ ] README 완성
- [ ] 데모 영상 또는 스크린샷 준비
- [ ] Git 커밋 히스토리 정리 (squash/rebase)

---

## 📊 우선순위 (Priority)

### 🔥 High Priority (베타 출시 필수)
1. 불필요한 파일 삭제
2. Console.log 제거
3. 중복 코드 통합 (Store 도입)
4. `any` 타입 제거
5. 에러 바운더리 추가
6. README 업데이트
7. 빌드 최적화

### 🟡 Medium Priority (베타 출시 권장)
8. React 최적화 (memo, useMemo)
9. 로딩 상태 개선
10. 브라우저 호환성 테스트
11. UX/UI 개선

### 🟢 Low Priority (출시 후 개선)
12. 코드 주석 추가
13. 아키텍처 문서
14. 접근성 개선
15. 모바일 최적화

---

## 🎉 완료 기준

**베타 출시 가능 조건:**
- ✅ 모든 High Priority 항목 완료
- ✅ 최소 80% Medium Priority 항목 완료
- ✅ 주요 기능 정상 작동
- ✅ 치명적 버그 0개
- ✅ 프레젠테이션 가능한 상태

---

**작성일:** 2026-01-13  
**프로젝트:** BluePepper (혁신 프로젝트)  
**목표:** 베타 수준 완성도 달성
