import { styled } from "@mui/material";
import { useEffect, useRef } from "react";
import { IfcViewerAPI } from "web-ifc-viewer";

const Container = styled("div")`
  width: 100vw;
  height: 50vh;
`;

const Dashboard = () => {
  const viewerRef = useRef<IfcViewerAPI>();

  useEffect(() => {
    const container = document.getElementById("viewer-container");
    if (container) {
      const viewer = new IfcViewerAPI({ container });
      viewer.axes.setAxes();
      viewer.grid.setGrid();
      viewer.IFC.setWasmPath("../../");
      viewerRef.current = viewer;

      //   window.onmousemove = viewer.IFC.selector.prePickIfcItem
      window.ondblclick = viewer.clipper.createPlane;
    }

    return () => {};
  });

  const handleLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (viewerRef.current && file) {
      await viewerRef.current.IFC.loadIfc(file, true);
    }
  };

  return (
    <Container>
      <input type="file" onChange={handleLoadFile} />
      <div id="viewer-container" style={{ position: "relative", height: "100%", width: "100%" }} />
    </Container>
  );
};

export default Dashboard;
