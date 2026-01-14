export type TiltSeverity = 'normal' | 'warning' | 'danger';

export type MotionType = 
  | 'sudden_stop' 
  | 'vertical_bump' 
  | 'lateral_movement' 
  | 'sharp_turn' 
  | 'acceleration'
  | 'normal';

export type MotionDirection = 
  | 'forward_tilt' 
  | 'backward_tilt' 
  | 'left_sway' 
  | 'right_tilt' 
  | 'upward_jump'
  | 'stable';

export type MotionIntensity = 'low' | 'medium' | 'high' | 'very_high';

export interface MotionDescription {
  type: MotionType;
  direction: MotionDirection;
  intensity: MotionIntensity;
}

export interface TiltDataPoint {
  timestamp: string;
  timeOffset: number; // seconds from start
  roll: number; // X축 회전 (좌우 기울기) - 도 단위
  pitch: number; // Y축 회전 (앞뒤 기울기) - 도 단위
  yaw: number; // Z축 회전 (좌우 회전) - 도 단위
  tiltMagnitude: number; // 초기 기울기 대비 총 변화량 (도 단위)
  severity: TiltSeverity;
  event: string | null;
  motionDescription?: MotionDescription; // 위험/경고 이벤트일 때만 존재
}

export interface InitialOrientation {
  roll: number;
  pitch: number;
  yaw: number;
  description: string;
}

export interface TiltThreshold {
  warning: number; // 경고 기준 (도)
  danger: number; // 위험 기준 (도)
}

export interface ShippingData {
  shipmentId: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  vehicle: string;
  tiltThreshold: TiltThreshold;
  initialOrientation: InitialOrientation;
  tiltData: TiltDataPoint[];
  summary: {
    totalDuration: number;
    normalCount: number;
    warningCount: number;
    dangerCount: number;
    maxTilt: number;
    avgTilt: number;
  };
}

// 하위 호환성을 위한 타입 (기존 코드용)
export type ImpactSeverity = TiltSeverity;
export interface ImpactDataPoint extends Omit<TiltDataPoint, 'roll' | 'pitch' | 'yaw' | 'tiltMagnitude' | 'motionDescription'> {
  gForce: number;
}
export interface ImpactThreshold extends TiltThreshold {}
