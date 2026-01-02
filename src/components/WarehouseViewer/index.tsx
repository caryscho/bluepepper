import { useState } from "react";

import warehouseData from "../../data/warehouse-example.json";
import Contoller from "./DimContoller";
import ThreeDViewer from "./3D/index.tsx";
import TwoDViewer from "./2D/index.tsx";

function WarehouseViewer() {
  // 2차원 <-> 3차원 전환 상태
  const [is2D, setIs2D] = useState(false);
  // JSON에서 dimensions 가져오기
  const { length, width } = warehouseData.structure.dimensions;

  // 바닥의 중심점 계산 (원점 기준으로 창고가 0,0부터 시작한다고 가정)
  const centerX = length / 2;
  const centerZ = width / 2;

  return (
    <div className="relative" style={{ width: "100%", height: "100vh" }}>
      <Contoller is2D={is2D} onToggleDimension={() => setIs2D(!is2D)} />
      {is2D ? <TwoDViewer /> : (
        <ThreeDViewer
          centerX={centerX}
          centerZ={centerZ}
          length={length}
          width={width}
        />
      )}
    </div>
  );
}

export default WarehouseViewer;
