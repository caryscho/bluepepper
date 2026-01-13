export type ImpactSeverity = 'normal' | 'warning' | 'danger';

export interface ImpactDataPoint {
  timestamp: string;
  timeOffset: number; // seconds from start
  gForce: number; // G-force (gravity units)
  severity: ImpactSeverity;
  event: string | null;
}

export interface ImpactThreshold {
  warning: number;
  danger: number;
}

export interface ShippingData {
  shipmentId: string;
  origin: string;
  destination: string;
  startTime: string;
  endTime: string;
  vehicle: string;
  impactThreshold: ImpactThreshold;
  impactData: ImpactDataPoint[];
  summary: {
    totalDuration: number;
    normalCount: number;
    warningCount: number;
    dangerCount: number;
    maxImpact: number;
    avgImpact: number;
  };
}
