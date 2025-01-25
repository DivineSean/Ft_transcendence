import { useEffect, useRef } from "react";
import { create3DModel } from "../../utils/models3d";

const WorldModel = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (canvasRef.current) {
      create3DModel(canvasRef.current, "/planet/");
    }
  }, []);

  return (
    <div className="w-[240px] md:block hidden relative">
      <div
        id="loading"
        className="text-green left-64 h-full flex items-center text-h-lg-lg absolute"
      >
        Loading...
      </div>
      <canvas
        ref={canvasRef}
        className="w-[240px] min-h-full saturate-200"
      ></canvas>
    </div>
  );
};
export default WorldModel;
