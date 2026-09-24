import { Link, useLocation, Outlet } from "react-router-dom";
import { Plus, Search, Settings, LayoutGrid, Library } from "lucide-react";
import logoFaratec from "../assets/logo-faratec.png";

export default function AppLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Accueil", icon: LayoutGrid },
    { to: "/base", label: "Base", icon: Library },
    { to: "/nouveau", label: "Nouveau", icon: Plus },
    { to: "/recherche", label: "Recherche", icon: Search },
    { to: "/parametres", label: "Paramètres", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-neutral-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition overflow-hidden">
                <img
                  src={logoFaratec}
                  alt="FARATEC"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight">Bobinage FARATEC</h1>
                <p className="text-[10px] text-slate-400 leading-tight">Base de schémas</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isActive(item.to)
                        ? "bg-amber-500 text-neutral-900"
                        : "text-slate-300 hover:bg-neutral-800 hover:text-white"
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <nav className="md:hidden bg-white border-b border-slate-200 sticky top-16 z-30">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition border-b-2 ${
                  isActive(item.to)
                    ? "border-amber-500 text-amber-600"
                    : "border-transparent text-slate-500"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-slate-400 text-center">
            FARATEC — Base de schémas de bobinage © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}