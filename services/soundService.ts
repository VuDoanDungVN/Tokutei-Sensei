class SoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  private async ensureAudioContext(): Promise<boolean> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }
    
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext !== null;
  }

  async playBeep(frequency: number = 800, duration: number = 200): Promise<void> {
    if (!this.isEnabled) return;
    
    const audioContextReady = await this.ensureAudioContext();
    if (!audioContextReady) return;

    try {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext!.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration / 1000);

      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error playing beep:', error);
    }
  }

  async playSuccessSound(): Promise<void> {
    await this.playBeep(1000, 300);
  }

  async playErrorSound(): Promise<void> {
    await this.playBeep(400, 500);
  }

  async playClickSound(): Promise<void> {
    await this.playBeep(600, 100);
  }

  async playNotificationSound(): Promise<void> {
    // Play a pleasant notification sound
    await this.playBeep(800, 200);
    setTimeout(() => this.playBeep(1000, 200), 100);
  }

  async playStudyReminderSound(): Promise<void> {
    // Play a gentle reminder sound
    await this.playBeep(600, 300);
    setTimeout(() => this.playBeep(800, 300), 200);
  }
}

export const soundService = new SoundService();
