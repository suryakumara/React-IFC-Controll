/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Group, Object3D } from "three";

export class Model {
  scene: any;
  gltfLoader: GLTFLoader;
  listObjectLoaded: any;
  labelControl: CSS2DRenderer;
  humanScene: Group | undefined;

  constructor(scene, gltfLoader, listObjectLoaded, labelControl) {
    this.scene = scene;
    this.gltfLoader = gltfLoader;
    this.listObjectLoaded = listObjectLoaded;
    this.labelControl = labelControl;
    this.humanScene = undefined;
  }

  loadGLTFBeacon = () => {
    /*
      About Model : 
      1. Model GLTF Loaded is a Group of model
      2. Contain 3 Meshes, eq: [Light, Object, Group]
      3. We can select the object by selecting group
    */

    this.gltfLoader.load("/assets/beacon/beacon_fix.gltf", (gltf) => {
      const dasId = "BAAATPE000883";
      const beaconScene = gltf.scene;
      const beaconGroup = beaconScene.children.find((obj) => obj.type === "Group");
      if (beaconGroup) beaconGroup.userData.dasId = dasId;
      beaconScene.position.x = 7;
      this.listObjectLoaded.push(beaconScene);
      this.scene.add(beaconScene);
      this.addLabel(beaconGroup, dasId, 2);
    });
  };

  loadGLTFAOA = () => {
    this.gltfLoader.load("/assets/aoa/aoa.gltf", (gltf) => {
      const dasId = "AOA12345678";
      const aoaScene = gltf.scene;
      const aoaGroup = aoaScene.children.find((obj) => obj.type === "Group");
      if (aoaGroup) aoaGroup.userData.dasId = dasId;
      this.listObjectLoaded.push(aoaScene);
      this.scene.add(aoaScene);
      this.addLabel(aoaGroup, dasId, 1);
    });
  };

  loadGLTFHuman = () => {
    this.gltfLoader.load("/assets/human3.gltf", (gltf) => {
      const dasId = "LVBCHKG003461";
      this.humanScene = gltf.scene;
      this.humanScene.userData.dasId = dasId;
      this.humanScene.position.x = -7;
      this.listObjectLoaded.push(this.humanScene);
      this.scene.add(this.humanScene);
      this.addLabel(this.humanScene, dasId, 0);
    });
  };

  addLabel = (model?: Group | Object3D, labelText?: string, labelLayer?: number) => {
    if (model) {
      const label = document.createElement("div");
      label.className = "label-3d-aoa";
      label.textContent = labelText ?? "";
      label.style.textShadow = "2px 2px 6px #78DC00";
      label.style.cursor = "pointer";
      const objectLabel = new CSS2DObject(label);
      objectLabel.position.set(0, 3, 0);
      model.add(objectLabel);
      objectLabel.layers.set(labelLayer ?? 0);
      this.labelControl.setSize(window.innerWidth, window.innerHeight);
      this.labelControl.domElement.style.position = "absolute";
      this.labelControl.domElement.style.top = "0px";
      document.body.appendChild(this.labelControl.domElement);
    }
  };
}
