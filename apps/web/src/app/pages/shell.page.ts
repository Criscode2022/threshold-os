import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { Api } from "../api";

@Component({
  selector: "th-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-bg lg:grid lg:grid-cols-[220px_1fr]">
      <aside class="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <a routerLink="/app" class="px-5 py-5 font-display text-lg">Threshold</a>
        <nav class="flex flex-1 flex-col gap-1 px-3">
          @for (item of nav; track item.to) {
            <a [routerLink]="item.to" routerLinkActive="bg-accent-soft text-accent"
               [routerLinkActiveOptions]="{ exact: item.exact }"
               class="flex min-h-11 items-center rounded-md px-3 text-sm text-ink-soft hover:bg-bg-warm">
              {{ item.label }}
            </a>
          }
        </nav>
        <button class="m-4 min-h-11 rounded-md border border-line text-sm" (click)="out()">Sign out</button>
      </aside>
      <div class="pb-16 lg:pb-0">
        <header class="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
          <a routerLink="/app" class="font-display text-lg">Threshold</a>
          <button class="text-sm" (click)="out()">Sign out</button>
        </header>
        <router-outlet />
      </div>
      <nav class="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-line bg-surface lg:hidden">
        @for (item of nav.slice(0,4); track item.to) {
          <a [routerLink]="item.to" class="flex min-h-14 items-center justify-center text-xs text-muted">{{ item.label }}</a>
        }
      </nav>
    </div>
  `,
})
export class ShellPage {
  private api = inject(Api);
  private router = inject(Router);
  nav = [
    { to: "/app", label: "Today", exact: true },
    { to: "/app/door", label: "Door", exact: false },
    { to: "/app/roster", label: "Roster", exact: false },
    { to: "/app/incidents", label: "Incidents", exact: false },
    { to: "/app/waitlist", label: "Waitlist", exact: false },
  ];
  async out() {
    await this.api.logout();
    await this.router.navigateByUrl("/login");
  }
}
