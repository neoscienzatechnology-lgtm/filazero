import * as React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export function AppShell() {
  const loc = useLocation();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold tracking-tight">
            Fila Zero
          </Link>
          <nav className="flex gap-3 text-sm text-neutral-700">
            <Link
              to="/"
              className={loc.pathname === "/" ? "text-black" : "hover:text-black"}
            >
              Público
            </Link>
            <Link
              to="/operador"
              className={
                loc.pathname.startsWith("/operador")
                  ? "text-black"
                  : "hover:text-black"
              }
            >
              Operador
            </Link>
            <Link
              to="/admin"
              className={
                loc.pathname.startsWith("/admin") ? "text-black" : "hover:text-black"
              }
            >
              Admin
            </Link>
            <Link
              to="/login"
              className={
                loc.pathname.startsWith("/login") ? "text-black" : "hover:text-black"
              }
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

