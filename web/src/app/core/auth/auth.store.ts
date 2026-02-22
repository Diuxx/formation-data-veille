import { Injectable, signal, computed } from '@angular/core';
import { Auth, Roles } from './models/user.model';



@Injectable({ providedIn: 'root' })
export class AuthStore {
  private userSignal = signal<Auth | null>(null);

  public user = this.userSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.userSignal());
  public isAdmin = computed(() => this.userSignal()?.user?.role == Roles.admin);

  setUser(user: Auth | null) {
    this.userSignal.set(user);
  }

  clear() {
    this.userSignal.set(null);
  }
}
