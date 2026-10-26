import * as THREE from 'three';
import { BLOCKS } from './blocks.js';
import { Inventory } from './inventory.js';
import { Player } from './player.js';
import { World } from './world.js';
import { GameUI } from './ui.js';

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x87c7ff, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xadd9ff, 20, 90);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 18, 10);

const sunLight = new THREE.DirectionalLight(0xfff4d1, 1.1);
sunLight.position.set(10, 30, 8);
scene.add(sunLight);

const ambient = new THREE.AmbientLight(0x9dc2ff, 0.8);
scene.add(ambient);

const world = new World(scene, 1463);
const inventory = new Inventory();
const ui = new GameUI(inventory);
const player = new Player(camera, world);

player.setPosition(10, 22, 10);
world.generateAround(player.camera.position);

const input = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  sprint: false,
  jump: false,
};

let inventoryOpen = false;
const clock = new THREE.Clock();

function syncDayNight() {
  const elapsed = clock.elapsedTime * 0.12;
  const sunPhase = (Math.sin(elapsed) + 1) / 2;
  const lightStrength = 0.35 + sunPhase * 1.2;
  const sky = new THREE.Color().setHSL(0.62, 0.55, 0.58 + sunPhase * 0.18);
  renderer.setClearColor(sky, 1);
  scene.fog.color.copy(sky);
  sunLight.intensity = lightStrength;
  sunLight.position.set(12 + Math.sin(elapsed) * 15, 18 + sunPhase * 22, -8);
  ambient.intensity = 0.5 + sunPhase * 0.7;
}

function attemptMine() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(world.getAllMeshes(), false);

  if (!intersects.length) return;
  const hit = intersects[0];
  const { x, y, z } = hit.object.userData;
  const distance = hit.distance;

  if (distance > 6) return;
  const blockType = world.getBlock(x, y, z);
  if (BLOCKS[blockType]?.solid) {
    world.removeBlock(x, y, z);
    ui.setStatus(`Разрушен блок: ${BLOCKS[blockType]?.label ?? blockType}`);
  }
}

function attemptPlace() {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const intersects = raycaster.intersectObjects(world.getAllMeshes(), false);

  if (!intersects.length) return;
  const hit = intersects[0];
  const { x, y, z } = hit.object.userData;
  const distance = hit.distance;

  if (distance > 6) return;

  const normal = hit.face.normal;
  const targetX = x + Math.round(normal.x);
  const targetY = y + Math.round(normal.y);
  const targetZ = z + Math.round(normal.z);

  const selectedType = inventory.getSelected();
  const current = world.getBlock(targetX, targetY, targetZ);
  if (current !== 'air') return;

  const boxMinX = Math.floor(camera.position.x - player.radius);
  const boxMaxX = Math.floor(camera.position.x + player.radius);
  const boxMinY = Math.floor(camera.position.y);
  const boxMaxY = Math.floor(camera.position.y + player.height);
  const boxMinZ = Math.floor(camera.position.z - player.radius);
  const boxMaxZ = Math.floor(camera.position.z + player.radius);

  if (
    targetX >= boxMinX && targetX <= boxMaxX &&
    targetY >= boxMinY && targetY <= boxMaxY &&
    targetZ >= boxMinZ && targetZ <= boxMaxZ
  ) {
    return;
  }

  world.setBlock(targetX, targetY, targetZ, selectedType, true);
  ui.setStatus(`Поставлен блок: ${BLOCKS[selectedType]?.label ?? selectedType}`);
}

function handleKeyState(event, isPressed) {
  switch (event.code) {
    case 'KeyW': input.forward = isPressed; break;
    case 'KeyS': input.backward = isPressed; break;
    case 'KeyA': input.left = isPressed; break;
    case 'KeyD': input.right = isPressed; break;
    case 'ShiftLeft':
    case 'ShiftRight': input.sprint = isPressed; break;
    case 'Space': input.jump = isPressed; break;
    default:
      break;
  }

  if (!isPressed) {
    if (event.code === 'KeyE') {
      inventoryOpen = !inventoryOpen;
      ui.toggleInventory(inventoryOpen);
      ui.setStatus(inventoryOpen ? 'Инвентарь открыт' : 'Инвентарь закрыт');
    }

    if (event.code === 'KeyF5') {
      world.save();
      ui.setStatus('Мир сохранён');
    }

    if (event.code === 'KeyL') {
      if (world.load()) {
        ui.setStatus('Мир загружен');
      } else {
        ui.setStatus('Сохранённый мир не найден');
      }
    }

    if (event.code.startsWith('Digit')) {
      const digit = Number(event.code.replace('Digit', ''));
      if (Number.isInteger(digit) && digit >= 1 && digit <= 9) {
        inventory.select(digit - 1);
        ui.update();
      }
    }
  }
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyE' || event.code === 'KeyF5' || event.code === 'KeyL') {
    event.preventDefault();
  }
  handleKeyState(event, true);
});

window.addEventListener('keyup', (event) => {
  handleKeyState(event, false);
});

window.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

window.addEventListener('mousedown', (event) => {
  if (document.pointerLockElement !== canvas) {
    canvas.requestPointerLock();
    return;
  }

  if (event.button === 0) {
    attemptMine();
  }

  if (event.button === 2) {
    attemptPlace();
  }
});

document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === canvas) {
    player.yaw -= event.movementX * 0.0025;
    player.pitch -= event.movementY * 0.0018;
    player.pitch = THREE.MathUtils.clamp(player.pitch, -1.45, 1.45);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.033);

  syncDayNight();
  player.update(dt, input);
  world.generateAround(player.camera.position);
  ui.update();

  renderer.render(scene, camera);
}

ui.setStatus('Нажмите в игровое поле, чтобы войти в игру');
requestAnimationFrame(tick);
