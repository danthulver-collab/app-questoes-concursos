import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "./api-client";
import { initializeUserAccess } from "./access-control";

interface User {
  id?: number;
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
  login: (username: string, password: string) => Promise<boolean | { suspended: true; reason?: string } | { excluded: true }>;
  socialLogin: (provider: "google" | "facebook") => boolean;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "quiz_auth_user";
const TOKEN_KEY = "quiz_auth_token";

// Fallback para localStorage (modo desenvolvimento)
const USERS_STORAGE_KEY = "quiz_registered_users";
const DEFAULT_USERS = [
  { username: "admin", password: "admin123" },
  { username: "usuario", password: "senha123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Tenta API primeiro
      const response = await apiClient.login(username, password);
      
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id,
          username: response.data.username,
          nome: response.data.fullName || response.data.username,
          email: response.data.email,
          telefone: response.data.phone,
          provider: "local"
        };
        
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        
        // Initialize user access
        initializeUserAccess(username);
        
        setIsLoading(false);
        return true;
      }
      
      // Verifica se foi erro de conta excluída/suspensa
      if (!response.success && response.error) {
        if (response.error.includes("excluída")) {
          setIsLoading(false);
          return { excluded: true };
        }
        if (response.error.includes("suspensa")) {
          setIsLoading(false);
          return { suspended: true, reason: response.error };
        }
      }
    } catch (error) {
      console.warn("[AUTH] API falhou, tentando fallback localStorage...", error);
    }
    
    // FALLBACK: localStorage (desenvolvimento)
    try {
      // Check default users
      const defaultUser = DEFAULT_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (defaultUser) {
        const userData: User = { 
          username: defaultUser.username,
          nome: defaultUser.username === "admin" ? "Administrador" : "Usuário Teste",
          provider: "local"
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        initializeUserAccess(username);
        setIsLoading(false);
        return true;
      }

      // Check registered users from localStorage
      const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
      const registeredUser = registeredUsers.find(
        (u: any) => u.email === username && u.password === password
      );
      
      if (registeredUser) {
        const userData: User = {
          username: registeredUser.email,
          nome: registeredUser.nome,
          email: registeredUser.email,
          telefone: registeredUser.telefone,
          provider: "local"
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        initializeUserAccess(registeredUser.email);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error("[AUTH] Fallback error:", error);
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (data: RegisterData): Promise<RegisterResult> => {
    setIsLoading(true);
    
    try {
      // Tenta API primeiro
      const response = await apiClient.register({
        username: data.email, // Usa email como username
        email: data.email,
        password: data.senha,
        fullName: data.nome,
        phone: data.telefone,
        cpf: data.cpf
      });
      
      if (response.success && response.data) {
        const userData: User = {
          id: response.data.id,
          username: response.data.username,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          provider: "local"
        };
        
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        initializeUserAccess(data.email);
        
        setIsLoading(false);
        return { success: true };
      }
      
      if (!response.success && response.error) {
        setIsLoading(false);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.warn("[AUTH] API falhou, usando fallback localStorage...", error);
    }
    
    // FALLBACK: localStorage
    try {
      const registeredUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || "[]");
      
      // Check if email already exists
      if (registeredUsers.some((u: any) => u.email === data.email)) {
        setIsLoading(false);
        return { success: false, error: "Email já cadastrado" };
      }
      
      registeredUsers.push({
        email: data.email,
        password: data.senha,
        nome: data.nome,
        telefone: data.telefone,
        cpf: data.cpf
      });
      
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
      
      const userData: User = {
        username: data.email,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        provider: "local"
      };
      
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      initializeUserAccess(data.email);
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Erro ao registrar" };
    }
  };

  const socialLogin = (provider: "google" | "facebook") => {
    // Social login simulation
    const userData: User = {
      username: `${provider}_user`,
      nome: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      provider
    };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    initializeUserAccess(`${provider}_user`);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
