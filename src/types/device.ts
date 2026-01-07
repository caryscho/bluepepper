// Device types for warehouse IoT devices

export interface DeviceType {
  id: string;
  name: string;
  model: string;
  serialNumber?: string; // 선택 시 입력
  size: {
    width: number;
    height: number;
    depth: number;
  };
  color: string; // 3D 렌더링용 색상
  icon?: string; // 아이콘 (선택사항)
  battery: string; // 배터리 수명 
}

// 설치된 디바이스
export interface InstalledDevice {
  id: string;
  deviceTypeId: string;
  serialNumber: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  attachedTo?: "floor" | "wall" | "column"; // 부착 위치
  attachedToId?: string; // 부착된 오브젝트 ID (벽, 기둥 등)
  installedAt: Date;
  status: "active" | "inactive" | "error";
  lastUpdate?: Date;
  temperature?: number;
  humidity?: number;
}

// 사용 가능한 디바이스 타입 목록 메타정보만 가짐
// 출처: https://willog.io/ko/solution/willog-safe
export const AVAILABLE_DEVICE_TYPES: DeviceType[] = [
  {
    id: "t1",
    name: "T1",
    model: "다회용 실시간 디바이스",
    size: { 
      width: 0.065,   // 65mm
      height: 0.115,  // 115mm
      depth: 0.02     // 20mm
    },
    color: "#3b82f6", // Blue
    battery: "60일"
  },
  {
    id: "v2",
    name: "V2",
    model: "다회용 비실시간 디바이스",
    size: { 
      width: 0.065,   // 65mm
      height: 0.1,    // 100mm
      depth: 0.0135   // 13.5mm
    },
    color: "#f59e0b", // Amber
    battery: "1년"
  },
];

