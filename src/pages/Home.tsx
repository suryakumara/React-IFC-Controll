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
  width: 100%;

  & > button {
    margin: 10px;
    width: 152px;
  }
`;

const Container = styled("div")`
  height: 100vh;
  width: 100vh;
`;

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerIFCRef = useRef<ControllerIFC>();
  const [selectedPosition, setSelectedPosition] = useState<{
    x?: number;
    y?: number;
    z?: number;
  }>();
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
    const newVal = controllerIFCRef.current?.pickedObjectPosition;
    console.log(newVal);
    setSelectedPosition({ x: newVal?.x, y: newVal?.y, z: newVal?.z });
  };

  return (
    <Container>
      <input type="file" name="load" accept=".ifc" onChange={handleChange} id="file-input" />
      <ContainerInfo>
        <label htmlFor="x">
          x
          <input
            type="text"
            defaultValue={selectedPosition ? selectedPosition.x : ""}
            name="x"
            readOnly
            disabled
          />
        </label>

        <label htmlFor="x">
          y
          <input
            type="text"
            defaultValue={selectedPosition ? selectedPosition.y : ""}
            name="y"
            readOnly
            disabled
          />
        </label>

        <label htmlFor="x">
          z
          <input
            type="text"
            defaultValue={selectedPosition ? selectedPosition.z : ""}
            name="z"
            readOnly
            disabled
          />
        </label>

        <button onClick={handleGetPosition}>Save</button>
        <p>Press R to Rotate Object, G: to moving Object</p>
      </ContainerInfo>
      <Canvas id="three-canvas" ref={canvasRef}></Canvas>
    </Container>
  );
};

export default Home;
