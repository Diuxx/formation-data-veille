import { Injectable, signal, computed } from '@angular/core';
import { User } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private userSignal = signal<User | null>(null);

  public user = this.userSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.userSignal());

  setUser(user: User | null) {
    this.userSignal.set(user);
  }

  clear() {
    this.userSignal.set(null);
  }
}
