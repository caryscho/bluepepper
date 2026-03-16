import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, X, RotateCcw } from "lucide-react";
import { DEVICE_SPECS } from "../../data/device-specs";
import type { DeviceSpec } from "../../types/device-spec";

type RealtimeFilter = "전체" | "실시간" | "비실시간";
type ProbeFilter = "전체" | "O" | "X";
type UsageTypeFilter = "전체" | "일회용" | "다회용";

const MANUFACTURERS = ["Willog", "Frigga", "Luckybox", "Musago"] as const;

function getDeviceKey(device: DeviceSpec, index: number) {
  return `${device.manufacturer}-${device.detailModel}-${device.usagePeriod}-${index}`;
}

function FilterPills<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              value === opt
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RealtimeBadge({ value }: { value: "실시간" | "비실시간" }) {
  return value === "실시간" ? (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
      실시간
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
      비실시간
    </span>
  );
}

function ProbeBadge({ value }: { value: string }) {
  if (value === "X") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-50 text-red-500">
        프로브 X
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-600">
      프로브 {value}
    </span>
  );
}

function UsageTypeBadge({ value }: { value: "일회용" | "다회용" }) {
  return value === "다회용" ? (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
      다회용
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-orange-50 text-orange-600">
      일회용
    </span>
  );
}

