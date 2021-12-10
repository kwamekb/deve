import * as THREE from "https://cdn.skypack.dev/three/build/three.module.js";
import {
  OrbitControls
} from "https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js";
import {
  GUI
} from 'https://cdn.skypack.dev/three/examples/jsm/libs/lil-gui.module.min.js';
import {
  Water
} from 'https://cdn.skypack.dev/three/examples/jsm/objects/Water2.js';

let camera,
  scene,
  renderer,
  textureBack,
  textureFront,
  textureRight,
  textureLeft;

// wall parameters
const params = {
  brightness: 1.5,
  color: '#BCD6E6',
  scale: 10,
  flowX: 0,
  flowY: 0
};

init();

function init() {
  // renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // camera
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    500
  );
  camera.position.set(0, 75, 160);

  // controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 40, 0);
  controls.maxDistance = 400;
  controls.minDistance = 10;
  controls.update();

  // wall texture
  // https://threejs.org/examples/webgl_water.html
  const textureGeometry = new THREE.PlaneGeometry(100, 100);
  const textureMaterial = {
    color: params.color,
    scale: params.scale,
    flowDirection: new THREE.Vector2(params.flowX, params.flowY),
    textureWidth: 1024,
    textureHeight: 1024,
  };

  textureBack = new Water(textureGeometry, textureMaterial);
  textureBack.position.z = -49.98;
  textureBack.position.y = 50;
  scene.add(textureBack);

  textureFront = new Water(textureGeometry, textureMaterial);
  textureFront.position.z = 49.98;
  textureFront.position.y = 50;
  textureFront.rotateY(Math.PI);
  scene.add(textureFront);

  textureRight = new Water(textureGeometry, textureMaterial);
  textureRight.position.x = 49.98;
  textureRight.position.y = 50;
  textureRight.rotateY(-Math.PI / 2);
  scene.add(textureRight);

  textureLeft = new Water(textureGeometry, textureMaterial);
  textureLeft.position.x = -49.98;
  textureLeft.position.y = 50;
  textureLeft.rotateY(Math.PI / 2);
  scene.add(textureLeft);

  // virtual agent
  const agentGeometry = new THREE.PlaneGeometry(100.1, 100.1);
  agentGeometry.clearGroups();
  agentGeometry.addGroup(0, Infinity, 0);
  agentGeometry.addGroup(0, Infinity, 1);
  const texture = new THREE.TextureLoader().load("./img/agent5.png");
  const agentMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true
  });

  const agent = new THREE.Mesh(agentGeometry, agentMaterial);
  agent.position.z = -49.96;
  agent.position.y = 50;
  scene.add(agent);

  // walls
  // https://threejs.org/examples/#webgl_refraction
  const wallGeometry = new THREE.PlaneGeometry(100.1, 100.1);
  const wallMaterial = new THREE.MeshPhongMaterial({
    color: 'white'
  });

  const wallBottom = new THREE.Mesh(
    wallGeometry,
    new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.6,
      metalness: 0
    })
  );
  wallBottom.rotateX(-Math.PI / 2);
  scene.add(wallBottom);

  const wallBack = new THREE.Mesh(wallGeometry, wallMaterial);
  wallBack.position.z = -50;
  wallBack.position.y = 50;
  scene.add(wallBack);

  const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
  wallFront.position.z = 50;
  wallFront.position.y = 50;
  wallFront.rotateY(Math.PI);
  scene.add(wallFront);

  const wallRight = new THREE.Mesh(wallGeometry, wallMaterial);
  wallRight.position.x = 50;
  wallRight.position.y = 50;
  wallRight.rotateY(-Math.PI / 2);
  scene.add(wallRight);

  const wallLeft = new THREE.Mesh(wallGeometry, wallMaterial);
  wallLeft.position.x = -50;
  wallLeft.position.y = 50;
  wallLeft.rotateY(Math.PI / 2);
  scene.add(wallLeft);

  // lights
  const mainLight = new THREE.PointLight(0xcccccc, params.brightness, 250); // Change
  mainLight.position.y = 60;
  scene.add(mainLight);

  const rightLight = new THREE.PointLight('white', 0.25, 1000);
  rightLight.position.set(550, 50, 0);
  scene.add(rightLight);

  const leftLight = new THREE.PointLight('white', 0.25, 1000);
  leftLight.position.set(-550, 50, 0);
  scene.add(leftLight);

  const backLight = new THREE.PointLight('white', 0.25, 1000);
  backLight.position.set(0, 50, 550);
  scene.add(backLight);

  const frontLight = new THREE.PointLight('white', 0.25, 1000);
  frontLight.position.set(0, 50, -550);
  scene.add(frontLight);

  // gui
  const gui = new GUI();
  gui.add(params, 'scale', 1, 10).onChange(function (value) {
    textureBack.material.uniforms['config'].value.w = value;
    textureFront.material.uniforms['config'].value.w = value;
    textureRight.material.uniforms['config'].value.w = value;
    textureLeft.material.uniforms['config'].value.w = value;
  });
  gui.add(params, 'flowY', -1, 1).step(0.01).onChange(function (value) {
    textureBack.material.uniforms['flowDirection'].value.y = value;
    textureBack.material.uniforms['flowDirection'].value.normalize();
    textureFront.material.uniforms['flowDirection'].value.y = value;
    textureFront.material.uniforms['flowDirection'].value.normalize();
    textureRight.material.uniforms['flowDirection'].value.y = value;
    textureRight.material.uniforms['flowDirection'].value.normalize();
    textureLeft.material.uniforms['flowDirection'].value.y = value;
    textureLeft.material.uniforms['flowDirection'].value.normalize();
  });
  gui.open();

  window.addEventListener("resize", onWindowResize);
}

// window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// animation loop
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();