"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  email: string;
  name: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  //서버에 로그인 상태 요청
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/status`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.logged_in) {
          setIsLoggedIn(true);
          setUser({
            email: data.email,
            name: data.name
          });
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUser(null);
      });
  }, []);

  //로그인: 구글 OAuth 이동
  const login = () => {
    window.location.href =
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH}`;
  };

  //로그아웃
  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/authentication/logout`, {
      method: "POST",
      credentials: "include",
    });
    
    setIsLoggedIn(false);
    setUser(null);
    
    // 로그아웃 이벤트 발생 (홈페이지가 감지할 수 있도록)
    window.dispatchEvent(new Event('logout'));
    
    // localStorage를 이용한 다른 탭 동기화
    localStorage.setItem('logout', Date.now().toString());
    localStorage.removeItem('logout');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);