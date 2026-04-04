export interface PlayoutState {
  currentVideo: string | null;
  nextVideo: string | null;
  switchAt: Date | null;
}

export class PlayoutEngine {
  private state: PlayoutState = {
    currentVideo: null,
    nextVideo: null,
    switchAt: null,
  };

  getCurrentState(): PlayoutState {
    return { ...this.state };
  }

  scheduleSwitch(videoId: string, switchTime: Date) {
    this.state.nextVideo = videoId;
    this.state.switchAt = switchTime;
  }

  executeSwitch() {
    if (this.state.nextVideo) {
      this.state.currentVideo = this.state.nextVideo;
      this.state.nextVideo = null;
      this.state.switchAt = null;
    }
  }
}
