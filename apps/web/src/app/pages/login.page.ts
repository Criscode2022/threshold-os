import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Api } from "../api";

@Component({
  selector: "th-login",
  imports: [FormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen place-items-center bg-bg px-5">
      <form class="w-full max-w-md rounded-xl border border-line bg-surface p-7" (ngSubmit)="submit()">
        <a routerLink="/" class="font-display text-lg">Threshold</a>
        <h1 class="mt-5 font-display text-3xl">{{ mode() === "in" ? "Sign in to the desk" : "Create a director account" }}</h1>
        @if (mode() === "up") {
          <label class="mt-4 grid gap-1 text-sm">Full name
            <input class="min-h-11 rounded-md border border-line px-3" [(ngModel)]="name" name="name" required />
          </label>
        }
        <label class="mt-3 grid gap-1 text-sm">Email
          <input class="min-h-11 rounded-md border border-line px-3" type="email" [(ngModel)]="email" name="email" required />
        </label>
        <label class="mt-3 grid gap-1 text-sm">Password
          <input class="min-h-11 rounded-md border border-line px-3" type="password" minlength="8" [(ngModel)]="password" name="password" required />
        </label>
        @if (error()) { <p class="mt-3 text-sm text-danger">{{ error() }}</p> }
        <button class="mt-5 min-h-11 w-full rounded-md bg-accent text-sm font-medium text-accent-fg" type="submit">
          {{ mode() === "in" ? "Sign in" : "Create account" }}
        </button>
        <button class="mt-3 text-sm text-accent" type="button" (click)="mode.set(mode() === 'in' ? 'up' : 'in')">
          {{ mode() === "in" ? "Need an account? Create one" : "Already on staff? Sign in" }}
        </button>
      </form>
    </main>
  `,
})
export class LoginPage {
  private api = inject(Api);
  private router = inject(Router);
  mode = signal<"in" | "up">("in");
  name = "";
  email = "";
  password = "";
  error = signal<string | null>(null);

  async submit() {
    this.error.set(null);
    try {
      if (this.mode() === "up") {
        await this.api.register({ email: this.email, password: this.password, name: this.name });
      } else {
        await this.api.login({ email: this.email, password: this.password });
      }
      await this.router.navigateByUrl("/app");
    } catch {
      this.error.set("Could not authenticate");
    }
  }
}
