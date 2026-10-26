import * as THREE from 'three';
import { BLOCKS, createBlockMesh } from './blocks.js';

export class World {
  constructor(scene, seed = 101) {
    this.scene = scene;
    this.seed = seed;
    this.blocks = new Map();
    this.chunkRadius = 2;
    this.waterLevel = 6;
  }

  key(x, y, z) {
    return `${x},${y},${z}`;
  }

  hash(x, z) {
    const value = Math.sin(x * 127.1 + z * 311.7 + this.seed * 74.7) * 43758.5453123;
    return value - Math.floor(value);
  }

  terrainHeight(x, z) {
    const waveA = Math.sin((x + this.seed) * 0.27) * 3.5;
    const waveB = Math.cos((z - this.seed) * 0.23) * 2.8;
    const waveC = Math.sin((x * 0.12 + z * 0.18) + this.seed) * 5.2;
    const islandBias = Math.sin((x * 0.09) + (z * 0.07)) * 3;
    const noise = waveA + waveB + waveC + islandBias;
    return Math.max(4, Math.floor(10 + noise));
  }

  generateChunk(chunkX, chunkZ) {
    for (let x = chunkX * 16; x < chunkX * 16 + 16; x += 1) {
      for (let z = chunkZ * 16; z < chunkZ * 16 + 16; z += 1) {
        const height = this.terrainHeight(x, z);

        for (let y = 0; y <= height; y += 1) {
          let type = 'stone';
          if (y === height) {
            type = this.hash(x, z) > 0.7 ? 'sand' : 'grass';
          } else if (y > height - 3) {
            type = this.hash(x, z + 2) > 0.72 ? 'sand' : 'dirt';
          }

          this.setBlock(x, y, z, type, false);
        }

        for (let y = height + 1; y <= this.waterLevel; y += 1) {
          this.setBlock(x, y, z, 'water', false);
        }

        if (height > this.waterLevel + 2 && this.hash(x * 0.8, z * 0.8) > 0.91) {
          this.placeTree(x, height + 1, z);
        }

        if (height <= 3 && this.hash(x + 37, z + 120) > 0.93) {
          this.setBlock(x, height + 1, z, 'sandstone', false);
        }
      }
    }
  }

  placeTree(x, y, z) {
    for (let iy = 0; iy < 4; iy += 1) {
      this.setBlock(x, y + iy, z, 'wood', false);
    }

    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dy = -1; dy <= 2; dy += 1) {
        for (let dz = -2; dz <= 2; dz += 1) {
          const dist = Math.abs(dx) + Math.abs(dz) + Math.abs(dy);
          if (dist <= 4 && this.hash(x + dx, z + dz + dy) > 0.3) {
            this.setBlock(x + dx, y + 3 + dy, z + dz, 'leaves', false);
          }
        }
      }
    }
  }

  generateAround(playerPos) {
    const chunkX = Math.floor(playerPos.x / 16);
    const chunkZ = Math.floor(playerPos.z / 16);

    for (let dx = -this.chunkRadius; dx <= this.chunkRadius; dx += 1) {
      for (let dz = -this.chunkRadius; dz <= this.chunkRadius; dz += 1) {
        const cx = chunkX + dx;
        const cz = chunkZ + dz;
        const key = `${cx},${cz}`;
        if (!this.generatedChunks) {
          this.generatedChunks = new Set();
        }
        if (!this.generatedChunks.has(key)) {
          this.generateChunk(cx, cz);
          this.generatedChunks.add(key);
        }
      }
    }
  }

  setBlock(x, y, z, type, addMesh = true) {
    const blockKey = this.key(x, y, z);
    if (type === 'air' || type == null) {
      const existing = this.blocks.get(blockKey);
      if (existing) {
        this.scene.remove(existing.mesh);
        this.blocks.delete(blockKey);
      }
      return;
    }

    const previous = this.blocks.get(blockKey);
    if (previous) {
      this.scene.remove(previous.mesh);
      this.blocks.delete(blockKey);
    }

    if (!addMesh) {
      this.blocks.set(blockKey, { type, mesh: null });
      return;
    }

    const mesh = createBlockMesh(type, x, y, z);
    this.scene.add(mesh);
    this.blocks.set(blockKey, { type, mesh });
  }

  removeBlock(x, y, z) {
    this.setBlock(x, y, z, 'air', true);
  }

  getBlock(x, y, z) {
    return this.blocks.get(this.key(x, y, z))?.type ?? 'air';
  }

  getAllMeshes() {
    return Array.from(this.blocks.values())
      .map((entry) => entry.mesh)
      .filter(Boolean);
  }

  save() {
    const payload = Array.from(this.blocks.entries())
      .filter(([, entry]) => entry.type !== 'air' && entry.mesh)
      .map(([key, entry]) => {
        const [x, y, z] = key.split(',').map(Number);
        return { x, y, z, type: entry.type };
      });

    localStorage.setItem('blockverse-world', JSON.stringify({ seed: this.seed, blocks: payload }));
  }

  load() {
    const raw = localStorage.getItem('blockverse-world');
    if (!raw) return false;

    try {
      const data = JSON.parse(raw);
      if (!data.blocks) return false;

      for (const block of data.blocks) {
        if (block.type) {
          this.setBlock(block.x, block.y, block.z, block.type, true);
        }
      }
      return true;
    } catch (error) {
      console.error('Load failed', error);
      return false;
    }
  }
}
