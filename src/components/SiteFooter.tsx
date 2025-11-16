import Link from "next/link";

import { Facebook, Instagram, Linkedin, Mail, X } from "lucide-react";

export default function SiteFooter() {
  const facebook = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "#";
  const instagram = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "#";
  const linkedin = process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "#";
  const x = process.env.NEXT_PUBLIC_SOCIAL_X || "#";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@prepnmcn.com";

  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} O'Prep — Built for every Nigerian
            professional exam student.
          </div>

          <div className="flex items-center gap-4">
            <a
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-muted-foreground hover:text-foreground"
            >
              <Facebook className="h-5 w-5" />
            </a>

            <a
              href={instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-muted-foreground hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </a>

            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-foreground"
            >
              <Linkedin className="h-5 w-5" />
            </a>

            <a
              href={x}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </a>

            <a
              href={`mailto:${email}`}
              aria-label="Email"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
