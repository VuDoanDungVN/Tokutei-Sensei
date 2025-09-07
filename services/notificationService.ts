class NotificationService {
  private permission: NotificationPermission = 'default';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Notifications are not available');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async showStudyReminder(): Promise<void> {
    await this.showNotification(
      'Mora Sensei - Nhắc nhở học tập',
      {
        body: 'Đã đến giờ luyện tập rồi! Hãy tiếp tục hành trình chinh phục kỳ thi Kaigo Fukushi.',
        tag: 'study-reminder',
        requireInteraction: false
      }
    );
  }

  async showProgressUpdate(message: string): Promise<void> {
    await this.showNotification(
      'Mora Sensei - Cập nhật tiến độ',
      {
        body: message,
        tag: 'progress-update',
        requireInteraction: false
      }
    );
  }

  async showAchievement(title: string, message: string): Promise<void> {
    await this.showNotification(
      `Mora Sensei - ${title}`,
      {
        body: message,
        tag: 'achievement',
        requireInteraction: true
      }
    );
  }

  isPermissionGranted(): boolean {
    return this.permission === 'granted';
  }

  isSupportedBrowser(): boolean {
    return this.isSupported;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = new NotificationService();
