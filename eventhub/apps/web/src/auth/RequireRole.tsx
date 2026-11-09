
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "./AuthContext";

type Props = {
  children: ReactNode;
};

export function RequireRole({ children }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Перевірка прав доступу...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    user.role !== "ORGANIZER" &&
    user.role !== "ADMIN"
  ) {
    return (
      <main className="page">
        <h1>Доступ заборонено</h1>
        <p>
          Ця сторінка доступна лише організаторам
          та адміністраторам.
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
