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

// 사용 가능한 디바이스 타입 목록 (예시)
export const AVAILABLE_DEVICE_TYPES: DeviceType[] = [
  {
    id: "temp-humidity-001",
    name: "온습도 센서",
    model: "TH-Sensor Pro",
    size: { width: 0.1, height: 0.15, depth: 0.05 },
    color: "#4CAF50",
  },
  {
    id: "temp-humidity-002",
    name: "고정밀 온습도 센서",
    model: "TH-Sensor Elite",
    size: { width: 0.12, height: 0.18, depth: 0.06 },
    color: "#2196F3",
  },
  
];

