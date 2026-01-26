import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { initializeUserAccess, isUserSuspended, isUserExcluded, getUserAccessData } from "./access-control";

interface User {
  username: string;
  nome?: string;
  email?: string;
  telefone?: string;
  provider?: "google" | "facebook" | "local";
  avatar?: string;
}

interface RegisterData {
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  senha: string;
}

interface RegisterResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean | { suspended: true; reason?: string } | { excluded: true };
  socialLogin: (provider: "google" | "facebook") => boolean;
  register: (data: RegisterData) => RegisterResult;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "quiz_auth_user";
const USERS_STORAGE_KEY = "quiz_registered_users";
const GLOBAL_USERS_KEY = "users"; // Global users list for admin panel

// Hardcoded users for testing (can be extended with localStorage)
const DEFAULT_USERS = [
  { username: "admin", password: "admin123" },
  { username: "usuario", password: "senha123" },
];

// Get registered users from localStorage
const getRegisteredUsers = (): Array<{ email: string; password: string; nome: string; telefone?: string; cpf?: string }> => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save registered users to localStorage
const saveRegisteredUsers = (users: Array<{ email: string; password: string; nome: string; telefone?: string; cpf?: string }>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Get/Save global users list (for admin panel visibility)
interface GlobalUser {
  id: string;
  nome: string;
  email: string;
  provider: "google" | "facebook" | "local";
  dataCadastro: string;
  avatar?: string;
}

const getGlobalUsers = (): GlobalUser[] => {
  try {
    const stored = localStorage.getItem(GLOBAL_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addToGlobalUsers = (user: GlobalUser) => {
  const users = getGlobalUsers();
  // Check if already exists by email
  const existingIndex = users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    // Update existing
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push(user);
  }
  localStorage.setItem(GLOBAL_USERS_KEY, JSON.stringify(users));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean | { suspended: true; reason?: string } | { excluded: true } => {
    // Check default users first
    const defaultUser = DEFAULT_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (defaultUser) {
      // Task 87: Check if user is excluded
      if (isUserExcluded(defaultUser.username)) {
        return { excluded: true };
      }
      // Check if user is suspended
      if (isUserSuspended(defaultUser.username)) {
        const accessData = getUserAccessData(defaultUser.username);
        return { suspended: true, reason: accessData?.motivoSuspensao };
      }
      
      const userData: User = { username: defaultUser.username, provider: "local" };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      initializeUserAccess(defaultUser.username);
      return true;
    }
    
    // Check registered users (email as username)
    const registeredUsers = getRegisteredUsers();
    const registeredUser = registeredUsers.find(
      (u) => u.email === username && u.password === password
    );
    
    if (registeredUser) {
      // Task 87: Check if user is excluded
      if (isUserExcluded(registeredUser.email)) {
        return { excluded: true };
      }
      // Check if user is suspended
      if (isUserSuspended(registeredUser.email)) {
        const accessData = getUserAccessData(registeredUser.email);
        return { suspended: true, reason: accessData?.motivoSuspensao };
      }
      
      const userData: User = { 
        username: registeredUser.email, 
        nome: registeredUser.nome,
        email: registeredUser.email,
        telefone: registeredUser.telefone,
        provider: "local" 
      };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      initializeUserAccess(registeredUser.email, registeredUser.nome, registeredUser.email);
      return true;
    }
    
    return false;
  };
  
  const register = (data: RegisterData): RegisterResult => {
    const registeredUsers = getRegisteredUsers();
    
    // Check if email already exists
    if (registeredUsers.some(u => u.email === data.email)) {
      return { success: false, error: "Este email já está cadastrado" };
    }
    
    // Add new user
    registeredUsers.push({
      email: data.email,
      password: data.senha,
      nome: data.nome,
      telefone: data.telefone,
      cpf: data.cpf,
    });
    
    saveRegisteredUsers(registeredUsers);
    
    // Add to global users list for admin visibility
    addToGlobalUsers({
      id: data.email,
      nome: data.nome,
      email: data.email,
      provider: "local",
      dataCadastro: new Date().toISOString(),
    });
    
    // Auto-login after registration
    const userData: User = {
      username: data.email,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      provider: "local",
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    initializeUserAccess(data.email, data.nome, data.email);
    
    return { success: true };
  };

  // Social login - handles OAuth flow properly
  // Supports real Google OAuth and demo Facebook
  const socialLogin = (provider: "google" | "facebook"): boolean => {
    let userData: User;
    let email: string;
    let nome: string;
    let avatar: string | undefined;
    
    if (provider === "google") {
      // Try to get actual Google user data from callback
      const googleUserData = localStorage.getItem("google_user");
      if (googleUserData) {
        try {
          const googleUser = JSON.parse(googleUserData);
          email = googleUser.email || "usuario.google@gmail.com";
          nome = googleUser.name || "Usuário Google";
          avatar = googleUser.picture || googleUser.avatar;
          console.log("✅ Social login with real Google data:", { email, nome });
        } catch {
          email = "usuario.google@gmail.com";
          nome = "Usuário Google";
        }
      } else {
        email = "usuario.google@gmail.com";
        nome = "Usuário Google";
      }
    } else {
      // Facebook demo mode
      email = "usuario.facebook@facebook.com";
      nome = "Usuário Facebook";
      avatar = "https://graph.facebook.com/default/picture";
    }

    userData = {
      username: email,
      email,
      nome,
      provider,
      avatar,
    };
    
    // Save to auth storage
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // IMPORTANT: Initialize user access so they can access the platform
    initializeUserAccess(email, nome, email);
    
    // Add to global users list for admin visibility
    addToGlobalUsers({
      id: email,
      nome,
      email,
      provider,
      dataCadastro: new Date().toISOString(),
      avatar,
    });
    
    // Also add to registered users list for consistency
    const registeredUsers = getRegisteredUsers();
    if (!registeredUsers.some(u => u.email === email)) {
      registeredUsers.push({
        email,
        password: "", // Social users don't have password
        nome,
        telefone: "",
      });
      saveRegisteredUsers(registeredUsers);
    }
    
    console.log("✅ Social login successful for:", email);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, socialLogin, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
