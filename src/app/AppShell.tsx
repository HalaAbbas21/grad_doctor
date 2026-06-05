import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  FlaskConical,
  Home,
  LogOut,
  Search,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { useUnreadCount } from "@/store/selectors";
import { departmentLabel, t } from "@/i18n/ar";
import type { Department } from "@/mock/types";
import { GlobalSearch } from "./GlobalSearch";

const NAV = [
  { to: "/", label: t.nav.dashboard, icon: Home, end: true },
  { to: "/patients", label: t.nav.patients, icon: Users, end: false },
  { to: "/labs", label: t.nav.labs, icon: FlaskConical, end: false },
  { to: "/notifications", label: t.nav.notifications, icon: Bell, end: false },
  { to: "/profile", label: t.nav.profile, icon: User, end: false },
];

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { doctor, department, setDepartment, logout } = useAppStore();
  const unread = useUnreadCount();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="surface-bg flex min-h-screen flex-col">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-sm">
              <Stethoscope className="size-5" />
            </span>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-lg font-bold text-foreground">{t.appName}</span>
              <span className="text-[11px] text-muted-foreground">{t.doctorApp}</span>
            </div>
          </Link>

          {/* Department switcher */}
          <div className="ms-1 hidden md:block">
            <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
              <SelectTrigger className="h-10 w-48 bg-card">
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t.common.department}:</span>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">{departmentLabel.clinic}</SelectItem>
                <SelectItem value="daycare">{departmentLabel.daycare}</SelectItem>
                <SelectItem value="inpatient">{departmentLabel.inpatient}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search (grows) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="ms-auto flex h-10 max-w-md flex-1 items-center gap-2 rounded-xl border border-input bg-card px-4 text-sm text-muted-foreground shadow-sm transition hover:border-primary/40 md:ms-2"
          >
            <Search className="size-4 shrink-0" />
            <span className="hidden truncate sm:inline">{t.common.searchByFileNo}</span>
          </button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unread}
              </span>
            )}
          </Button>

          {/* Avatar / profile */}
          <button onClick={() => navigate("/profile")} className="flex items-center gap-2 rounded-full">
            <Avatar>
              <AvatarFallback>{doctor.firstName.charAt(0)}</AvatarFallback>
            </Avatar>
          </button>
        </div>

        {/* Mobile department switcher row */}
        <div className="border-t border-border px-4 py-2 md:hidden">
          <Select value={department} onValueChange={(v) => setDepartment(v as Department)}>
            <SelectTrigger className="h-9 bg-card">
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t.common.department}:</span>
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic">{departmentLabel.clinic}</SelectItem>
              <SelectItem value="daycare">{departmentLabel.daycare}</SelectItem>
              <SelectItem value="inpatient">{departmentLabel.inpatient}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        {/* ── Sidebar (desktop) ── */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 flex-col gap-1 border-e border-border p-4 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="size-5" />
              {item.label}
              {item.to === "/notifications" && unread > 0 && (
                <Badge variant="destructive" className="ms-auto">
                  {unread}
                </Badge>
              )}
            </NavLink>
          ))}
          <div className="mt-auto">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-5" />
              {t.common.logout}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 flex-1 px-4 py-5 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ── Bottom tab bar (mobile/tablet) ── */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-bold transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="size-6" />
              {item.label}
              {item.to === "/notifications" && unread > 0 && (
                <span className="absolute end-5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
