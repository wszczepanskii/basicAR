import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let camera,
	scene,
	renderer,
	controller,
	controls,
	reticle,
	mixer,
	hasLoaded = false,
	deltaTime,
	totalTime,
	clock;
let obj = new THREE.Object3D();
let isModel = false;

let hitTestSource = null;
let hitTestSourceRequested = false;

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

	clock = new THREE.Clock();
	deltaTime = 0;
	totalTime = 0;

	// function adds an object to the scene after user's click

	function onSelect() {
		// if (!isModel) loadModel("chair");
		// isModel = true;

		if (reticle.visible && !isModel) {
			loadModel("doc_animated_smaller");
			isModel = true;

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
			// reticle.matrix.decompose(mesh2.position, mesh2.quaternion, mesh2.scale);
			// mesh2.scale.y = Math.random() * 2 + 1;
			// scene.add(mesh2);
		}
	}

	controller = renderer.xr.getController(0);
	controller.addEventListener("select", onSelect);
	scene.add(controller);

	window.addEventListener("resize", onWindowResize, false);
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

function loadModel(model) {
	let loader = new GLTFLoader().setPath("models/");
	loader.load(
		model + ".glb",
		(glb) => {
			obj = glb.scene;
			obj.scale.set(
				0.5 * glb.scene.scale.x,
				0.5 * glb.scene.scale.y,
				0.5 * glb.scene.scale.z
			);

			obj.position.set(0, 0, -0.6).applyMatrix4(controller.matrixWorld);
			// obj.quaternion.setFromRotationMatrix(controller.matrixWorld);
			scene.add(obj);
			hasLoaded = true;

			mixer = new THREE.AnimationMixer(obj);
			const clips = glb.animations;
			const clip = THREE.AnimationClip.findByName(clips, "Take 001");
			const action = mixer.clipAction(clip);
			action.play();

			clips.forEach((clip) => {
				mixer.clipAction(clip).play();
			});
		},
		onProgress,
		onError
	);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
	if (hasLoaded && mixer !== undefined) mixer.update(deltaTime);
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

function animate() {
	renderer.setAnimationLoop(render);
	requestAnimationFrame(animate);

	deltaTime = clock.getDelta();
	totalTime += deltaTime;

	update();
}

let touchDown, touchX, touchY, deltaX, deltaY;

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
