export class Inventory {
  constructor() {
    this.slots = [
      'grass',
      'dirt',
      'stone',
      'sand',
      'wood',
      'glass',
      'brick',
      'plank',
      'diamond_ore'
    ];
    this.selectedIndex = 0;
  }

  getSelected() {
    return this.slots[this.selectedIndex] ?? 'grass';
  }

  select(index) {
    this.selectedIndex = Math.max(0, Math.min(index, this.slots.length - 1));
  }

  next(delta = 1) {
    this.selectedIndex = (this.selectedIndex + delta + this.slots.length) % this.slots.length;
  }
}
