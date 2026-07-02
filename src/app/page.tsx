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

      {/* How it works */}
      <section className="py-24 sm:py-32 border-t border-[hsl(var(--border-faint))]">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
          <p className="text-label text-[hsl(var(--accent))] mb-4">
            How it works
          </p>
          <h2 className="text-h1 text-[hsl(var(--fg-primary))] mb-16 max-w-[38ch]">
            Three steps to your stats
          </h2>

          <div className="grid grid-cols-1 gap-12 sm:gap-16 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect Spotify",
                description:
                  "Link your Spotify account with one click. We only request read access — your data stays private.",
              },
              {
                step: "02",
                title: "Import data",
                description:
                  "We pull your listening history and build a comprehensive picture of your music taste.",
              },
              {
                step: "03",
                title: "See your stats",
                description:
                  "Explore deep visualizations, track changes over time, and discover patterns in your listening.",
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="text-[64px] font-bold leading-none text-[hsl(var(--border-default))] tabular-nums select-none">
                  {item.step}
                </span>
                <h3 className="text-h3 text-[hsl(var(--fg-primary))] mt-4 mb-3">
                  {item.title}
                </h3>
                <p className="text-body text-[hsl(var(--fg-secondary))] max-w-[38ch]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media types — horizontal scroll */}
      <section className="py-24 sm:py-32 border-t border-[hsl(var(--border-faint))]">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
          <p className="text-label text-[hsl(var(--accent))] mb-4">
            Media types
          </p>
          <h2 className="text-h2 text-[hsl(var(--fg-primary))] mb-10">
            Built for all your media
          </h2>
          <p className="text-body text-[hsl(var(--fg-secondary))] mb-10 max-w-[50ch]">
            Music is live today. Movies, anime, books, games, and more coming
            soon.
          </p>

          {/* Horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4">
            {MEDIA_TYPES.map((media) => (
              <div
                key={media.id}
                className="flex-shrink-0 w-[160px] sm:w-auto rounded-[var(--radius-lg)] bg-[hsl(var(--bg-surface))] border border-[hsl(var(--border-subtle))] p-5 transition-all duration-150 hover:border-[hsl(var(--border-default))] hover:bg-[hsl(var(--bg-elevated))]"
              >
                <div className="text-2xl mb-3">{media.icon}</div>
                <h3 className="text-[14px] font-medium text-[hsl(var(--fg-primary))] mb-1">
                  {media.label}
                </h3>
                <span className="text-[11px] font-medium text-[hsl(var(--fg-faint))]">
                  {media.status === "live" ? (
                    <span className="text-[hsl(var(--accent))]">Live</span>
                  ) : (
                    "Coming soon"
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 border-t border-[hsl(var(--border-faint))]">
        <div className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-12">
          <h2 className="text-h1 text-[hsl(var(--fg-primary))] mb-6 max-w-[38ch]">
            Ready to see your stats?
          </h2>
          <p className="text-body-lg text-[hsl(var(--fg-secondary))] mb-10 max-w-[45ch]">
            Connect your Spotify account and discover your listening patterns.
            It&apos;s free and takes seconds.
          </p>
          <a
            href="/auth/signin"
            className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] bg-[hsl(var(--accent))] px-7 text-[15px] font-medium text-[hsl(var(--accent-fg))] transition-all duration-150 hover:brightness-110 hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
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
