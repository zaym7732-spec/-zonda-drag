import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x7e8a91);
scene.fog=new THREE.FogExp2(0x7e8a91,0.010);

const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.05,700);
camera.position.set(0,3.1,8.5);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9d8e2,0x28302d,1.8));
const sun=new THREE.DirectionalLight(0xfff2dd,4.0);
sun.position.set(-35,45,20); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=45;sun.shadow.camera.bottom=-45;
scene.add(sun);

const roadMat=new THREE.MeshStandardMaterial({color:0x25292b,roughness:.82,metalness:.02});
const road=new THREE.Mesh(new THREE.PlaneGeometry(12,900),roadMat);
road.rotation.x=-Math.PI/2; road.position.z=-430; road.receiveShadow=true; scene.add(road);

const shoulderMat=new THREE.MeshStandardMaterial({color:0x55534d,roughness:1});
for(const x of [-8,8]){
  const s=new THREE.Mesh(new THREE.PlaneGeometry(4,900),shoulderMat);
  s.rotation.x=-Math.PI/2;s.position.set(x,-.01,-430);s.receiveShadow=true;scene.add(s);
}

const lineMat=new THREE.MeshStandardMaterial({color:0xf2eee0,roughness:.6});
for(let z=0;z>-880;z-=9){
  const line=new THREE.Mesh(new THREE.BoxGeometry(.16,.018,4.4),lineMat);
  line.position.set(0,.018,z);line.receiveShadow=true;scene.add(line);
}
for(const x of [-5.65,5.65]){
  const edge=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,900),lineMat);
  edge.position.set(x,.025,-430);scene.add(edge);
}

// roadside terrain + repeated low-poly vegetation for depth
const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,900),new THREE.MeshStandardMaterial({color:0x4d5848,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.position.set(0,-.08,-430);ground.receiveShadow=true;scene.add(ground);

const trunkMat=new THREE.MeshStandardMaterial({color:0x3a3027,roughness:1});
const leafMat=new THREE.MeshStandardMaterial({color:0x344637,roughness:1});
function tree(x,z,s){
  const g=new THREE.Group();
  const t=new THREE.Mesh(new THREE.CylinderGeometry(.12*s,.18*s,1.6*s,7),trunkMat);t.position.y=.8*s;t.castShadow=true;g.add(t);
  for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.ConeGeometry((1.0-i*.18)*s,1.8*s,7),leafMat);c.position.y=(1.8+i*.62)*s;c.castShadow=true;g.add(c)}
  g.position.set(x,0,z);scene.add(g);
}
for(let z=-5;z>-850;z-=18){
  tree(-11-Math.random()*7,z-Math.random()*10,.7+Math.random()*.8);
  tree(11+Math.random()*7,z-8-Math.random()*10,.7+Math.random()*.8);
}

// car
const car=new THREE.Group(); car.position.y=.43; scene.add(car);
const bodyMat=new THREE.MeshPhysicalMaterial({color:0x17191b,metalness:.82,roughness:.2,clearcoat:1,clearcoatRoughness:.08});
const glassMat=new THREE.MeshPhysicalMaterial({color:0x111820,metalness:.1,roughness:.05,transmission:.12,transparent:true,opacity:.88});
const tireMat=new THREE.MeshStandardMaterial({color:0x070809,roughness:.9});
const rimMat=new THREE.MeshStandardMaterial({color:0x9ca3a8,metalness:.9,roughness:.22});

const body=new THREE.Mesh(new THREE.BoxGeometry(1.95,.52,4.25),bodyMat);body.position.y=.45;body.castShadow=true;car.add(body);
const hood=new THREE.Mesh(new THREE.BoxGeometry(1.78,.18,1.1),bodyMat);hood.position.set(0,.72,-1.42);hood.castShadow=true;car.add(hood);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.65,.62,1.65),glassMat);cabin.position.set(0,.91,.32);cabin.rotation.x=-.02;cabin.castShadow=true;car.add(cabin);
const roof=new THREE.Mesh(new THREE.BoxGeometry(1.7,.12,1.3),bodyMat);roof.position.set(0,1.24,.32);roof.castShadow=true;car.add(roof);

function wheel(x,z){
  const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.28,32),tireMat);
  w.rotation.z=Math.PI/2;w.position.set(x,.42,z);w.castShadow=true;car.add(w);
  const r=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.30,24),rimMat);
  r.rotation.z=Math.PI/2;r.position.set(x,.42,z);r.castShadow=true;car.add(r);
}
for(const x of [-1.02,1.02])for(const z of [-1.35,1.35])wheel(x,z);

// lights
const headMat=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:5});
for(const x of [-.62,.62]){const h=new THREE.Mesh(new THREE.BoxGeometry(.42,.12,.05),headMat);h.position.set(x,.66,-2.14);car.add(h)}
const glow=new THREE.PointLight(0xffffff,2,7);glow.position.set(0,.7,-2.1);car.add(glow);

let speed=0, throttle=false, braking=false, distance=0;
const speedEl=document.querySelector("#speed"),rpmEl=document.querySelector("#rpm"),gearEl=document.querySelector("#gear");
function input(v){throttle=v}
addEventListener("keydown",e=>{if(e.key==="ArrowUp"||e.key==="w")throttle=true;if(e.key==="ArrowDown"||e.key==="s")braking=true});
addEventListener("keyup",e=>{if(e.key==="ArrowUp"||e.key==="w")throttle=false;if(e.key==="ArrowDown"||e.key==="s")braking=false});
for(const [id,type] of [["gas","t"],["brake","b"]]){
 const el=document.querySelector("#"+id);
 el.addEventListener("pointerdown",e=>{e.preventDefault();if(type==="t")throttle=true;else braking=true});
 ["pointerup","pointercancel","pointerleave"].forEach(ev=>el.addEventListener(ev,()=>{if(type==="t")throttle=false;else braking=false}));
}
addEventListener("pointerdown",e=>{if(e.target===renderer.domElement)throttle=true});
addEventListener("pointerup",()=>throttle=false);

let last=performance.now();
function animate(now){
 requestAnimationFrame(animate);
 const dt=Math.min((now-last)/1000,.033);last=now;
 const target=throttle?78:0;
 if(throttle)speed += (target-speed)*dt*1.9;
 else speed += (0-speed)*dt*.42;
 if(braking)speed=Math.max(0,speed-dt*95);
 distance+=speed*dt/3.6;
 car.position.z=2-distance;
 car.rotation.y=Math.sin(distance*.001)*.008;
 const camTarget=new THREE.Vector3(car.position.x,car.position.y+1.0,car.position.z+5.9);
 camera.position.lerp(new THREE.Vector3(car.position.x,car.position.y+3.0,car.position.z+8.0),.055);
 camera.lookAt(camTarget);
 speedEl.textContent=Math.round(speed);
 rpmEl.textContent=Math.round(900+speed*78);
 gearEl.textContent=speed<3?"N":Math.min(6,Math.floor(speed/13)+1);
 renderer.render(scene,camera);
}
animate(performance.now());
setTimeout(()=>document.querySelector("#loading").classList.add("gone"),900);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
