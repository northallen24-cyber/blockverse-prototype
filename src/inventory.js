import * as THREE from 'three';

export const BLOCKS = {
  air: { id: 'air', label: 'Воздух', solid: false, transparent: true, opacity: 0, color: 0x000000 },
  grass: { id: 'grass', label: 'Трава', solid: true, color: 0x6ecb5a },
  dirt: { id: 'dirt', label: 'Земля', solid: true, color: 0x7d5b35 },
  stone: { id: 'stone', label: 'Камень', solid: true, color: 0x7a7a7a },
  sand: { id: 'sand', label: 'Песок', solid: true, color: 0xd8c77d },
  wood: { id: 'wood', label: 'Дерево', solid: true, color: 0x8d5927 },
  leaves: { id: 'leaves', label: 'Листва', solid: true, color: 0x3ea46b },
  plank: { id: 'plank', label: 'Доски', solid: true, color: 0xb4804e },
  glass: { id: 'glass', label: 'Стекло', solid: true, transparent: true, opacity: 0.5, color: 0x9fd6ff },
  brick: { id: 'brick', label: 'Кирпич', solid: true, color: 0xbc5a42 },
  cobblestone: { id: 'cobblestone', label: 'Булыжник', solid: true, color: 0x7a7d83 },
  coal_ore: { id: 'coal_ore', label: 'Уголь', solid: true, color: 0x2f2f2f },
  iron_ore: { id: 'iron_ore', label: 'Железо', solid: true, color: 0xb5b2ad },
  copper_ore: { id: 'copper_ore', label: 'Медь', solid: true, color: 0xc58c5c },
  gold_ore: { id: 'gold_ore', label: 'Золото', solid: true, color: 0xc7ae2d },
  diamond_ore: { id: 'diamond_ore', label: 'Алмаз', solid: true, color: 0x77d7f1 },
  water: { id: 'water', label: 'Вода', solid: false, transparent: true, opacity: 0.65, color: 0x3a8ed8 },
  lava: { id: 'lava', label: 'Лава', solid: false, transparent: true, opacity: 0.8, color: 0xff6a1a },
  ice: { id: 'ice', label: 'Лёд', solid: true, transparent: true, opacity: 0.8, color: 0xa9d9ff },
  snow: { id: 'snow', label: 'Снег', solid: true, color: 0xf6f8ff },
  torch: { id: 'torch', label: 'Факел', solid: false, transparent: true, opacity: 0.95, color: 0xffd96f },
  sandstone: { id: 'sandstone', label: 'Песчаник', solid: true, color: 0xdcc77f },
  mossy_stone: { id: 'mossy_stone', label: 'Моховой камень', solid: true, color: 0x5d8461 },
  clay: { id: 'clay', label: 'Глина', solid: true, color: 0xb6b0a4 },
  obsidian: { id: 'obsidian', label: 'Обсидиан', solid: true, color: 0x1e1a38 },
  emerald_ore: { id: 'emerald_ore', label: 'Изумруд', solid: true, color: 0x2ec777 },
  ruby_ore: { id: 'ruby_ore', label: 'Рубин', solid: true, color: 0xd63c48 },
  iron_block: { id: 'iron_block', label: 'Железный блок', solid: true, color: 0xb5b7be },
  gold_block: { id: 'gold_block', label: 'Золотой блок', solid: true, color: 0xd8b736 },
  diamond_block: { id: 'diamond_block', label: 'Алмазный блок', solid: true, color: 0x8ccdfa },
  redstone_ore: { id: 'redstone_ore', label: 'Редстоун', solid: true, color: 0xb8162d },
  marble: { id: 'marble', label: 'Мрамор', solid: true, color: 0xe8e4e1 },
  moss: { id: 'moss', label: 'Мох', solid: true, color: 0x4d8f52 },
  lamp: { id: 'lamp', label: 'Лампа', solid: true, transparent: true, opacity: 0.82, color: 0xfff0a8 }
};

export const BLOCK_LIST = Object.values(BLOCKS).filter((block) => block.id !== 'air');
export const BLOCK_BY_ID = Object.fromEntries(BLOCK_LIST.map((block) => [block.id, block]));

export function createBlockMesh(type, x, y, z) {
  const block = BLOCKS[type] ?? BLOCKS.grass;
  const material = new THREE.MeshLambertMaterial({
    color: block.color,
    transparent: Boolean(block.transparent),
    opacity: block.opacity ?? 1,
    depthWrite: !block.transparent,
  });

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  mesh.position.set(x + 0.5, y + 0.5, z + 0.5);
  mesh.userData = { x, y, z, type };
  return mesh;
}
