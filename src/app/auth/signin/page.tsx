"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Github } from "lucide-react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[340px]">
        {/* Logo */}
        <p className="text-[24px] font-semibold text-foreground tracking-tight text-center mb-8">
          riff.fm
        </p>

        {/* Heading */}
        <h1 className="text-h2 text-foreground mb-2 text-center">Sign in</h1>
        <p className="text-[13px] text-muted-foreground mb-8 text-center">
          Connect your accounts to see your media stats.
        </p>

        {/* Auth buttons — stacked vertically */}
        <div className="flex flex-col gap-3">
          {/* Spotify */}
          <button
            onClick={() => signIn("spotify", { callbackUrl })}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Continue with Spotify
          </button>

          {/* GitHub */}
          <button
            onClick={() => signIn("github", { callbackUrl })}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-background px-6 text-[14px] font-medium text-foreground transition-all duration-150 hover:bg-secondary active:scale-[0.98]"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </button>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-background px-6 text-[14px] font-medium text-foreground transition-all duration-150 hover:bg-secondary active:scale-[0.98]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Terms */}
        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          By signing in, you agree to our{" "}
          <a
            href="/terms"
            className="underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
          >
            Terms
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
