import { useState } from "react";
import Map from "react-map-gl/mapbox";
import type { Map as MapboxMap } from "mapbox-gl";
import type { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { GeoJSON } from "geojson";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAPBOX_LANG_CODES = [
  "ar", "en", "es", "fr", "de", "it", "pt", "ru",
  "zh-Hans", "zh-Hant", "ja", "ko", "vi",
] as const;

// 새로 만든 HUB 스타일
const MAPBOX_STYLE = "mapbox://styles/willog2021/cml7f6esi003201sq28cx5f36";

// 줌 레벨 임계값 설정
// 줌이 10.5보다 작아지면 동적 POI 표시
const LOW_ZOOM_THRESHOLD = 10.5; // 줌 10.5 미만에서 동적 POI 표시
const DYNAMIC_POI_SOURCE_ID = "priority-poi-source";
const DYNAMIC_POI_CIRCLE_LAYER_ID = "priority-poi-circle";
const DYNAMIC_POI_LABEL_LAYER_ID = "priority-poi-label";

// 스케일 바: 20, 30, 50, 100 단위 (줌에 따라 m 또는 km)
const SCALE_OPTIONS_M = [20, 30, 50, 100, 200, 500];
const SCALE_OPTIONS_KM = [1, 2, 5, 10, 20, 30, 50, 100];
const SCALE_BAR_WIDTH_PX = 100; // 스케일 바가 나타내는 길이(px) 기준

function getMetersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

function getScaleBar(
  lat: number,
  zoom: number
): { value: number; unit: "m" | "km"; barWidthPx: number } {
  const mpp = getMetersPerPixel(lat, zoom);
  const distanceMeters = mpp * SCALE_BAR_WIDTH_PX;

  if (distanceMeters < 1000) {
    const options = SCALE_OPTIONS_M;
    const value = options.reduce((prev, curr) =>
      Math.abs(curr - distanceMeters) < Math.abs(prev - distanceMeters) ? curr : prev
    );
    const barWidthPx = value / mpp;
    return { value, unit: "m", barWidthPx };
  } else {
    const distanceKm = distanceMeters / 1000;
    const options = SCALE_OPTIONS_KM;
    const value = options.reduce((prev, curr) =>
      Math.abs(curr - distanceKm) < Math.abs(prev - distanceKm) ? curr : prev
    );
    const barWidthPx = (value * 1000) / mpp;
    return { value, unit: "km", barWidthPx };
  }
}

function getBrowserMapLanguage(): string {
  const browserLang = (typeof navigator !== "undefined" && navigator.language) || "en";
  const base = browserLang.split("-")[0].toLowerCase();
  const full = browserLang.split("-").length > 1 ? `${base}-${browserLang.split("-")[1]}` : base;

  // Map browser locale to Mapbox name_* field
  if (full.startsWith("zh")) {
    return full === "zh-cn" ? "zh-Hans" : "zh-Hant";
  }
  if (MAPBOX_LANG_CODES.includes(full as (typeof MAPBOX_LANG_CODES)[number])) return full;
  if (MAPBOX_LANG_CODES.includes(base as (typeof MAPBOX_LANG_CODES)[number])) return base;
  return "en";
}

// 줌 아웃 시에도 보일 POI class (Mapbox Streets v8 poi_label)
// education=학교, medical=병원/약국, public_facilities=공공시설
const PRIORITY_POI_CLASSES = ["education", "medical", "public_facilities"];
const POI_ZOOM_THRESHOLD = 12; // 이 줌 미만이면 중요 POI만 표시

// 중요 POI 데이터 로드
async function loadPriorityPoiData(): Promise<GeoJSON.FeatureCollection> {
  try {
    const response = await fetch("/priority-poi-seoul.json");
    if (!response.ok) {
      throw new Error(`Failed to load POI data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`[POI] Loaded ${data.features.length} POIs`);
    return data;
  } catch (error) {
    console.error("[POI] Failed to load:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

function applyMapLanguage(map: MapboxMap, lang: string): void {
  const style = map.getStyle();
  if (!style?.layers) return;

  const textField = [
    "coalesce",
    ["get", `name_${lang}`],
    ["get", "name_en"],
    ["get", "name"],
  ] as [string, ...unknown[]];

  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    const layout = (layer as { layout?: Record<string, unknown> }).layout;
    if (!layout || !("text-field" in layout)) continue;
    try {
      map.setLayoutProperty(layer.id, "text-field", textField);
    } catch {
      // skip
    }
  }
}

function applyPoiZoomFilter(map: MapboxMap): void {
  const style = map.getStyle();
  if (!style?.layers) return;

  // zoom < POI_ZOOM_THRESHOLD → 중요 POI만, zoom >= → 전부
  const zoomFilter: [string, ...unknown[]] = [
    "any",
    [">=", ["zoom"], POI_ZOOM_THRESHOLD],
    ["in", ["get", "class"], ["literal", PRIORITY_POI_CLASSES]],
  ];

  for (const layer of style.layers) {
    const withSource = layer as { type: string; id: string; sourceLayer?: string };
    if (withSource.type !== "symbol") continue;
    if (withSource.sourceLayer !== "poi_label") continue;
    try {
      map.setFilter(withSource.id, zoomFilter);
    } catch {
      // skip
    }
  }
}

// 줌 레벨이 10.5 미만일 때 동적 POI 레이어 추가
async function addDynamicPoiLayer(map: MapboxMap, lang: string): Promise<void> {
  const zoom = map.getZoom();
  console.log(`[Dynamic POI] Adding at zoom ${zoom.toFixed(2)}`);

  const poiData = await loadPriorityPoiData();
  if (poiData.features.length === 0) {
    console.error("[Dynamic POI] No data loaded");
    return;
  }

  // 모든 POI 사용
  const allFeatures = poiData.features.filter((f) => f.geometry.type === "Point");
  console.log(`[Dynamic POI] Using ${allFeatures.length} POIs`);

  const filteredData: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: allFeatures,
  };

  try {
    // Source 추가 또는 업데이트
    if (!map.getSource(DYNAMIC_POI_SOURCE_ID)) {
      map.addSource(DYNAMIC_POI_SOURCE_ID, {
        type: "geojson",
        data: filteredData,
      });
      console.log("[Dynamic POI] Source added");
    } else {
      (map.getSource(DYNAMIC_POI_SOURCE_ID) as GeoJSONSource).setData(filteredData);
      console.log("[Dynamic POI] Source updated");
    }

    // Circle 마커 레이어 추가 (이미 있으면 스킵)
    if (!map.getLayer(DYNAMIC_POI_CIRCLE_LAYER_ID)) {
      map.addLayer({
        id: DYNAMIC_POI_CIRCLE_LAYER_ID,
        type: "circle",
        source: DYNAMIC_POI_SOURCE_ID,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 4,
            10, 8,
          ],
          "circle-color": [
            "match",
            ["get", "class"],
            "education",
            "#0066cc",
            "medical",
            "#cc0000",
            "public_facilities",
            "#00cc00",
            "#666666",
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.8,
        },
        minzoom: 0,
        maxzoom: LOW_ZOOM_THRESHOLD,
      });
      console.log("[Dynamic POI] Circle layer added");
    }

    // 텍스트 레이블 레이어 추가 (이미 있으면 스킵)
    if (!map.getLayer(DYNAMIC_POI_LABEL_LAYER_ID)) {
      const textField = [
        "coalesce",
        ["get", `name_${lang}`],
        ["get", "name_en"],
        ["get", "name"],
      ] as [string, ...unknown[]];

      map.addLayer({
        id: DYNAMIC_POI_LABEL_LAYER_ID,
        type: "symbol",
        source: DYNAMIC_POI_SOURCE_ID,
        layout: {
          "text-field": textField,
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0, 10,
            10, 13,
          ],
        },
        paint: {
          "text-color": "#333333",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
          "text-halo-blur": 1,
        },
        minzoom: 0,
        maxzoom: LOW_ZOOM_THRESHOLD,
      });
      console.log("[Dynamic POI] Label layer added");
    }
  } catch (error) {
    console.error("[Dynamic POI] Error:", error);
  }
}

// 줌 레벨이 10.5 이상일 때 동적 POI 레이어 제거
function removeDynamicPoiLayer(map: MapboxMap): void {
  const zoom = map.getZoom();
  console.log(`[Dynamic POI] Removing at zoom ${zoom.toFixed(2)}`);
  try {
    if (map.getLayer(DYNAMIC_POI_LABEL_LAYER_ID)) {
      map.removeLayer(DYNAMIC_POI_LABEL_LAYER_ID);
      console.log("[Dynamic POI] Label layer removed");
    }
    if (map.getLayer(DYNAMIC_POI_CIRCLE_LAYER_ID)) {
      map.removeLayer(DYNAMIC_POI_CIRCLE_LAYER_ID);
      console.log("[Dynamic POI] Circle layer removed");
    }
    if (map.getSource(DYNAMIC_POI_SOURCE_ID)) {
      map.removeSource(DYNAMIC_POI_SOURCE_ID);
      console.log("[Dynamic POI] Source removed");
    }
  } catch (error) {
    console.error("[Dynamic POI] Remove error:", error);
  }
}

// 줌 레벨에 따라 동적 POI 레이어 관리
async function manageDynamicPoiLayer(map: MapboxMap, lang: string): Promise<void> {
  const zoom = map.getZoom();
  if (zoom < LOW_ZOOM_THRESHOLD) {
    await addDynamicPoiLayer(map, lang);
  } else {
    removeDynamicPoiLayer(map);
  }
}

export default function MapboxTestPage() {
  const [zoom, setZoom] = useState<number>(12);
  const [scaleBar, setScaleBar] = useState<{ value: number; unit: "m" | "km"; barWidthPx: number } | null>(null);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex justify-center items-center p-8 h-full bg-gray-100">
        <div className="p-6 text-center bg-amber-50 rounded-lg shadow">
          <p className="font-medium text-amber-800">
            Add <code className="px-1 bg-amber-100 rounded">VITE_MAPBOX_ACCESS_TOKEN</code> to your{" "}
            <code className="px-1 bg-amber-100 rounded">.env</code> file.
          </p>
          <p className="mt-2 text-sm text-amber-700">
            Get a token at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Mapbox Account → Access tokens
            </a>
          </p>
        </div>
      </div>
    );
  }

  const mapLang = getBrowserMapLanguage();

  const handleMapLoad = async (ev: { target: MapboxMap }) => {
    const map = ev.target;
    if (!map) return;
    const center = map.getCenter();
    setZoom(map.getZoom());
    setScaleBar(getScaleBar(center.lat, map.getZoom()));
    applyMapLanguage(map, mapLang);
    applyPoiZoomFilter(map);
    await manageDynamicPoiLayer(map, mapLang);

    // 줌 변경 시 동적 POI 레이어 관리
    map.on("zoomend", async () => {
      const center = map.getCenter();
      setZoom(map.getZoom());
      setScaleBar(getScaleBar(center.lat, map.getZoom()));
      applyPoiZoomFilter(map);
      await manageDynamicPoiLayer(map, mapLang);
    });

    // 줌/이동 중에도 실시간 업데이트
    map.on("zoom", async () => {
      const center = map.getCenter();
      const currentZoom = map.getZoom();
      setZoom(currentZoom);
      setScaleBar(getScaleBar(center.lat, currentZoom));
      await manageDynamicPoiLayer(map, mapLang);
    });
    map.on("move", () => {
      const center = map.getCenter();
      setScaleBar(getScaleBar(center.lat, map.getZoom()));
    });
  };

  return (
    <div className="relative w-full h-full" style={{ height: "calc(100vh - 56px)" }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 126.978,
          latitude: 37.5665,
          zoom: 12,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAPBOX_STYLE}
        onLoad={handleMapLoad}
        onMove={(ev) => {
          const map = ev.target;
          setZoom(map.getZoom());
          setScaleBar(getScaleBar(map.getCenter().lat, map.getZoom()));
        }}
      />
      {/* 지도 하단 스케일 바: 20, 30, 50, 100 단위, 줌에 따라 m 또는 km */}
      {/* {scaleBar && (
        <div className="flex absolute bottom-4 left-4 flex-col items-start px-3 py-2 rounded border border-gray-200 shadow backdrop-blur-sm bg-white/90">
          <div
            className="h-2 bg-gray-800 rounded"
            style={{ width: Math.min(Math.max(scaleBar.barWidthPx, 40), 120) }}
          />
          <span className="mt-1 text-xs font-medium tabular-nums text-gray-700">
            {scaleBar.value} {scaleBar.unit}
          </span>
        </div>
      )} */}
      {/* 줌 레벨 디버그 패널 */}
      <div className="hidden absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 min-w-[240px]">
        <div className="mb-3 text-xs font-semibold tracking-wide text-gray-600 uppercase">Zoom Level Debug</div>
        <div className="mb-3">
          <div className="text-3xl font-bold text-gray-900">{zoom.toFixed(2)}</div>
          <div className="mt-1 text-xs text-gray-500">Current Zoom</div>
        </div>
        <div className="pt-2 space-y-2 text-xs border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-gray-600">Studio Range:</span>
            <span className="font-mono font-semibold text-gray-900">≥ {LOW_ZOOM_THRESHOLD}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dynamic POI:</span>
            <span className="font-mono font-semibold text-gray-900">&lt; {LOW_ZOOM_THRESHOLD}</span>
          </div>
          <div className="pt-2 mt-3 border-t border-gray-200">
            <div className={`text-xs font-semibold ${zoom < LOW_ZOOM_THRESHOLD ? "text-blue-600" : "text-green-600"}`}>
              {zoom < LOW_ZOOM_THRESHOLD ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1.5"></span>
                  Dynamic POI Active
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1.5"></span>
                  Studio POI Visible
                </>
              )}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {zoom < LOW_ZOOM_THRESHOLD
                ? `Studio POI hidden (zoom < ${LOW_ZOOM_THRESHOLD})`
                : `Studio POI shown (zoom ≥ ${LOW_ZOOM_THRESHOLD})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
