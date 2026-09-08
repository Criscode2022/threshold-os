import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { Api } from "../api";

@Component({
  selector: "th-child",
  imports: [RouterLink, FormsModule],
  template: `
    <div class="mx-auto max-w-3xl p-5">
      <a routerLink="/app/roster" class="text-sm text-accent">Roster</a>
      @if (data(); as d) {
        <h1 class="mt-3 font-display text-4xl">{{ d.child.first_name }} {{ d.child.last_name }}</h1>
        <p class="text-sm text-muted">{{ d.child.room_name }}</p>
        @if (d.child.allergies) {
          <p class="mt-2 text-sm text-warn">Allergy: {{ d.child.allergies }}</p>
        }
        <section class="mt-6 rounded-xl border border-line bg-surface p-5">
          <h2 class="font-display text-xl">Door</h2>
          @if (!d.child.present) {
            <button class="mt-3 min-h-11 rounded-md bg-accent px-4 text-sm text-accent-fg" (click)="inn()">Check in</button>
          } @else {
            <form class="mt-3 flex gap-2" (ngSubmit)="out()">
              <input class="min-h-11 w-32 rounded-md border border-line px-3" [(ngModel)]="pin" name="pin" placeholder="PIN" required />
              <button class="min-h-11 rounded-md bg-accent px-4 text-sm text-accent-fg">Release</button>
            </form>
          }
          @if (message()) { <p class="mt-2 text-sm">{{ message() }}</p> }
        </section>
        <section class="mt-4 rounded-xl border border-line bg-surface p-5">
          <h2 class="font-display text-xl">Authorized adults</h2>
          <ul class="mt-3 grid gap-2">
            @for (g of d.guardians; track g.id) {
              <li>
                <p class="font-medium">{{ g.name }}</p>
                <p class="text-sm text-muted">{{ g.relationship }} · PIN {{ g.pickup_pin }}</p>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class ChildPage {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  data = signal<any>(null);
  pin = "";
  message = signal<string | null>(null);
  id = this.route.snapshot.paramMap.get("id")!;

  constructor() {
    this.reload();
  }
  async reload() {
    this.data.set(await this.api.child(this.id));
  }
  async inn() {
    await this.api.checkIn(this.id);
    await this.reload();
  }
  async out() {
    try {
      const result = await this.api.checkOut(this.id, this.pin);
      this.message.set(`Released to ${result.guardian}`);
      this.pin = "";
      await this.reload();
    } catch {
      this.message.set("PIN does not match an authorized adult");
    }
  }
}
