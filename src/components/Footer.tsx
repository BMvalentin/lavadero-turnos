"use client";
import Image from "next/image";

export function Footer({
  openPrivacy,
  openTerms,
}: {
  openPrivacy: () => void;
  openTerms: () => void;
}) {
  return (
    <footer className="border-t border-celeste/20 bg-white py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          {/* Logo + nombre */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logopng.png"
              alt="Logo Chapa Detail"
              width={32}
              height={32}
            />
            <span className="font-semibold text-foreground">
              Chapa <span className="text-primary">Detail</span>
            </span>
          </div>

          {/* Texto central */}
          <p className="text-sm text-muted-foreground text-center max-w-xs sm:max-w-none">
            Chapa Detail. Lavadero en Santa Clara. {new Date().getFullYear()}
          </p>

          {/* Enlaces */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openTerms();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Términos
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                openPrivacy();
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidad
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}