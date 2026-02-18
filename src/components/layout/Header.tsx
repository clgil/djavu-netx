"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, User, Armchair, ChevronDown, Globe } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/NotificationCenter";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isManager } = useAuth();
  const { itemCount } = useCart();
  const { t, language, setLanguage } = useLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/customize", label: t("nav.customize") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Armchair className="h-8 w-8 text-primary" />
          <span className="font-serif text-xl font-bold text-primary">Djavu</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" title={t("lang." + language)}>
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setLanguage("es")} className={language === "es" ? "bg-accent/10 font-medium" : ""}>🇪🇸 Español</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent/10 font-medium" : ""}>🇺🇸 English</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">{itemCount}</span>}
            </Link>
          </Button>

          {user && <NotificationCenter />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.full_name || t("nav.account")}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><Link href="/orders">{t("nav.myOrders")}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile">{t("nav.profile")}</Link></DropdownMenuItem>
                {isManager && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/admin" className="text-accent">{t("nav.adminPanel")}</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>{t("nav.signOut")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/auth">{t("nav.signIn")}</Link>
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`text-lg font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"}`}>
                    {link.label}
                  </Link>
                ))}
                <hr className="my-4" />
                {user ? (
                  <>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-primary">{t("nav.myOrders")}</Link>
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-primary">{t("nav.profile")}</Link>
                    {isManager && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-accent hover:text-accent/80">{t("nav.adminPanel")}</Link>}
                    <Button variant="outline" onClick={() => { signOut(); setMobileMenuOpen(false); }}>{t("nav.signOut")}</Button>
                  </>
                ) : (
                  <Button asChild><Link href="/auth" onClick={() => setMobileMenuOpen(false)}>{t("nav.signIn")}</Link></Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
