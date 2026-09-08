import { Component, inject, signal } from "@angular/core";
import { Api } from "../api";

@Component({
  selector: "th-waitlist",
  imports: [],
  template: `
    <div class="mx-auto max-w-5xl p-5">
      <h1 class="font-display text-4xl">Waitlist</h1>
      <ol class="mt-5 grid gap-3">
        @for (child of rows(); track child.id) {
          <li class="flex items-center justify-between rounded-xl border border-line bg-surface p-4">
            <div>
              <p class="font-medium">{{ child.first_name }} {{ child.last_name }}</p>
              <p class="text-sm text-muted">Rank {{ child.waitlist_rank }} · {{ child.room_name }}</p>
            </div>
            <button class="min-h-11 rounded-md bg-accent px-4 text-sm text-accent-fg" (click)="enroll(child.id)">Enroll</button>
          </li>
        }
      </ol>
    </div>
  `,
})
export class WaitlistPage {
  private api = inject(Api);
  rows = signal<any[]>([]);
  constructor() {
    this.reload();
  }
  async reload() {
    this.rows.set(await this.api.children("waitlist"));
  }
  async enroll(id: string) {
    await this.api.enroll(id);
    await this.reload();
  }
}
