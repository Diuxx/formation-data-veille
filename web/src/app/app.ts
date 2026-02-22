import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/services/auth.service';
import { AuthStore } from './core/auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {

  // dependency injection using inject.
  private readonly auth = inject(AuthService);
  private readonly store = inject(AuthStore);

  constructor() {
    this.auth.me().subscribe({
      next: user => this.store.setUser(user),
      error: () => this.store.clear(),
    })
  }
}
