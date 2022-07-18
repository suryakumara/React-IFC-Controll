/* eslint-disable @typescript-eslint/no-unused-vars */
import { Brightness4, DarkMode } from "@mui/icons-material";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  styled,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { MathUtils } from "three";
import { ControllerIFC } from "../controller/ControllerIFC";
import "./Home.css";

const Canvas = styled("canvas")`
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
`;

const ContainerInfo = styled("div")`
  position: relative;
  display: flex;
  flex-direction: column;
  z-index: 100;
  left: 1rem;
  top: 1rem;
  width: 100%;

  & > button {
    margin: 10px;
    width: 152px;
  }
  & > .container-switch {
    position: absolute;
    right: 1rem;
    top: 1rem;
    display: flex;
    flex-direction: column;
  }
`;

interface ContainerProps {
  isDarkMode: boolean;
}
// prettier-ignore
const Container = styled("div", {shouldForwardProp: (props) => props !== "isDarkMode", })<ContainerProps>`
  height: 100vh;
  width: 100vh;
  color: ${({ isDarkMode }) => (isDarkMode ? "white" : "black")};

 
`;

const Container3D = styled("div")``;

const Input = styled(TextField)`
  & .MuiInputBase-root {
    height: 2rem;
    margin-right: 10px;
  }
`;

const Home = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controllerIFCRef = useRef<ControllerIFC>();
  const [selectedPosition, setSelectedPosition] = useState<{
    x?: number;
    y?: number;
    z?: number;
  }>();
  const [selectedRotation, setSelectedRotation] = useState<{
    x?: number;
    y?: number;
    z?: number;
  }>();
  const [objectSelected, setObjectSelected] = useState({ id: "" });
  const [checked, setChecked] = useState({
    isDarkMode: false,
    aoa: true,
    beacon: true,
  });

  useEffect(() => {
    if (canvasRef.current) {
      controllerIFCRef.current = new ControllerIFC(canvasRef.current);
    }
  }, [canvasRef]);

  const handleGetPosition = () => {
    const newVal = controllerIFCRef.current?.pickedObjectPosition;
    const newRot = controllerIFCRef.current?.pickedObjectRotation;
    const pickedObject = controllerIFCRef.current?.pickedObjectData.dasId ?? "";
    const newRotation = {
      x: MathUtils.radToDeg(newRot?.x ?? 0),
      y: MathUtils.radToDeg(newRot?.y ?? 0),
      z: MathUtils.radToDeg(newRot?.z ?? 0),
    };
    setSelectedRotation(newRotation);
    setSelectedPosition({ x: newVal?.x, y: newVal?.y, z: newVal?.z });
    setObjectSelected({ id: pickedObject });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newState = event.target.checked;
    const stateName = event.target.name;
    setChecked({
      ...checked,
      [stateName]: newState,
    });

    if (stateName === "isDarkMode") {
      if (newState) {
        controllerIFCRef.current?.setDarkMode();
      } else {
        controllerIFCRef.current?.setLightMode();
      }
    } else if (stateName === "aoa") {
      if (newState) {
        controllerIFCRef.current?.setEnableAOA();
      } else {
        controllerIFCRef.current?.setDisableAOA();
      }
    } else if (stateName === "beacon") {
      if (newState) {
        controllerIFCRef.current?.setEnableBeacon();
      } else {
        controllerIFCRef.current?.setDisableBeacon();
      }
    }
  };

  return (
    <Container isDarkMode={checked.isDarkMode}>
      <ContainerInfo>
        <Typography sx={{ textAlign: "end", color: "inherit" }}>
          Press R to Rotate Object, G: to moving Object
        </Typography>
        <FormControlLabel
          label="ID"
          sx={{ marginBottom: "10px", color: "inherit" }}
          control={
            <Input
              type="text"
              value={objectSelected.id ? objectSelected.id : ""}
              name="ID"
              disabled
              placeholder="dasId"
              sx={{ color: "inherit", borderColor: "white" }}
            />
          }
        />
        <FormControlLabel
          label="pos X"
          sx={{ marginBottom: "10px" }}
          control={
            <Input
              type="text"
              value={selectedPosition?.x ?? ""}
              name="x"
              disabled
              placeholder="x"
            />
          }
        />
        <FormControlLabel
          label="pos Y"
          sx={{ marginBottom: "10px" }}
          control={
            <Input
              type="text"
              value={selectedPosition?.y ?? ""}
              name="y"
              disabled
              placeholder="y"
            />
          }
        />
        <FormControlLabel
          label="pos Z"
          sx={{ marginBottom: "10px" }}
          control={
            <Input
              type="text"
              value={selectedPosition?.z ?? ""}
              name="z"
              disabled
              placeholder="z"
            />
          }
        />
        <FormControlLabel
          label="rot Z"
          sx={{ marginBottom: "10px", color: "red" }}
          control={
            <Input
              type="text"
              value={selectedRotation?.z ?? ""}
              name="z"
              disabled
              placeholder="degree"
            />
          }
        />
        <div className="container-switch">
          <FormControl variant="filled">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={checked.isDarkMode}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                    checkedIcon={<DarkMode sx={{ color: "white" }} />}
                    icon={<Brightness4 sx={{ color: "black" }} />}
                    size="medium"
                    name="isDarkMode"
                  />
                }
                label="Light / Dark"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={checked.aoa}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                    size="medium"
                    name="aoa"
                  />
                }
                label="Enable AOA"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={checked.beacon}
                    onChange={handleChange}
                    inputProps={{ "aria-label": "controlled" }}
                    size="medium"
                    name="beacon"
                  />
                }
                label="Enable Beacon"
              />
            </FormGroup>
          </FormControl>
        </div>

        <Button onClick={handleGetPosition} variant="contained">
          Save
        </Button>
      </ContainerInfo>
      <Container3D>
        <Canvas ref={canvasRef}></Canvas>
      </Container3D>
    </Container>
  );
};

export default Home;
