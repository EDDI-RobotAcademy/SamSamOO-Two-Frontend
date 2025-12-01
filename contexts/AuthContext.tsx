"use client";

import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {}

const AuthContext = createContext<AuthContextType>({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    return (
        <AuthContext.Provider value={{}}>
            <div>
            </div>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
