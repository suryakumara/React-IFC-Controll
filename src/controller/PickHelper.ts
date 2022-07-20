import { Tween } from "@tweenjs/tween.js";
import {
  Box3,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class PickHelper {
  raycaster: Raycaster;
  pickedObject: null | undefined | Object3D;
  pickedObjectMaterial: Material[] | Material | null;

  constructor() {
    this.raycaster = new Raycaster();
    this.pickedObject = null;
    this.pickedObjectMaterial = null;
  }

  onSelected(
    normalizedPosition: {
      x: number;
      y: number;
    },
    camera: PerspectiveCamera,
    objects: Array<Object3D>,
    tweenControl: Tween<{ x: number; y: number; z: number }>
  ) {
    this.unSubscribe();
    this.onSubScribe(normalizedPosition, camera, objects, tweenControl);
  }

  unSubscribe = () => {
    if (this.pickedObject) {
      if (this.pickedObject instanceof Group) {
        this.pickedObject.children.forEach((obj, i) => {
          const material = this.pickedObjectMaterial?.[i];
          if (obj instanceof Mesh) {
            obj.material = material;
          }
        });
      }
      this.pickedObject = undefined;
    }
  };

  onSubScribe = (
    normalizedPosition: {
      x: number;
      y: number;
    },
    camera: PerspectiveCamera,
    objects: Array<Object3D>,
    tweenControl: Tween<{ x: number; y: number; z: number }>
  ) => {
    this.raycaster.setFromCamera(normalizedPosition, camera);
    const intersectedObjects = this.raycaster.intersectObjects(objects, true);

    if (intersectedObjects.length > 0) {
      this.pickedObject = intersectedObjects[0].object.parent;

      if (this.pickedObject instanceof Group) {
        this.pickedObjectMaterial = this.pickedObject.children.map((obj) => {
          if (obj instanceof Mesh) {
            return obj.material;
          }
          return [];
        });
        this.pickedObject.children.forEach((obj) => {
          if (obj instanceof Mesh) {
            obj.material = new MeshBasicMaterial({ color: 0xff0000 });
          }
        });
      }
    }
  };

  fitToView = (camera: PerspectiveCamera, control: OrbitControls, obj: Group, fitRatio = 1.2) => {
    const box = new Box3();
    box.expandByObject(obj);

    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / ((2 * Math.atan(Math.PI * camera.fov)) / 360);
    const fitWIdthDistance = fitHeightDistance / camera.aspect;

    const distance = fitRatio * Math.max(fitHeightDistance, fitWIdthDistance);

    const direction = control.target
      .clone()
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);

    control.maxDistance = distance * 10;
    control.target.copy(center);

    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    camera.position.copy(control.target).sub(direction);

    control.update();
  };
}
