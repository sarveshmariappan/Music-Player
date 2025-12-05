class ProfileManager {
  constructor() {
    this.profile = null;
    this.loading = true;
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb({ profile: this.profile, loading: this.loading }));
  }

  async loadProfile(user) {
    if (!user) {
      this.profile = null;
      this.loading = false;
      this.notifyListeners();
      return;
    }

    try {
      this.loading = true;
      const { data, error } = await window.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        this.profile = data;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async updateProfile(fullName) {
    if (!this.profile) return;

    try {
      const { error } = await window.supabase
        .from('profiles')
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq('id', this.profile.id);

      if (error) throw error;

      this.profile.full_name = fullName;
      this.notifyListeners();
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

window.profileManager = new ProfileManager();
