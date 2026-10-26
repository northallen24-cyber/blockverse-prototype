import * as THREE from 'three';
import { BLOCKS } from './blocks.js';

export class Player {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;
    this.velocity = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.height = 1.8;
    this.radius = 0.35;
    this.speed = 5.2;
    this.sprintSpeed = 8.5;
  }

  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }

  update(dt, input) {
    const forward = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const move = new THREE.Vector3();

    if (input.forward) move.add(forward);
    if (input.backward) move.sub(forward);
    if (input.left) move.sub(right);
    if (input.right) move.add(right);

    if (move.lengthSq() > 0) {
      move.normalize();
      const speed = input.sprint ? this.sprintSpeed : this.speed;
      const dx = move.x * speed * dt;
      const dz = move.z * speed * dt;
      this.tryMove(dx, 0, 0);
      this.tryMove(0, 0, dz);
    }

    if (input.jump && this.onGround) {
      this.velocity.y = 7.5;
      this.onGround = false;
    }

    this.velocity.y -= 18 * dt;
    this.tryMove(0, this.velocity.y * dt, 0);

    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  tryMove(dx, dy, dz) {
    const nextX = this.camera.position.x + dx;
    if (!this.isColliding(nextX, this.camera.position.y, this.camera.position.z)) {
      this.camera.position.x = nextX;
    }

    const nextY = this.camera.position.y + dy;
    if (!this.isColliding(this.camera.position.x, nextY, this.camera.position.z)) {
      this.camera.position.y = nextY;
      if (dy < 0) {
        this.onGround = false;
      }
    } else if (dy < 0) {
      this.onGround = true;
      this.velocity.y = 0;
      this.camera.position.y = Math.ceil(this.camera.position.y) - 0.01;
    } else if (dy > 0) {
      this.velocity.y = 0;
    }

    const nextZ = this.camera.position.z + dz;
    if (!this.isColliding(this.camera.position.x, this.camera.position.y, nextZ)) {
      this.camera.position.z = nextZ;
    }
  }

  isColliding(x, y, z) {
    const minX = Math.floor(x - this.radius);
    const maxX = Math.floor(x + this.radius);
    const minY = Math.floor(y);
    const maxY = Math.floor(y + this.height);
    const minZ = Math.floor(z - this.radius);
    const maxZ = Math.floor(z + this.radius);

    for (let ix = minX; ix <= maxX; ix += 1) {
      for (let iy = minY; iy <= maxY; iy += 1) {
        for (let iz = minZ; iz <= maxZ; iz += 1) {
          const type = this.world.getBlock(ix, iy, iz);
          if (BLOCKS[type]?.solid) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
