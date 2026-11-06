
import {
  useEffect,
  useState,
  type ReactNode
} from "react";

import {
  restoreSession,
  logout,
  type User
} from "../api/auth";

import { AuthContext } from "./AuthContext";


export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void restoreSession()
      .then((result) => {
        if (active) setUser(result);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    await logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
