class App {
  constructor() {
    this.currentPage = 'login';
    this.init();
  }

  init() {
    window.musicPlayer.init();
    this.setupAuthListener();
    this.setupEventListeners();
    this.render();
  }

  setupAuthListener() {
    authManager.subscribe((state) => {
      if (state.user && !state.loading) {
        profileManager.loadProfile(state.user);
        this.switchPage('player');
      } else if (!state.user && !state.loading) {
        this.switchPage('login');
      }
      this.render();
    });
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-nav-link]')) {
        const page = e.target.dataset.navLink;
        this.switchPage(page);
      }

      if (e.target.matches('[data-logout]')) {
        authManager.signOut();
      }

      if (e.target.matches('[data-play-pause]')) {
        window.musicPlayer.togglePlayPause();
      }

      if (e.target.matches('[data-next]')) {
        window.musicPlayer.handleNext();
      }

      if (e.target.matches('[data-previous]')) {
        window.musicPlayer.handlePrevious();
      }

      if (e.target.matches('[data-mute]')) {
        window.musicPlayer.toggleMute();
      }

      if (e.target.matches('[data-playlist-item]')) {
        const index = parseInt(e.target.dataset.playlistItem);
        window.musicPlayer.playSong(index);
      }

      if (e.target.matches('[data-save-profile]')) {
        this.saveProfile();
      }

      if (e.target.matches('[data-login-toggle]')) {
        this.toggleLoginSignup();
      }

      if (e.target.matches('[data-login-submit]')) {
        this.handleLoginSubmit();
      }

      if (e.target.matches('[data-seek]')) {
        const time = parseFloat(e.target.value);
        window.musicPlayer.seek(time);
      }

      if (e.target.matches('[data-volume]')) {
        const volume = parseFloat(e.target.value);
        window.musicPlayer.setVolume(volume);
      }

      if (e.target.matches('[data-brand]')) {
        this.switchPage('player');
      }
    });
  }

  switchPage(page) {
    this.currentPage = page;
    this.render();
  }

  toggleLoginSignup() {
    const isLogin = document.getElementById('login-form').classList.contains('login-mode');
    const form = document.getElementById('login-form');
    const fullNameField = form.querySelector('[data-full-name-field]');

    if (isLogin) {
      form.classList.remove('login-mode');
      form.classList.add('signup-mode');
      fullNameField.style.display = 'block';
    } else {
      form.classList.add('login-mode');
      form.classList.remove('signup-mode');
      fullNameField.style.display = 'none';
    }

    const message = document.getElementById('login-message');
    if (message) message.remove();
  }

  async handleLoginSubmit() {
    const form = document.getElementById('login-form');
    const isLogin = form.classList.contains('login-mode');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const fullName = document.getElementById('login-fullname').value;

    const button = document.querySelector('[data-login-submit]');
    button.disabled = true;

    if (isLogin) {
      const { error } = await authManager.signIn(email, password);
      if (error) {
        this.showLoginMessage('error', error.message || 'Login failed. Please check your credentials.');
      } else {
        this.showLoginMessage('success', 'Login successful! Loading your music player...');
      }
    } else {
      if (!fullName.trim()) {
        this.showLoginMessage('error', 'Please enter your full name.');
        button.disabled = false;
        return;
      }
      const { error } = await authManager.signUp(email, password, fullName);
      if (error) {
        this.showLoginMessage('error', error.message || 'Sign up failed. Please try again.');
      } else {
        this.showLoginMessage('success', 'Account created successfully! Logging you in...');
      }
    }

    button.disabled = false;
  }

  showLoginMessage(type, text) {
    const existingMessage = document.getElementById('login-message');
    if (existingMessage) existingMessage.remove();

    const message = document.createElement('div');
    message.id = 'login-message';
    message.className = `message ${type}`;
    message.textContent = text;

    const form = document.getElementById('login-form');
    form.insertBefore(message, form.firstChild);
  }

  async saveProfile() {
    const fullName = document.getElementById('profile-fullname').value;
    const button = document.querySelector('[data-save-profile]');
    button.disabled = true;

    const { error } = await profileManager.updateProfile(fullName);

    if (error) {
      this.showProfileMessage('error', 'Failed to update profile. Please try again.');
    } else {
      this.showProfileMessage('success', 'Profile updated successfully!');
    }

    button.disabled = false;
  }

  showProfileMessage(type, text) {
    const existingMessage = document.getElementById('profile-message');
    if (existingMessage) existingMessage.remove();

    const message = document.createElement('div');
    message.id = 'profile-message';
    message.className = `message ${type}`;
    message.textContent = text;

    const profileCard = document.querySelector('.profile-card');
    profileCard.insertBefore(message, profileCard.querySelector('.profile-title').nextElementSibling);
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    if (authManager.loading) {
      app.innerHTML = `
        <div class="loading">
          <div style="text-align: center;">
            <div class="spinner" style="margin: 0 auto 1rem; width: 2rem; height: 2rem;"></div>
            <p>Loading...</p>
          </div>
        </div>
      `;
      return;
    }

    if (!authManager.isAuthenticated()) {
      app.innerHTML = this.renderLoginPage();
    } else if (this.currentPage === 'profile') {
      app.innerHTML = this.renderNavbar() + this.renderProfilePage();
    } else {
      app.innerHTML = this.renderNavbar() + this.renderPlayerPage();
    }
  }

  renderNavbar() {
    return `
      <nav class="navbar">
        <div class="navbar-brand" data-brand>
          <div class="navbar-brand-icon">
            <svg fill="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px; color: white;">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
            </svg>
          </div>
          <span class="navbar-brand-text">Music Player</span>
        </div>
        <ul class="navbar-nav">
          <li><button class="nav-link ${this.currentPage === 'player' ? 'active' : ''}" data-nav-link="player">Player</button></li>
          <li><button class="nav-link ${this.currentPage === 'profile' ? 'active' : ''}" data-nav-link="profile">Profile</button></li>
          <li><button class="nav-link nav-link-logout" data-logout>Logout</button></li>
        </ul>
      </nav>
    `;
  }

  renderLoginPage() {
    return `
      <div class="login-page">
        <div class="login-container">
          <div class="login-card">
            <div class="login-header">
              <div class="login-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                </svg>
              </div>
              <h1 class="login-title">Tamil Music Player</h1>
              <p class="login-subtitle" id="login-subtitle">Welcome back! Sign in to continue</p>
            </div>

            <form id="login-form" class="login-mode">
              <div class="form-group" data-full-name-field style="display: none;">
                <label class="form-label" for="login-fullname">Full Name</label>
                <input id="login-fullname" type="text" class="form-input" placeholder="Enter your full name" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="login-email">Email Address</label>
                <input id="login-email" type="email" class="form-input" placeholder="you@example.com" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="login-password">Password</label>
                <input id="login-password" type="password" class="form-input" placeholder="Enter your password" required minlength="6">
              </div>

              <button type="button" class="form-button" data-login-submit>Sign In</button>
            </form>

            <div class="login-toggle">
              <button type="button" class="login-toggle-button" data-login-toggle id="login-toggle">Don't have an account? Sign up</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderPlayerPage() {
    const player = window.musicPlayer;
    const song = player.currentSong;

    let playlistHTML = window.tamilSongs.map((s, index) => `
      <button class="playlist-item ${index === player.currentSongIndex ? 'active' : ''}" data-playlist-item="${index}">
        <div class="playlist-thumbnail">
          <img src="${s.coverImage}" alt="${s.title}">
        </div>
        <div class="playlist-details">
          <div class="playlist-song-title">${s.title}</div>
          <div class="playlist-song-artist">${s.artist}</div>
        </div>
      </button>
    `).join('');

    return `
      <div class="player-page">
        <div class="player-content">
          <div class="player-grid">
            <div class="player-main">
              <div class="player-cover">
                <img src="${song.coverImage}" alt="${song.title}">
              </div>

              <div class="player-info">
                <h2 class="player-title">${song.title}</h2>
                <p class="player-artist">${song.artist}</p>
                <p class="player-album">${song.album}</p>
              </div>

              <div class="player-controls">
                <div class="progress-bar">
                  <span class="time-display">${player.formatTime(player.currentTime)}</span>
                  <input type="range" min="0" max="${player.duration || 0}" value="${player.currentTime}" class="progress-input" data-seek>
                  <span class="time-display">${player.formatTime(player.duration)}</span>
                </div>

                <div class="player-buttons">
                  <button class="player-btn" data-previous>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>

                  <button class="player-btn play" data-play-pause>
                    ${player.isPlaying
                      ? '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>'
                      : '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'}
                  </button>

                  <button class="player-btn" data-next>
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M16 18h2V6h-2zm-11-7l8.5-6v12z"/></svg>
                  </button>
                </div>

                <div class="volume-control">
                  <button class="volume-icon" data-mute>
                    ${player.isMuted
                      ? '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C23.16 14.87 24 13.07 24 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zm2.16 0c0 .93-.2 1.82-.54 2.64l1.51 1.51C23.16 14.87 24 13.07 24 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM3 9v6h4l5 5V4L7 9H3z"/></svg>'
                      : '<svg fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 1c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'}
                  </button>
                  <input type="range" min="0" max="1" step="0.01" value="${player.volume}" class="volume-slider" data-volume>
                </div>
              </div>
            </div>

            <div class="playlist-panel">
              <h3 class="playlist-title">Playlist</h3>
              <div class="playlist">
                ${playlistHTML}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderProfilePage() {
    const profile = profileManager.profile;
    const loading = profileManager.loading;

    if (loading) {
      return `
        <div class="profile-page">
          <div class="loading">
            <div class="spinner" style="margin: 0 auto 1rem; width: 2rem; height: 2rem;"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      `;
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
      <div class="profile-page">
        <div class="profile-container">
          <div class="profile-card">
            <div class="profile-header">
              <div class="profile-icon">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>

            <h1 class="profile-title">My Profile</h1>

            <div class="profile-fields">
              <div class="profile-field">
                <label class="profile-field-label">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>Full Name</span>
                </label>
                <input id="profile-fullname" type="text" class="profile-field-input" value="${profile?.full_name || ''}" placeholder="Enter your full name">
              </div>

              <div class="profile-field">
                <label class="profile-field-label">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span>Email Address</span>
                </label>
                <input type="email" class="profile-field-input" value="${profile?.email || ''}" disabled>
                <p class="profile-help-text">Email cannot be changed</p>
              </div>

              <div class="profile-field">
                <label class="profile-field-label">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.3-1.54c-.2-.24-.58-.24-.77 0-.21.24-.21.62 0 .85l1.9 2.23c.21.24.58.24.77 0l3.35-4.04c.21-.24.21-.62 0-.85-.19-.24-.57-.24-.77 0z"/>
                  </svg>
                  <span>Member Since</span>
                </label>
                <input type="text" class="profile-field-input" value="${profile?.created_at ? formatDate(profile.created_at) : ''}" disabled>
              </div>

              <button class="profile-save-button" data-save-profile>
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
