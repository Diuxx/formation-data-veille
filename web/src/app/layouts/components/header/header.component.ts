import { Component, inject } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { AuthStore } from "app/core/auth/auth.store";
import { AuthService } from "app/core/auth/services/auth.service";


@Component({
  selector: 'app-header',
  imports: [MatButton, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class Header {

  // services
  public readonly store = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  public logout() {
    this.auth.logout().subscribe(() => {
      this.store.clear();
      this.router.navigate(['/auth/login']);
    });
  }

}