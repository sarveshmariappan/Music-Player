class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.loading = true;
    this.listeners = [];
    this.init();
  }

  init() {
    window.supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.user = session?.user || null;
      this.loading = false;
      this.notifyListeners();
    });
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
      const { error } = await window.supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  }

  async signUp(email, password, fullName) {
    try {
      const { data, error } = await window.supabase.auth.signUp({ email, password });

      if (error) return { error };

      if (data.user) {
        await window.supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName
        });

        await window.supabase.auth.signInWithPassword({ email, password });
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async signOut() {
    await window.supabase.auth.signOut();
  }

  isAuthenticated() {
    return !!this.user;
  }
}

window.authManager = new AuthManager();
