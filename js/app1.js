import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { RGBELoader } from "three/addons/loaders/lwo/RGBELoader.js";

let camera, scene, renderer, controller, controls;
let mesh;

const init = () => {
	const container = document.createElement("div");
	document.body.append(container);

	scene = new THREE.Scene();
	// scene.background = new THREE.Color("black");

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.01,
		40
	);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.useLegacyLights = false;
	renderer.xr.enabled = true;
	document.body.append(renderer.domElement);

	const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
	light.position.set(0.5, 1, 0.25);
	scene.add(light);

	// const geometry = new THREE.IcosahedronGeometry(0.1, 1);
	// const material = new THREE.MeshPhongMaterial({
	// 	color: new THREE.Color("rgb(226,35,213)"),
	// 	shininess: 6,
	// 	flatShading: true,
	// 	transparent: 1,
	// 	opacity: 0.8,
	// });

	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.set(0, 0, -0.5);
	// console.log(mesh.position);
	// scene.add(mesh);

	document.body.appendChild(ARButton.createButton(renderer));

	// function adds an object to the scene after user's click

	// function onSelect() {
	// 	const material = new THREE.MeshPhongMaterial({
	// 		color: 0xffffff * Math.random(),
	// 	});
	// 	const mesh = new THREE.Mesh(geometry, material);
	// 	mesh.position.set(0, 0, -0.3).applyMatrix4(controller.matrixWorld);
	// 	mesh.quaternion.setFromRotationMatrix(controller.matrixWorld);
	// 	scene.add(mesh);
	// }

	// controller = renderer.xr.getController(0);
	// controller.addEventListener("select", onSelect);
	// scene.add(controller);

	loadModel("chair");

	window.addEventListener("resize", onWindowResize, false);
};

const loadModel = (model) => {
	let loader = new GLTFLoader().setPath("../3d/");
	loader.load(model + ".glb", (glb) => {
		// const group = new THREE.Group();
		// group.add(glb.scene);
		// console.log(glb.asset);
		let obj = new THREE.Object3D();

		// obj = glb.scene.scale.set(
		// 	0.001 * glb.scene.scale.x,
		// 	0.001 * glb.scene.scale.y,
		// 	0.001 * glb.scene.scale.z
		// );
		obj = glb.scene;
		obj.position.set(0, -0.1, -0.5);
		// obj.scale.set(
		// 	0.01 * glb.scene.scale.x,
		// 	0.01 * glb.scene.scale.y,
		// 	0.01 * glb.scene.scale.z
		// );
		// console.log(obj);

		scene.add(obj);
	});
};

const onWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
	requestAnimationFrame(animate);
	renderer.setAnimationLoop(render);
};

const render = () => {
	renderer.render(scene, camera);
};

init();
animate();
