import { ControllerIFC } from "./ControllerIFC";

export class Model extends ControllerIFC {
  loadGLTFBeacon = () => {
    this.gltfLoader.load("/assets/beacon/beacon_fix.gltf", (gltf) => {
      const beacon = gltf.scene;
      beacon.position.x = 7;
      this.listObjectLoaded.push(beacon);
      this.scene.add(beacon);
    });
  };

  loadGLTFAOA = () => {
    this.gltfLoader.load("/assets/aoa/aoa.gltf", (gltf) => {
      const aoa = gltf.scene;
      this.listObjectLoaded.push(aoa);
      this.scene.add(aoa);
    });
  };

  loadGLTFHuman = () => {
    this.gltfLoader.load("/assets/human3.gltf", (gltf) => {
      const human = gltf.scene;
      human.position.x = -7;
      this.listObjectLoaded.push(human);
      this.scene.add(human);
    });
  };
}
