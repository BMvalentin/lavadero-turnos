"use client";
import Image from "next/image";

export function Footer( { openPrivacy, openTerms }: { openPrivacy: () => void; openTerms: () => void } ) {
  return (
    <footer className="py-8 border-t border-celeste/20 mx-auto  bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logopng.png" alt="" width={'32'} height={'32'}/>
            <span className="font-semibold text-foreground">
              Chapa{" "}<span className="text-primary">Detail</span>
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            Chapa detail.{" "}Lavadero en Santa clara.{" "}{new Date().getFullYear()} 
          </p>

          <div className="flex gap-6">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
              e.preventDefault();
              openTerms();
            }}>

              Términos
            </button>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={(e) => {
              e.preventDefault();
              openPrivacy();
            }}>

              Privacidad
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