function ComparisonPanel({
  devices,
  onRemove,
}: {
  devices: { key: string; device: DeviceSpec }[];
  onRemove: (key: string) => void;
}) {
  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm p-6 text-center">
        비교할 디바이스를 선택하세요
        <br />
        (최대 3개)
      </div>
    );
  }

  const rows: { label: string; render: (d: DeviceSpec) => React.ReactNode }[] = [
    { label: "제조사", render: (d) => d.manufacturer },
    { label: "모델명", render: (d) => d.model },
    { label: "세부 모델명", render: (d) => d.detailModel },
    { label: "실시간", render: (d) => <RealtimeBadge value={d.realtime} /> },
    { label: "극저온 프로브", render: (d) => (d.cryoProbe ? "O" : "X") },
    { label: "프로브", render: (d) => <ProbeBadge value={d.probe} /> },
    { label: "사용 유형", render: (d) => <UsageTypeBadge value={d.usageType} /> },
    { label: "사용기한", render: (d) => (d.usagePeriod === "-" ? "-" : `${d.usagePeriod}일`) },
    { label: "스펙", render: (d) => <span className="text-xs">{d.specInfo}</span> },
    {
      label: "서비스",
      render: (d) =>
        d.availableServices.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {d.availableServices.map((s) => (
              <span key={s} className="px-1.5 py-0.5 text-xs bg-gray-100 rounded text-gray-600">
                {s}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      label: "비고",
      render: (d) =>
        d.notes ? (
          <span className="text-xs text-gray-500">{d.notes}</span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  // For diff highlighting, compare raw string values instead of rendered JSX
  const diffKeys: { label: string; getValue: (d: DeviceSpec) => string }[] = [
    { label: "제조사", getValue: (d) => d.manufacturer },
    { label: "모델명", getValue: (d) => d.model },
    { label: "세부 모델명", getValue: (d) => d.detailModel },
    { label: "실시간", getValue: (d) => d.realtime },
    { label: "극저온 프로브", getValue: (d) => (d.cryoProbe ? "O" : "X") },
    { label: "프로브", getValue: (d) => d.probe },
    { label: "사용 유형", getValue: (d) => d.usageType },
    { label: "사용기한", getValue: (d) => d.usagePeriod },
    { label: "스펙", getValue: (d) => d.specInfo },
    { label: "서비스", getValue: (d) => d.availableServices.join(",") },
    { label: "비고", getValue: (d) => d.notes },
  ];

  const hasDiff = rows.map((row) => {
    if (devices.length < 2) return false;
    const diffKey = diffKeys.find((dk) => dk.label === row.label);
    if (!diffKey) return false;
    const values = devices.map((d) => diffKey.getValue(d.device));
    return !values.every((v) => v === values[0]);
  });

  return (
    <div className="text-sm">
      {/* Column headers */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="w-20 shrink-0" />
        {devices.map(({ key, device }) => (
          <div key={key} className="flex-1 p-2 font-semibold text-center min-w-0">
            <div className="flex items-center justify-center gap-1">
              <span className="truncate">{device.detailModel}</span>
              <button
                onClick={() => onRemove(key)}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Rows */}
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex border-b border-gray-100 ${hasDiff[i] ? "bg-yellow-50" : ""}`}
        >
          <div className="w-20 shrink-0 p-2 text-xs text-gray-500 font-medium">{row.label}</div>
          {devices.map(({ key, device }) => (
            <div key={key} className="flex-1 p-2 min-w-0 break-words">
              {row.render(device)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DevicesPage() {
  const [realtimeFilter, setRealtimeFilter] = useState<RealtimeFilter>("전체");
  const [probeFilter, setProbeFilter] = useState<ProbeFilter>("전체");
  const [usageTypeFilter, setUsageTypeFilter] = useState<UsageTypeFilter>("전체");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(MANUFACTURERS)
  );
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

  const filteredDevices = useMemo(() => {
    return DEVICE_SPECS.map((device, index) => ({
      device,
      key: getDeviceKey(device, index),
    })).filter(({ device }) => {
      if (realtimeFilter !== "전체" && device.realtime !== realtimeFilter) return false;
      if (probeFilter !== "전체") {
        if (probeFilter === "O" && device.probe === "X") return false;
        if (probeFilter === "X" && device.probe !== "X") return false;
      }
      if (usageTypeFilter !== "전체" && device.usageType !== usageTypeFilter) return false;
      return true;
    });
  }, [realtimeFilter, probeFilter, usageTypeFilter]);

  const groupedDevices = useMemo(() => {
    const groups: Record<string, { device: DeviceSpec; key: string }[]> = {};
    for (const m of MANUFACTURERS) groups[m] = [];
    for (const item of filteredDevices) {
      groups[item.device.manufacturer].push(item);
    }
    return groups;
  }, [filteredDevices]);

  const selectedDevices = useMemo(() => {
    return selectedKeys
      .map((key) => {
        const found = DEVICE_SPECS.map((d, i) => ({ device: d, key: getDeviceKey(d, i) })).find(
          (item) => item.key === key
        );
        return found ? { key, device: found.device } : null;
      })
      .filter(Boolean) as { key: string; device: DeviceSpec }[];
  }, [selectedKeys]);

  const toggleGroup = (manufacturer: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(manufacturer)) next.delete(manufacturer);
      else next.add(manufacturer);
      return next;
    });
  };

  const toggleDevice = (key: string) => {
    setExpandedDevices((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const resetFilters = () => {
    setRealtimeFilter("전체");
    setProbeFilter("전체");
    setUsageTypeFilter("전체");
    setSelectedKeys([]);
  };

  const hasActiveFilter =
    realtimeFilter !== "전체" || probeFilter !== "전체" || usageTypeFilter !== "전체";

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Filter Bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <FilterPills
              label="실시간"
              options={["전체", "실시간", "비실시간"] as RealtimeFilter[]}
              value={realtimeFilter}
              onChange={setRealtimeFilter}
            />
            <FilterPills
              label="프로브"
              options={["전체", "O", "X"] as ProbeFilter[]}
              value={probeFilter}
              onChange={setProbeFilter}
            />
            <FilterPills
              label="사용유형"
              options={["전체", "일회용", "다회용"] as UsageTypeFilter[]}
              value={usageTypeFilter}
              onChange={setUsageTypeFilter}
            />
            {hasActiveFilter && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                초기화
              </button>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {DEVICE_SPECS.length}개 중 {filteredDevices.length}개 표시
          </div>
        </div>

        {/* Grouped Accordion */}
        <div className="p-4 space-y-2">
          {MANUFACTURERS.map((manufacturer) => {
            const devices = groupedDevices[manufacturer];
            const isExpanded = expandedGroups.has(manufacturer);

            return (
              <div key={manufacturer} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(manufacturer)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span className="font-semibold text-gray-800">{manufacturer}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                    {devices.length}
                  </span>
                </button>

                {/* Device Rows */}
                {isExpanded && devices.length > 0 && (
                  <div>
                    {devices.map(({ device, key }) => {
                      const isDeviceExpanded = expandedDevices.has(key);
                      const isSelected = selectedKeys.includes(key);

                      return (
                        <div key={key} className="border-t border-gray-100">
                          <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(key)}
                              disabled={!isSelected && selectedKeys.length >= 3}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            {/* Expand toggle + model name */}
                            <button
                              onClick={() => toggleDevice(key)}
                              className="flex items-center gap-2 min-w-0"
                            >
                              {isDeviceExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                              )}
                              <span className="font-medium text-gray-800">
                                {device.detailModel}
                              </span>
                              {device.usagePeriod !== "-" && (
                                <span className="text-xs text-gray-400">
                                  ({device.usagePeriod}일)
                                </span>
                              )}
                            </button>
                            {/* Badges */}
                            <div className="flex items-center gap-1.5 ml-auto flex-wrap justify-end">
                              <RealtimeBadge value={device.realtime} />
                              <ProbeBadge value={device.probe} />
                              <UsageTypeBadge value={device.usageType} />
                              {device.cryoProbe && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-purple-50 text-purple-600">
                                  극저온
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Expanded Detail */}
                          {isDeviceExpanded && (
                            <div className="px-12 pb-3 space-y-2 text-sm text-gray-600 bg-gray-50/50">
                              <div>
                                <span className="text-xs font-medium text-gray-400">스펙</span>
                                <p className="mt-0.5">{device.specInfo}</p>
                              </div>
                              {device.availableServices.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-gray-400">
                                    운영 서비스
                                  </span>
                                  <div className="flex gap-1.5 mt-0.5">
                                    {device.availableServices.map((s) => (
                                      <span
                                        key={s}
                                        className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                                      >
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {device.notes && (
                                <div>
                                  <span className="text-xs font-medium text-gray-400">비고</span>
                                  <p className="mt-0.5 text-xs text-gray-500 italic">
                                    {device.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {isExpanded && devices.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-400 italic">
                    필터 조건에 맞는 디바이스가 없습니다.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Comparison */}
      <div className="w-[320px] shrink-0 border-l border-gray-200 bg-white overflow-y-auto hidden lg:block">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">
            비교 {selectedKeys.length > 0 && `(${selectedKeys.length}/3)`}
          </h3>
          {selectedKeys.length > 0 && (
            <button
              onClick={() => setSelectedKeys([])}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          )}
        </div>
        <ComparisonPanel
          devices={selectedDevices}
          onRemove={(key) => setSelectedKeys((prev) => prev.filter((k) => k !== key))}
        />
      </div>
    </div>
  );
}
