import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Plus, Truck, Warehouse } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";

const NAV = [
  { to: "/", label: "Magazyn", icon: Warehouse, end: true },
  { to: "/podsumowanie", label: "Podsumowanie", icon: LayoutDashboard },
  { to: "/wyjazdy", label: "Wyjazdy", icon: Truck },
];

export function AppLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Górny pasek */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <NavLink to="/" className="flex shrink-0 items-center">
            <Logo className="h-9" />
          </NavLink>

          {/* Nawigacja desktop */}
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Akcje po prawej */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Button
              onClick={() => navigate("/produkt/nowy")}
              className="hidden whitespace-nowrap md:inline-flex"
              size="sm"
            >
              <Plus className="h-4 w-4" /> Dodaj produkt
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut()}
              title="Wyloguj"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Treść strony */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* Dolna nawigacja mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-background/95 backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Pływający przycisk „Dodaj" — zawsze dostępny na telefonie */}
      <Button
        onClick={() => navigate("/produkt/nowy")}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-xl shadow-primary/30 md:hidden"
        size="icon"
        aria-label="Dodaj produkt"
      >
        <Plus className="!h-6 !w-6" />
      </Button>
    </div>
  );
}
