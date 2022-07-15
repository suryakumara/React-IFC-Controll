import { Camera, Group, Material, Mesh, MeshBasicMaterial, Object3D, Raycaster } from "three";

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
    camera: Camera,
    objects: Array<Object3D>
  ) {
    this.unSubscribe();
    this.onSubScribe(normalizedPosition, camera, objects);
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
    camera: Camera,
    objects: Array<Object3D>
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
}
