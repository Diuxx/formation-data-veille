import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/services/auth.service';
import { AuthStore } from './core/auth/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  constructor(
    private readonly auth: AuthService,
    private store: AuthStore
  ) {
    console.log(this.store.user);
    this.auth.me().subscribe({
      next: user => this.store.setUser(user),
      error: () => this.store.clear(),
    })
  }
}
