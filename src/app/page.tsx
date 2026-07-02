import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MEDIA_TYPES, APP_NAME } from "@/lib/constants";
import { Check, Clock, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-3.5 h-3.5" />
            Now tracking music stats
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
            <span className="text-gradient">{APP_NAME}</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up leading-relaxed">
            Your complete media stats platform.
            <br />
            Track music, movies, anime, books, games, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-secondary text-secondary-foreground rounded-lg font-semibold text-base hover:bg-secondary/80 transition-colors border border-border"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
            Deep insights into your listening habits, powered by your Spotify data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Listening Insights",
                description:
                  "See your top artists, songs, and albums across different time ranges. Discover patterns in your listening habits.",
                icon: "📊",
              },
              {
                title: "Listening Clock",
                description:
                  "Visualize when you listen to music — your most active hours and days, laid out in a beautiful heatmap.",
                icon: "🕐",
              },
              {
                title: "Social Stats",
                description:
                  "Compare your stats with friends. See who listens the most and find shared musical tastes.",
                icon: "👥",
              },
              {
                title: "Time Machine",
                description:
                  "Travel back through your listening history. See how your taste evolved over months and years.",
                icon: "⏳",
              },
              {
                title: "Genre Explorer",
                description:
                  "Dive deep into your genre preferences. See how your taste spans different genres and styles.",
                icon: "🎨",
              },
              {
                title: "Private & Secure",
                description:
                  "Your data stays yours. Full privacy controls, export options, and no data selling. Ever.",
                icon: "🔒",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Media Types ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Media Types
          </h2>
          <p className="text-muted-foreground text-center text-lg mb-16 max-w-2xl mx-auto">
            riff.fm is built to track all your media. Music is live, more coming soon.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {MEDIA_TYPES.map((media) => (
              <div
                key={media.id}
                className={`relative p-5 rounded-xl border text-center transition-all duration-300 ${
                  media.status === "live"
                    ? "bg-primary/10 border-primary/30 hover:border-primary/50"
                    : "bg-card border-border hover:border-border/80 opacity-60"
                }`}
              >
                <div className="text-3xl mb-3">{media.icon}</div>
                <h3 className="font-medium text-sm mb-1">{media.label}</h3>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    media.status === "live"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {media.status === "live" ? (
                    <>
                      <Check className="w-3 h-3" /> Live
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> Coming Soon
                    </>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to see your stats?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Connect your Spotify account and discover your listening patterns.
          </p>
          <a
            href="/auth/signin"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-base hover:bg-primary/90 transition-colors"
          >
            Sign in with Spotify
          </a>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/auth/signin" className="hover:text-foreground transition-colors">
              Sign In
            </a>
            <span className="cursor-default">Terms</span>
            <span className="cursor-default">Privacy</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
