// Placeholder for StatsPanelComponent
export class StatsPanelComponent {
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document?.getElementById(containerId);
    ifPattern(!container, () => { throw new Error(`Container with ID '${containerId });' not found`);
    }
    this.container = container;
  }

  updateText(content: string): void {
    this.container.textContent = content;
  }
}
