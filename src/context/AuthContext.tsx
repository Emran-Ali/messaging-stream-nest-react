import { useMutation } from "@tanstack/react-query";
import { UseMutationResult } from "@tanstack/react-query/build/lib/types";
import axios, { AxiosResponse } from "axios";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { StreamChat } from "stream-chat";
import { useLocalStorage } from "../hooks/useLocalStorage";

type AuthContext = {
  user?: User;
  streamChat?: StreamChat;
  signup: UseMutationResult<AxiosResponse, unknown, User>;
  login: UseMutationResult<
    { token: string; user: User; streamToken: string },
    unknown,
    string
  >;
  logout: UseMutationResult<AxiosResponse, unknown, void>;
  streamToken?: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  photo?: string;
  password: string;
};

const Context = createContext<AuthContext | null>(null);

export function useAuth() {
  return useContext(Context) as AuthContext;
}

export function useLoggedInAuth() {
  return useContext(Context) as AuthContext &
    Required<Pick<AuthContext, "user">>;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage<User>("user");
  const [token, setToken] = useLocalStorage<string>("token");
  const [streamToken, setStreamToken] = useLocalStorage<string>("token");
  const [streamChat, setStreamChat] = useState<StreamChat>();

  const signup = useMutation({
    mutationFn: (user: User) => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/signup`, user);
    },
    onSuccess() {
      navigate("/login");
    },
  });

  type Data = { email: string; password: string };

  const login = useMutation({
    mutationFn: (data: Data) => {
      return axios
        .post(`${import.meta.env.VITE_SERVER_URL}/auth/login`, data)
        .then((res) => {
          return res.data as { token: string; user: User; streamToken: string };
        });
    },
    onSuccess(data) {
      setUser(data.user);
      setToken(data.token);
      setStreamToken(data.streamToken);
    },
  });

  const logout = useMutation({
    mutationFn: () => {
      return axios.post(`${import.meta.env.VITE_SERVER_URL}/logout`, { token });
    },
    onSuccess() {
      setUser(undefined);
      setToken(undefined);
      setStreamChat(undefined);
    },
  });

  useEffect(() => {
    if (streamToken == null || user == null) return;
    const chat = new StreamChat(import.meta.env.VITE_STREAM_API_KEY!);

    if (chat.tokenManager.token === token && chat.userID === user.id) return;

    let isInterrupted = false;
    const connectPromise = chat.connectUser(user, streamToken).then(() => {
      if (isInterrupted) return;
      setStreamChat(chat);
    });

    return () => {
      isInterrupted = true;
      setStreamChat(undefined);

      connectPromise.then(() => {
        chat.disconnectUser();
      });
    };
  }, [streamToken, user]);

  return (
    <Context.Provider
      value={{ signup, login, user, streamChat, logout, streamToken }}
    >
      {children}
    </Context.Provider>
  );
}
