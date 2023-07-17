import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/lwo/RGBELoader.js";

let camera, scene, renderer;
let mesh;

const init = () => {
	const container = document.createElement("div");
	document.body.append(container);

	scene = new THREE.Scene();
	scene.background = new THREE.Color("black");

	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.01,
		40
	);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	document.body.append(renderer.domElement);

	const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
	light.position.set(0.5, 1, 0.25);
	scene.add(light);

	const geometry = new THREE.IcosahedronGeometry(0.1, 1);
	const material = new THREE.MeshPhongMaterial({
		color: new THREE.Color("rgb(226,35,213)"),
		shininess: 6,
		flatShading: true,
		transparent: 1,
		opacity: 0.8,
	});

	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 0, -0.5);
	scene.add(mesh);

	// let options = {
	// 	requiredFeatures: ["hit-test"],
	// 	optionalFeatures: ["dom-overlay"],
	// };

	// options.domOverlay = { root: document.getElementById("content") };

	// document.body.appendChild(ARButton.createButton(renderer, options));

	document.body.appendChild(
		ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
	);

	window.addEventListener("resize", onWindowResize, false);
};

const onWindowResize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};

const animate = () => {
	renderer.setAnimationLoop(render);
};

const render = () => {
	renderer.render(scene, camera);
};

init();
render();
