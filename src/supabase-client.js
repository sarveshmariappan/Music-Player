const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseClient {
  constructor(url, anonKey) {
    this.url = url;
    this.anonKey = anonKey;
  }

  async fetch(method, path, body = null, headers = {}) {
    const url = `${this.url}/rest/v1${path}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'apikey': this.anonKey,
      'Authorization': `Bearer ${this.anonKey}`,
      ...headers
    };

    const options = {
      method,
      headers: defaultHeaders
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.statusText}`);
    }

    return response.json();
  }

  auth() {
    return {
      getSession: async () => {
        const token = localStorage.getItem('supabase.auth.token');
        if (!token) return { data: { session: null } };

        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          return { data: { session: { user: { id: decoded.sub, email: decoded.email } } } };
        } catch {
          return { data: { session: null } };
        }
      },

      signInWithPassword: async (credentials) => {
        try {
          const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.anonKey
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const data = await response.json();

          if (!response.ok) {
            return { error: new Error(data.error_description || 'Login failed') };
          }

          localStorage.setItem('supabase.auth.token', data.access_token);
          localStorage.setItem('supabase.auth.user', JSON.stringify({
            id: data.user.id,
            email: data.user.email
          }));

          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      signUp: async (credentials) => {
        try {
          const response = await fetch(`${this.url}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': this.anonKey
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const data = await response.json();

          if (!response.ok) {
            return {
              data: null,
              error: new Error(data.error_description || 'Sign up failed')
            };
          }

          return {
            data: { user: { id: data.user.id, email: data.user.email } },
            error: null
          };
        } catch (error) {
          return { data: null, error };
        }
      },

      signOut: async () => {
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.user');
        window.dispatchEvent(new Event('auth-state-changed'));
      },

      onAuthStateChange: (callback) => {
        const handleAuthChange = () => {
          const token = localStorage.getItem('supabase.auth.token');
          const session = token ? { user: JSON.parse(localStorage.getItem('supabase.auth.user') || '{}') } : null;
          callback('INITIAL_SESSION', session);
        };

        window.addEventListener('auth-state-changed', handleAuthChange);
        handleAuthChange();

        return {
          unsubscribe: () => {
            window.removeEventListener('auth-state-changed', handleAuthChange);
          }
        };
      }
    };
  }

  from(table) {
    return {
      select: (columns = '*') => {
        return {
          eq: (column, value) => {
            return {
              maybeSingle: async () => {
                try {
                  const token = localStorage.getItem('supabase.auth.token');
                  const response = await this.fetch(
                    'GET',
                    `/${table}?${column}=eq.${value}&select=${columns}`,
                    null,
                    { 'Authorization': `Bearer ${token}` }
                  );
                  return { data: response.length > 0 ? response[0] : null, error: null };
                } catch (error) {
                  return { data: null, error };
                }
              }
            };
          }
        };
      },

      insert: (data) => {
        return {
          then: async (resolve) => {
            try {
              const token = localStorage.getItem('supabase.auth.token');
              const response = await this.fetch(
                'POST',
                `/${table}`,
                data,
                { 'Authorization': `Bearer ${token}` }
              );
              resolve({ data: response, error: null });
            } catch (error) {
              resolve({ data: null, error });
            }
          }
        };
      },

      update: (data) => {
        return {
          eq: (column, value) => {
            return {
              then: async (resolve) => {
                try {
                  const token = localStorage.getItem('supabase.auth.token');
                  const response = await this.fetch(
                    'PATCH',
                    `/${table}?${column}=eq.${value}`,
                    data,
                    { 'Authorization': `Bearer ${token}` }
                  );
                  resolve({ data: response, error: null });
                } catch (error) {
                  resolve({ data: null, error });
                }
              }
            };
          }
        };
      }
    };
  }
}

window.supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);
