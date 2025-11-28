class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.loading = true;
    this.listeners = [];
    this.init();
  }

  init() {
    const token = localStorage.getItem('supabase.auth.token');
    const userData = localStorage.getItem('supabase.auth.user');

    if (token && userData) {
      this.session = { user: JSON.parse(userData) };
      this.user = JSON.parse(userData);
    }

    this.loading = false;
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb({ user: this.user, session: this.session, loading: this.loading }));
  }

  async signIn(email, password) {
    try {
      const { error } = await supabase.auth().signInWithPassword({ email, password });

      if (!error) {
        const token = localStorage.getItem('supabase.auth.token');
        const userData = localStorage.getItem('supabase.auth.user');
        this.session = { user: JSON.parse(userData) };
        this.user = JSON.parse(userData);
        this.notifyListeners();
      }

      return { error };
    } catch (error) {
      return { error };
    }
  }

  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth().signUp({ email, password });

      if (error) return { error };

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName
        });
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async signOut() {
    await supabase.auth().signOut();
    this.user = null;
    this.session = null;
    this.notifyListeners();
  }

  isAuthenticated() {
    return !!this.user;
  }
}

window.authManager = new AuthManager();
