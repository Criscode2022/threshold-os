import { Component, inject, signal } from "@angular/core";
import { Api } from "../api";

@Component({
  selector: "th-incidents",
  imports: [],
  template: `
    <div class="mx-auto max-w-5xl p-5">
      <h1 class="font-display text-4xl">Incidents</h1>
      <ul class="mt-5 grid gap-3">
        @for (item of rows(); track item.id) {
          <li class="rounded-xl border border-line bg-surface p-5">
            <p class="font-medium">{{ item.child_name }}</p>
            <p class="text-sm text-muted">{{ item.kind }} · {{ item.severity }}</p>
            <p class="mt-2 text-sm">{{ item.body }}</p>
          </li>
        }
      </ul>
    </div>
  `,
})
export class IncidentsPage {
  private api = inject(Api);
  rows = signal<any[]>([]);
  constructor() {
    this.api.incidents().then((rows) => this.rows.set(rows));
  }
}
