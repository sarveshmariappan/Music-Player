class MusicPlayer {
  constructor() {
    this.currentSongIndex = 0;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 0.7;
    this.isMuted = false;
    this.audio = null;
    this.listeners = [];
  }

  init() {
    this.audio = new Audio();
    this.audio.addEventListener('timeupdate', () => this.updateTime());
    this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.audio.addEventListener('ended', () => this.handleNext());
    this.audio.volume = this.volume;
    this.loadSong(0);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb({
      currentSongIndex: this.currentSongIndex,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      currentSong: window.tamilSongs[this.currentSongIndex]
    }));
  }

  loadSong(index) {
    this.currentSongIndex = index;
    const song = window.tamilSongs[index];
    this.audio.src = song.audioUrl;
    this.currentTime = 0;
    this.notifyListeners();
  }

  updateTime() {
    this.currentTime = this.audio.currentTime;
    this.notifyListeners();
  }

  updateDuration() {
    this.duration = this.audio.duration;
    this.notifyListeners();
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
    this.notifyListeners();
  }

  handleNext() {
    this.currentSongIndex = (this.currentSongIndex + 1) % window.tamilSongs.length;
    this.loadSong(this.currentSongIndex);
    this.isPlaying = true;
    setTimeout(() => this.audio.play(), 100);
    this.notifyListeners();
  }

  handlePrevious() {
    this.currentSongIndex = (this.currentSongIndex - 1 + window.tamilSongs.length) % window.tamilSongs.length;
    this.loadSong(this.currentSongIndex);
    this.isPlaying = true;
    setTimeout(() => this.audio.play(), 100);
    this.notifyListeners();
  }

  seek(time) {
    this.currentTime = time;
    this.audio.currentTime = time;
    this.notifyListeners();
  }

  setVolume(vol) {
    this.volume = vol;
    this.audio.volume = vol;
    this.isMuted = vol === 0;
    this.notifyListeners();
  }

  toggleMute() {
    if (this.isMuted) {
      this.setVolume(0.7);
    } else {
      this.setVolume(0);
    }
  }

  playSong(index) {
    this.loadSong(index);
    this.isPlaying = true;
    setTimeout(() => this.audio.play(), 100);
    this.notifyListeners();
  }

  formatTime(time) {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

window.musicPlayer = new MusicPlayer();
