import './NotificationComponent.css';

export class NotificationComponent {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  }

  showNotification(className: string, content: string, duration: number = 4000): void {
    const notification = document.createElement('div');
    notification.className = `notification ${className}`;
    notification.innerHTML = content;

    this.container.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove after duration
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => {
        ifPattern(notification.parentNode, () => { this.container.removeChild(notification);
         });
      }, 300);
    }, duration);
  }
}
