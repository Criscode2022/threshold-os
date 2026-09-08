import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Api } from "../api";

@Component({
  selector: "th-today",
  imports: [RouterLink],
  template: `
    <div class="mx-auto max-w-6xl p-5">
      @if (loading()) {
        <div class="h-24 animate-pulse rounded-xl bg-bg-warm"></div>
      } @else if (!data()) {
        <h1 class="font-display text-4xl">Open the desk</h1>
        <p class="mt-2 text-sm text-muted">Load Willow Grove, a complete after-school sample, or start empty.</p>
        <div class="mt-6 flex gap-3">
          <button class="min-h-11 rounded-md bg-accent px-4 text-sm text-accent-fg" (click)="sample()">Load sample center</button>
        </div>
      } @else {
        <p class="text-xs tracking-[0.2em] text-accent uppercase">Today</p>
        <h1 class="font-display text-4xl">{{ data().center.name }}</h1>
        <div class="mt-6 grid gap-3 sm:grid-cols-4">
          <section class="rounded-xl border border-line bg-surface p-5">
            <p class="text-xs text-faint uppercase">Present</p>
            <p class="font-display text-4xl tabular-nums">{{ data().present }}</p>
          </section>
          <section class="rounded-xl border border-line bg-surface p-5">
            <p class="text-xs text-faint uppercase">Enrolled</p>
            <p class="font-display text-4xl tabular-nums">{{ data().enrolled }}</p>
          </section>
          <section class="rounded-xl border border-line bg-surface p-5">
            <p class="text-xs text-faint uppercase">Waitlist</p>
            <p class="font-display text-4xl tabular-nums">{{ data().waitlist }}</p>
          </section>
          <section class="rounded-xl border border-line bg-surface p-5">
            <p class="text-xs text-faint uppercase">Open incidents</p>
            <p class="font-display text-4xl tabular-nums">{{ data().openIncidents }}</p>
          </section>
        </div>
        <h2 class="mt-8 font-display text-2xl">In the building</h2>
        <ul class="mt-3 grid gap-2">
          @for (child of data().childrenIn; track child.id) {
            <li>
              <a [routerLink]="['/app/child', child.id]" class="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3">
                <span>{{ child.first_name }} {{ child.last_name }}</span>
                <span class="text-sm text-muted">{{ child.room_name }}</span>
              </a>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class TodayPage {
  private api = inject(Api);
  data = signal<any>(null);
  loading = signal(true);

  constructor() {
    this.reload();
  }

  async reload() {
    this.loading.set(true);
    try {
      this.data.set(await this.api.dashboard());
    } catch {
      this.data.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  async sample() {
    await this.api.sample("Director");
    await this.reload();
  }
}
