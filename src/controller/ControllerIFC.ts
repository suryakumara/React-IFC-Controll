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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { IFCLoader } from "three/examples/jsm/loaders/IFCLoader";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
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
  pickHelper: PickHelper;
  pickPosition: Vector2;
  pickedObject: Mesh | null;
  pickedObjectPosition: Vector3 | undefined;
  pickedObjectRotation: Euler | undefined;
  pickedObjectData: { dasId: string };
  listObjectLoaded: Array<Object3D>;
  panelControl: Controller;
  labelControl: CSS2DRenderer;

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
    this.ifcLoader.ifcManager.setWasmPath("../assets/");

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

    // ======================= control ================== //
    this.control = new OrbitControls(this.camera, this.labelControl.domElement);
    this.control.target.set(-2, 0, 0);
    this.transformControl = new TransformControls(this.camera, this.labelControl.domElement);
    this.transformControl.size = 0.5;

    this.onChangeSize();
    this.update();
    this.transformControlMode();
    this.handleTransformControl();

    const model = new Model(this.scene, this.gltfLoader, this.listObjectLoaded, this.labelControl);
    model.loadGLTFAOA();
    model.loadGLTFBeacon();
    model.loadGLTFHuman();

    // ======================= pick event ===================== //
    document.addEventListener("mousemove", this.onHoverObject, false);
    document.addEventListener("click", this.onClickObject, false);
  }

  onHoverObject = (event: MouseEvent) => {
    event.preventDefault();
    this.pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pickHelper.onSelected(this.pickPosition, this.camera, this.listObjectLoaded);
  };

  onClickObject = (event: MouseEvent) => {
    this.pickPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.pickPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.pickHelper.onSelected(this.pickPosition, this.camera, this.listObjectLoaded);
    this.pickedObject = this.pickHelper.pickedObject as Mesh;
    this.addTransformControl();
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

  loadIFCModel = () => {
    this.ifcLoader.load("/assets/01.ifc", async (ifcModel) => {
      this.scene.add(ifcModel);
    });
  };

  update = () => {
    this.renderer.render(this.scene, this.camera);
    this.labelControl.render(this.scene, this.camera);

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
