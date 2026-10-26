export class GameUI {
  constructor(inventory) {
    this.inventory = inventory;
    this.quickbar = document.getElementById('quickbar');
    this.inventoryPanel = document.getElementById('inventory-panel');
    this.status = document.getElementById('status');
    this.renderQuickbar();
    this.renderInventory();
  }

  setStatus(message) {
    this.status.textContent = message;
  }

  renderQuickbar() {
    this.quickbar.innerHTML = '';

    this.inventory.slots.forEach((type, index) => {
      const slot = document.createElement('div');
      slot.className = `slot ${index === this.inventory.selectedIndex ? 'selected' : ''}`;
      slot.dataset.key = `${index + 1}`;
      slot.textContent = type.slice(0, 2).toUpperCase();
      this.quickbar.appendChild(slot);
    });
  }

  renderInventory() {
    this.inventoryPanel.innerHTML = '<h3 class="inventory-title">Инвентарь</h3><div class="inventory-grid"></div>';
    const grid = this.inventoryPanel.querySelector('.inventory-grid');

    const fullSlots = [...this.inventory.slots, 'torch', 'ore', 'stone', 'sand', 'glass', 'lava'];
    fullSlots.forEach((type) => {
      const cell = document.createElement('div');
      cell.className = 'inventory-cell';
      cell.textContent = type.slice(0, 2).toUpperCase();
      grid.appendChild(cell);
    });
  }

  update() {
    this.renderQuickbar();
  }

  toggleInventory(open) {
    this.inventoryPanel.classList.toggle('hidden', !open);
  }
}
