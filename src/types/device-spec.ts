export interface DeviceSpec {
  manufacturer: "Willog" | "Frigga" | "Luckybox" | "Musago";
  model: string;
  detailModel: string;
  usagePeriod: string;
  realtime: "실시간" | "비실시간";
  cryoProbe: boolean;
  probe: string;
  usageType: "일회용" | "다회용";
  specInfo: string;
  availableServices: string[];
  notes: string;
}
