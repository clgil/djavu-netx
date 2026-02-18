"use client";

import Link from "next/link";
import { Armchair, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4"><Armchair className="h-8 w-8" /><span className="font-serif text-xl font-bold">Djavu</span></Link>
            <p className="text-sm text-primary-foreground/80">{t("footer.description")}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/products" className="hover:text-primary-foreground transition-colors">{t("nav.products")}</Link></li>
              <li><Link href="/customize" className="hover:text-primary-foreground transition-colors">{t("nav.customize")}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary-foreground transition-colors">{t("nav.howItWorks")}</Link></li>
              <li><Link href="/about" className="hover:text-primary-foreground transition-colors">{t("nav.about")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.customerService")}</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link href="/contact" className="hover:text-primary-foreground transition-colors">{t("nav.contact")}</Link></li>
              <li><Link href="/orders" className="hover:text-primary-foreground transition-colors">{t("footer.trackOrder")}</Link></li>
              <li><Link href="/auth" className="hover:text-primary-foreground transition-colors">{t("footer.myAccount")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">{t("footer.contactTitle")}</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 flex-shrink-0" /><span>Colon #552, Santa Clara, Cuba</span></li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 flex-shrink-0" /><span>+53 50625350</span></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 flex-shrink-0" /><span>info@djavu.store</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60"><p>© {new Date().getFullYear()} Djavu. {t("footer.rights")}</p></div>
      </div>
    </footer>
  );
}
