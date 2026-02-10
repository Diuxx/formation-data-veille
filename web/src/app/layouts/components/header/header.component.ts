import { Component, inject, OnInit } from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router, RouterLink, RouterModule } from "@angular/router";
import { AuthStore } from "app/core/auth/auth.store";
import { AuthService } from "app/core/auth/services/auth.service";

type NavItem = { label: string; route: string; requiredAdmin: boolean };

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatButton,
    RouterModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class Header implements OnInit {

  // services
  public readonly store = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // variables
  public links: NavItem[] = [
    { label: 'Accueil', route: '/home', requiredAdmin: false },
    { label: 'Front', route: '/front', requiredAdmin: false },
    { label: 'Tools', route: '/tools', requiredAdmin: false },
    { label: 'Admin', route: '/admin', requiredAdmin: true }
  ]
  activeLink = this.links[0];

  constructor() {

  }

  ngOnInit() {
    console.log(this.store.isAdmin())
  }

  public logout() {
    this.auth.logout().subscribe(() => {
      this.store.clear();
      this.router.navigate(['/auth/login']);
    });
  }
}