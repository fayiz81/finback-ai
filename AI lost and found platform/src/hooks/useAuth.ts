import { useState, useEffect, useCallback } from 'react';
import { User, USER_ROLES, ROUTE_PATHS } from '@/lib/index';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

const TOKEN_KEY = 'finback_auth_token';
const USER_KEY = 'finback_user';

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@finback.ai',
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date('2026-01-01'),
  },
  {
    id: '2',
    email: 'user@college.edu',
    name: 'John Student',
    role: USER_ROLES.USER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: new Date('2026-02-15'),
  },
];

const generateToken = (userId: string): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      userId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  );
  const signature = btoa(`${header}.${payload}.secret`);
  return `${header}.${payload}.${signature}`;
};

const validateToken = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
};

const getUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser && validateToken(storedToken)) {
        const user = JSON.parse(storedUser);
        user.createdAt = new Date(user.createdAt);
        setAuthState({
          user,
          token: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const user = mockUsers.find((u) => u.email === credentials.email);

        if (!user) {
          return { success: false, error: 'Invalid email or password' };
        }

        const token = generateToken(user.id);

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: 'Login failed. Please try again.' };
      }
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const existingUser = mockUsers.find((u) => u.email === data.email);
        if (existingUser) {
          return { success: false, error: 'Email already registered' };
        }

        const newUser: User = {
          id: `user_${Date.now()}`,
          email: data.email,
          name: data.name,
          role: USER_ROLES.USER,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
          createdAt: new Date(),
        };

        mockUsers.push(newUser);

        const token = generateToken(newUser.id);

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));

        setAuthState({
          user: newUser,
          token,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });

    window.location.href = ROUTE_PATHS.HOME;
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState((prev) => {
      if (!prev.user) return prev;

      const updatedUser = { ...prev.user, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return {
        ...prev,
        user: updatedUser,
      };
    });
  }, []);

  const hasRole = useCallback(
    (role: typeof USER_ROLES[keyof typeof USER_ROLES]): boolean => {
      return authState.user?.role === role;
    },
    [authState.user]
  );

  const isAdmin = useCallback((): boolean => {
    return authState.user?.role === USER_ROLES.ADMIN;
  }, [authState.user]);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
    updateUser,
    hasRole,
    isAdmin,
  };
};
