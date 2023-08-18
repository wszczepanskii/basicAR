import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let camera, scene, renderer, controller, reticle, hasLoaded;

let obj = new THREE.Object3D();
let isModel = false;
let hitTestSource = null;
let hitTestSourceRequested = false;

let modelArray = [];

init();
animate();

function init() {
	const container = document.createElement("div");
	document.body.append(container);
	scene = new THREE.Scene();
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

	addReticleToScene();

	document.body.appendChild(
		ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] })
	);

	const laodModel = (url) => {
		return new Promise((resolve) => {
			new GLTFLoader().load(url, resolve);
		});
	};

	let p1 = laodModel("models/chair.glb").then((result) => {
		let obj = result.scene;
		modelArray[0] = result;
		modelArray[0].scene.scale.set(
			1.2 * modelArray[0].scene.scale.x,
			1.2 * modelArray[0].scene.scale.y,
			1.2 * modelArray[0].scene.scale.z
		);

		reticle.matrix.decompose(obj.position, obj.quaternion, obj.scale);
		// modelArray[0].scene.position.y = 0.25;
		// modelArray[0].scene.rotation.x = -Math.PI / 2;

		// hasLoadedAnim = true;
	});

	let p2 = laodModel("models/doc_animated_smaller.glb").then((result) => {
		// console.log("start");
		let obj = result.scene;
		modelArray[1] = result;
		modelArray[1].scene.scale.set(
			1.2 * modelArray[1].scene.scale.x,
			1.2 * modelArray[1].scene.scale.y,
			1.2 * modelArray[1].scene.scale.z
		);

		reticle.matrix.decompose(obj.position, obj.quaternion, obj.scale);

		// console.log("middle");

		// modelArray[1].scene.position.y = 0.25;
		// modelArray[1].scene.rotation.x = -Math.PI / 2;
		// hasLoaded = true;
		// console.log("end");
	});

	const displayModel = (idx) => {
		Promise.all([p1, p2]).then(() => {
			scene.add(modelArray[idx].scene);
		});
	};

	// function adds an object to the scene after user's click
	function onSelect() {
		if (reticle.visible) {
			if (currentModelIndex === 0) {
				scene.remove(modelArray[0].scene);
				currentModelIndex++;
				displayModel(currentModelIndex);
			} else if (currentModelIndex === 1) {
				scene.remove(modelArray[1].scene);
				currentModelIndex = 0;
				displayModel(currentModelIndex);
			}

			// isModel = true;

			// let model = "chair";

			// let loader = new GLTFLoader().setPath("models/");
			// loader.load(
			// 	model + ".glb",
			// 	(glb) => {
			// 		obj = glb.scene;
			// 		// obj.scale.set(
			// 		// 	4 * glb.scene.scale.x,
			// 		// 	4 * glb.scene.scale.y,
			// 		// 	4 * glb.scene.scale.z
			// 		// );

			// 		console.log(glb.animations);

			// 		reticle.matrix.decompose(obj.position, obj.quaternion, obj.scale);
			// 		scene.add(obj);

			// 		hasLoaded = true;
			// 	},
			// 	onProgress,
			// 	onError
			// );

			// model = "doc_animated_smaller";
			// loader.load(
			// 	model + ".glb",
			// 	(glb) => {
			// 		obj = glb.scene;
			// 		// obj.scale.set(
			// 		// 	4 * glb.scene.scale.x,
			// 		// 	4 * glb.scene.scale.y,
			// 		// 	4 * glb.scene.scale.z
			// 		// );

			// 		console.log(glb.animations);

			// 		reticle.matrix.decompose(obj.position, obj.quaternion, obj.scale);
			// 		scene.add(obj);

			// 		hasLoaded = true;
			// 	},
			// 	onProgress,
			// 	onError
			// );

			// const geometry2 = new THREE.CylinderGeometry(
			// 	0.1,
			// 	0.1,
			// 	0.2,
			// 	0.32
			// ).translate(0, 0.1, 0);
			// const material2 = new THREE.MeshPhongMaterial({
			// 	color: 0xffffff * Math.random(),
			// });
			// const mesh2 = new THREE.Mesh(geometry2, material2);
			// reticle.matrix.decompose(objPos, objQua, objScale);
			// reticle.matrix.decompose(mesh2.position, mesh2.quaternion, mesh2.scale);
			// mesh2.scale.y = Math.random() * 2 + 1;
			// mesh2.position.set(0, 0, -0.6).applyMatrix4(controller.matrixWorld);
			// scene.add(mesh2);
		}
	}

	controller = renderer.xr.getController(0);
	controller.addEventListener("select", onSelect);
	scene.add(controller);

	window.addEventListener("resize", onWindowResize, false);

	renderer.domElement.addEventListener(
		"touchstart",
		(e) => {
			e.preventDefault();
			touchDown = true;
			touchX = e.touches[0].pageX;
			touchY = e.touches[0].pageY;
		},
		false
	);
	renderer.domElement.addEventListener(
		"touchend",
		(e) => {
			e.preventDefault();
			touchDown = false;
		},
		false
	);
	renderer.domElement.addEventListener(
		"touchmove",
		(e) => {
			e.preventDefault();
			if (!touchDown) {
				return;
			}
			deltaX = e.touches[0].pageX - touchX;
			deltaY = e.touches[0].pageY - touchY;
			touchX = e.touches[0].pageX;
			touchY = e.touches[0].pageY;
			rotateObject();
		},
		false
	);
}
function rotateObject() {
	if (obj && reticle.visible) {
		obj.rotation.y += deltaX / 100;
	}
}

function addReticleToScene() {
	const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
	const material = new THREE.MeshBasicMaterial();
	reticle = new THREE.Mesh(geometry, material);
	reticle.matrixAutoUpdate = false;
	reticle.visible = false;
	scene.add(reticle);
}

function onProgress(xhr) {
	console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
}

function onError(xhr) {
	console.error(xhr);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
	if (frame) {
		const referenceSpace = renderer.xr.getReferenceSpace();
		const session = renderer.xr.getSession();
		if (hitTestSourceRequested === false) {
			session.requestReferenceSpace("viewer").then(function (referenceSpace) {
				session
					.requestHitTestSource({ space: referenceSpace })
					.then(function (source) {
						hitTestSource = source;
					});
			});
			session.addEventListener("end", function () {
				hitTestSourceRequested = false;
				hitTestSource = null;
			});
			hitTestSourceRequested = true;
		}
		if (hitTestSource) {
			const hitTestResults = frame.getHitTestResults(hitTestSource);
			if (hitTestResults.length) {
				const hit = hitTestResults[0];
				reticle.visible = true;
				reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
			} else {
				reticle.visible = false;
			}
		}
	}

	renderer.render(scene, camera);
}

let touchDown, touchX, touchY, deltaX, deltaY;

if (hasLoaded) {
	obj.addEventListener(
		"touchstart",
		(e) => {
			e.preventDefault();
			touchDown = true;
			touchX = e.touches[0].pageX;
			touchY = e.touches[0].pageY;
		},
		false
	);

	obj.addEventListener(
		"touchend",
		(e) => {
			e.preventDefault();
			touchDown = false;
		},
		false
	);

	obj.addEventListener(
		"touchmove",
		(e) => {
			e.preventDefault();

			if (!touchDown) {
				return;
			}

			deltaX = e.touches[0].pageX - touchX;
			deltaY = e.touches[0].pageY - touchY;
			touchX = e.touches[0].pageX;
			touchY = e.touches[0].pageY;

			rotateObject();
		},
		false
	);
}
