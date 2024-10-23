import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import spline from './spline.js';


const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000,0.5);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const points = spline.getPoints(100);
const geo = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({
  color: 0xccff,
});
const line = new THREE.Line(geo,material);



const tubeGeo = new THREE.TubeGeometry(spline,222,0.65,16,true);
const tubeMat = new THREE.MeshStandardMaterial({
  color: 0x0099ff,
  side: THREE.DoubleSide,
  wireframe: true,
});
const tube = new THREE.Mesh(tubeGeo,tubeMat);
// scene.add(tube);


const edgeGeo = new THREE.EdgesGeometry(tubeGeo,2);
const edgeMat = new THREE.LineBasicMaterial({ color: 0x0099ff });
const edge = new THREE.LineSegments(edgeGeo, edgeMat);
scene.add(edge);

const numBoxes = 100;
const size = 0.075;
const boxGeo = new THREE.BoxGeometry(size,size,size);
let boxes = [];
for (let i=0; i<numBoxes; i++){
  const p = (i/numBoxes+Math.random()*0.1)%1;
  const color = new THREE.Color(`hsl(${360*p},100%,50%)`);
  const boxMat = new THREE.MeshStandardMaterial({
    color,
    wireframe: true,
  });
  const box = new THREE.Mesh(boxGeo,boxMat);
  const pos = tubeGeo.parameters.path.getPointAt(p);
  pos.x+=Math.random() - 0.4;
  pos.y+=Math.random() - 0.4;
  box.position.copy(pos);
  const rote = new THREE.Vector3(
    Math.random()* Math.PI,
    Math.random()* Math.PI,
    Math.random()* Math.PI,
  );
  box.rotation.set(rote.x,rote.y,rote.z);
  scene.add(box);
  boxes.push(box);
}



const hemilight = new THREE.HemisphereLight(0xffffff,0x444444);
scene.add(hemilight);


camera.position.z = 5;
const canvas = document.querySelector("#canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);



const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.45;

window.addEventListener('resize',(e)=>{
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
})


function updateCamera(t){
  const time = t * 0.1;
  const looptime = 5*1000;
  const p = (time%looptime)/looptime;
  const pos = tubeGeo.parameters.path.getPointAt(p);
  const lookAt = tubeGeo.parameters.path.getPointAt((p+0.01)%1);
  camera.position.copy(pos);
  camera.lookAt(lookAt);
}


function animate(t=0) {
  window.requestAnimationFrame(animate);
  updateCamera(t);
  boxes.forEach(function(box){
    box.rotation.y += 0.1;
    box.rotation.z += 0.05;
  });
  renderer.render(scene, camera);
  controls.update();
}
animate();
