import Image from "next/image";
import { APP_NAME, LOGO_SRC } from "@/lib/constants";

/** Logo is rendered larger than in the sidebar to anchor the auth screens. */
const AUTH_LOGO_SIZE = 40;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="from-muted/60 to-background flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b px-4 py-10">
      <main className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src={LOGO_SRC}
            alt=""
            width={AUTH_LOGO_SIZE}
            height={AUTH_LOGO_SIZE}
            priority
          />
          <p className="text-xl font-semibold tracking-tight">{APP_NAME}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
