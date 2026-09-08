import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "th-landing",
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-bg text-ink">
      <header class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a routerLink="/" class="font-display text-xl">Threshold</a>
        <a routerLink="/login" class="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">Open the desk</a>
      </header>
      <main class="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <p class="text-xs font-medium tracking-[0.22em] text-accent uppercase">Childcare operations desk</p>
        <h1 class="mt-4 max-w-xl font-display text-5xl leading-tight">Know who is in the room — and who may walk them out.</h1>
        <p class="mt-5 max-w-lg text-lg text-muted">
          Live attendance, licensed ratios, authorized pickup, and incident records for after-school and nursery programs.
        </p>
        <div class="mt-8 flex gap-3">
          <a routerLink="/login" class="inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">Start a center</a>
        </div>
        <div class="mt-16 grid gap-6 md:grid-cols-3">
          <article class="rounded-xl border border-line bg-surface p-6">
            <h2 class="font-display text-xl">Live ratios</h2>
            <p class="mt-2 text-sm text-muted">Present headcount against the room’s adult-to-child license.</p>
          </article>
          <article class="rounded-xl border border-line bg-surface p-6">
            <h2 class="font-display text-xl">Authorized pickup</h2>
            <p class="mt-2 text-sm text-muted">Release only when the adult PIN matches a named guardian.</p>
          </article>
          <article class="rounded-xl border border-line bg-surface p-6">
            <h2 class="font-display text-xl">Licensing trail</h2>
            <p class="mt-2 text-sm text-muted">Injuries, notes, and the day’s door log survive the evening.</p>
          </article>
        </div>
      </main>
    </div>
  `,
})
export class LandingPage {}
