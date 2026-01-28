import DimensionToggle from "./DimensionToggle";
import CenterModel from "./CenterModel";
import DeviceContoller from "./DeviceContoller";
import Heatmap from "./Heatmap";

import { SearchIcon } from "lucide-react";

interface ControlsProps {
    is2D: boolean;
    isDimensionLoading: boolean;
    isAddDeviceMode: boolean;
    isHeatmap: boolean;
    onToggleDimension: () => void;
    onToggleAddDeviceMode: () => void;
    onToggleDeviceListMode: () => void;
    onResetCamera: () => void;
    onToggleHeatmap: () => void;
    onSearchDeviceWithText: (serialNumber: string) => void;
}

const Controls = ({
    is2D,
    isDimensionLoading,
    isAddDeviceMode,
    isHeatmap,
    onToggleDimension,
    onToggleAddDeviceMode,
    onToggleDeviceListMode,
    onResetCamera,
    onToggleHeatmap,
    onSearchDeviceWithText,
}: ControlsProps) => {
    return (
        <>
            {/* 시리얼넘버검색 */}
            <div className="flex overflow-hidden gap-1 bg-white rounded-lg w-[240px] absolute top-6 left-1/2 -translate-x-1/2 z-10 text-black">
                <button className="text-black">
                    <SearchIcon className="w-4 h-4" />
                </button>
                <input
                    className="mr-2 bg-white outline-none grow focus:outline-none"
                    type="text"
                    placeholder="Device Serial Number"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearchDeviceWithText(e.currentTarget.value);
                        }
                    }}
                />
            </div>
            <div className="flex absolute bottom-8 left-8 z-10 flex-col gap-2 p-2 text-xs text-black shadow-me">
                <Heatmap
                    isHeatmap={isHeatmap}
                    onToggleHeatmap={onToggleHeatmap}
                />
                <CenterModel onResetCamera={onResetCamera} />
                <DimensionToggle
                    is2D={is2D}
                    isDimensionLoading={isDimensionLoading}
                    onToggleDimension={onToggleDimension}
                />
            </div>
            {/* 기기 설치 | 리스트 */}
            <DeviceContoller
                is2D={is2D}
                isAddDeviceMode={isAddDeviceMode}
                onToggleAddDeviceMode={onToggleAddDeviceMode}
                onToggleDeviceListMode={onToggleDeviceListMode}
            />
        </>
    );
};

export default Controls;
