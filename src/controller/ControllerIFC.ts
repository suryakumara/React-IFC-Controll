import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Euler,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

import { Easing, Tween, update } from "@tweenjs/tween.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { Controller } from "./Controller";
import { Model } from "./Model";
import { PickHelper } from "./PickHelper";

export class ControllerIFC {
  scene: Scene;
  grid: any;
  camera: PerspectiveCamera;
  threeCanvas: any;
  renderer: WebGLRenderer;
  size: {
    width: number;
    height: number;
  };
  boxGeometry: BoxGeometry;
  cube: Mesh;
  control: OrbitControls;
  material: MeshBasicMaterial;
  ifcLoader: IFCLoader;
  gltfLoader: GLTFLoader;
  transformControl: TransformControls;
  flyControl?: FlyControls;
  pickHelper: PickHelper;
  pickPosition: Vector2;
  pickedObject: Mesh | null;
  pickedObjectPosition: Vector3 | undefined;
  pickedObjectRotation: Euler | undefined;
  pickedObjectData: { dasId: string };
  listObjectLoaded: Array<Object3D>;
  panelControl: Controller;
  labelControl: CSS2DRenderer;
  tweenControl: Tween<{ x: number; y: number; z: number }>;

  constructor(canvasRef: HTMLCanvasElement) {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const aspect = this.size.width / this.size.height;

    this.scene = new Scene();
    this.grid = new GridHelper(15, 15);
    this.scene.add(this.grid);
    this.camera = new PerspectiveCamera(75, aspect);
    this.camera.position.z = 15;
    this.camera.position.y = 13;
    this.camera.position.x = 8;

    this.camera.layers.enableAll();

    const lightColor = 0xffffff;

    const ambientLight = new AmbientLight(lightColor, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(lightColor, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(-5, 0, 0);
    this.scene.add(directionalLight);
    this.scene.add(directionalLight.target);

    this.renderer = new WebGLRenderer({
      canvas: canvasRef,
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ======================= ifcLoader ================== //
    this.ifcLoader = new IFCLoader();
    this.ifcLoader.ifcManager.setWasmPath("../../");

    // ======================= gltfLoader ================== //
    this.gltfLoader = new GLTFLoader();

    // ======================= mesh ===================== //
    this.material = new MeshBasicMaterial({ color: 0xff4f40 });
    this.boxGeometry = new BoxGeometry(5, 5, 5);
    this.cube = new Mesh(this.boxGeometry, this.material);
    this.cube.position.z = -17;
    this.scene.add(this.cube);
    this.listObjectLoaded = [];

    // ======================= pick object handler ===================== //
    this.pickHelper = new PickHelper();
    this.pickPosition = new Vector2();
    this.pickedObject = null;
    this.pickedObjectPosition = undefined;
    this.pickedObjectRotation = undefined;
    this.pickedObjectData = { dasId: "" };

    // ======================= controller ===================== //
    this.panelControl = new Controller(this.renderer);
    this.labelControl = new CSS2DRenderer();
    this.flyControl = undefined;

    this.tweenControl = new Tween({
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    });

    // ======================= control ================== //
    this.control = new OrbitControls(this.camera, this.labelControl.domElement);
    this.control.target.set(-2, 0, 0);
    this.transformControl = new TransformControls(this.camera, this.labelControl.domElement);
    this.transformControl.size = 0.5;

    this.onChangeSize();
    this.update();
    this.transformControlMode();
    this.handleTransformControl();

    const model = new Model(
      this.scene,
      this.camera,
      this.gltfLoader,
      this.listObjectLoaded,
      this.labelControl,
      this.ifcLoader,
      this.tweenControl
    );
    model.loadGLTFAOA();
    model.loadGLTFBeacon();
    model.loadGLTFHuman();

    // ======================= pick event ===================== //
    document.addEventListener("mousemove", this.onHoverObject, false);
    document.addEventListener("click", this.onClickObject, false);
  }

  onHoverObject = (event: MouseEvent) => {
    this.pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pickHelper.onSelected(
      this.pickPosition,
      this.camera,
      this.listObjectLoaded,
      this.tweenControl
    );
  };

  onClickObject = (event: MouseEvent) => {
    this.pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pickHelper.onSelected(
      this.pickPosition,
      this.camera,
      this.listObjectLoaded,
      this.tweenControl
    );
    this.pickedObject = this.pickHelper.pickedObject as Mesh;

    this.addTransformControl();
    this.updateClick();
  };

  updateClick = () => {
    if (this.pickedObject) {
      this.control.enabled = false;
      const coord = {
        x: this.camera.position.x,
        y: this.camera.position.y,
        z: this.camera.position.z,
      };

      new Tween(coord)
        .to({
          x: this.pickedObject.position.x,
          y: this.pickedObject.position.y + 2,
          z: this.pickedObject.position.z,
        })
        .easing(Easing.Quadratic.Out)
        .onUpdate(() => {
          this.camera.position.set(coord.x, coord.y, coord.z);
        })
        .onComplete(() => {
          this.control.enabled = true;

          this.control.update();
        })
        .start();

      // const controlCoord = {
      //   x: this.control.target.x,
      //   y: this.control.target.y,
      //   z: this.control.target.z,
      // };
    }
  };

  addTransformControl = () => {
    if (this.pickedObject) {
      this.transformControl.attach(this.pickedObject);
      this.scene.add(this.transformControl);
    } else {
      this.transformControl.detach();
    }
  };

  transformControlMode = () => {
    window.addEventListener("keydown", (event) => {
      switch (event.code) {
        case "KeyG":
          this.transformControl.setMode("translate");
          break;
        case "KeyR":
          this.transformControl.setMode("rotate");
          break;
      }
    });
  };

  loadIFCModel = async (file: File) => {
    const ifcURL = URL.createObjectURL(file);
    await this.ifcLoader.load(ifcURL, async (ifcModel) => {
      this.scene.add(ifcModel);
    });
  };

  update = () => {
    this.renderer.render(this.scene, this.camera);
    this.labelControl.render(this.scene, this.camera);
    update();

    requestAnimationFrame(this.update);
  };

  onChangeSize = () => {
    window.addEventListener("resize", () => {
      this.size.width = window.innerWidth;
      this.size.height = window.innerHeight;
      this.camera.aspect = this.size.width / this.size.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.width, this.size.height);
    });
  };

  handleTransformControl = () => {
    this.transformControl.addEventListener("dragging-changed", (event) => {
      this.pickedObjectPosition = this.pickedObject?.position;
      this.pickedObjectRotation = this.pickedObject?.rotation;
      this.pickedObjectData.dasId = this.pickedObject?.userData.dasId;
      this.control.enabled = !event.value;
    });
  };

  setDarkMode = () => {
    this.panelControl.setDarkMode();
  };

  setLightMode = () => {
    this.panelControl.setLightMode();
  };

  setEnableAOA = () => {
    this.camera.layers.enable(1);
  };

  setDisableAOA = () => {
    this.camera.layers.disable(1);
  };

  setEnableBeacon = () => {
    this.camera.layers.enable(2);
  };

  setDisableBeacon = () => {
    this.camera.layers.disable(2);
  };
}
