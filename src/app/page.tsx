import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MEDIA_TYPES } from "@/lib/constants";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/layout/Footer";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <Hero />

      {/* Features */}
      <Features />

      {/* Media types — simple horizontal list */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-8">
          <h2 className="text-h2 text-foreground mb-4">
            Built for all your media
          </h2>
          <p className="text-body text-muted-foreground mb-10 max-w-[50ch]">
            Music is live today. Movies, anime, books, games, and more coming
            soon.
          </p>

          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {MEDIA_TYPES.map((media) => (
              <div key={media.id} className="flex items-center gap-2.5">
                <span className="text-[15px]">{media.icon}</span>
                <span className="text-[14px] font-medium text-foreground">
                  {media.label}
                </span>
                {media.status === "live" ? (
                  <span className="text-[11px] font-medium text-primary">
                    Live
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-8">
          <h2 className="text-h1 text-foreground mb-4 max-w-[32ch]">
            Ready to see your stats?
          </h2>
          <p className="text-body text-muted-foreground mb-8 max-w-[45ch]">
            Connect your Spotify account and discover your listening patterns.
            It&apos;s free and takes seconds.
          </p>
          <a
            href="/auth/signin"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-[14px] font-medium text-primary-foreground transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          >
            Sign in with Spotify
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
