/* eslint-disable @typescript-eslint/no-unused-vars */
import { styled } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { ControllerIFC } from "../controller/ControllerIFC";
import "./Home.css";

const Canvas = styled("canvas")`
  height: 50vh;
  width: 100vw;
`;

const ContainerInfo = styled("div")`
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 1;
  left: 1rem;
  top: 2rem;
`;

const Container = styled("div")`
  height: 100vh;
  width: 100vh;
`;

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerIFCRef = useRef<ControllerIFC>();
  const [selectedPosition, setSelectedPosition] = useState<Vector3>();
  const [file, setFile] = useState<File>();

  useEffect(() => {
    if (canvasRef.current) {
      controllerIFCRef.current = new ControllerIFC(canvasRef.current);
    }
  }, [canvasRef]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleGetPosition = () => {
    if (controllerIFCRef.current?.getObjectPosition()) {
      setSelectedPosition(controllerIFCRef.current?.getObjectPosition());
    }
  };

  return (
    <Container>
      <input type="file" name="load" accept=".ifc" onChange={handleChange} id="file-input" />
      <ContainerInfo>
        <label htmlFor="x">
          x
          <input type="text" defaultValue={selectedPosition ? selectedPosition.x : ""} name="x" />
        </label>

        <label htmlFor="x">
          y
          <input type="text" defaultValue={selectedPosition ? selectedPosition.y : ""} name="y" />
        </label>

        <label htmlFor="x">
          z
          <input type="text" defaultValue={selectedPosition ? selectedPosition.z : ""} name="z" />
        </label>

        <button onClick={handleGetPosition}>ok</button>
        <p>Press R to Rotate Object, G: to moving Object</p>
      </ContainerInfo>
      <Canvas id="three-canvas" ref={canvasRef}></Canvas>
    </Container>
  );
};

export default Home;
