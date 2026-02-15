import { Component } from "@angular/core";
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

type AdminMenuItem = {
  path: string;
  label: string;
  icon: string;
};


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ]
})
export class Admin {

  public readonly menuItems: AdminMenuItem[] = [
    { path: 'users', label: 'Users', icon: 'group' },
    { path: 'tools', label: 'Tools', icon: 'build' },
    { path: 'tool-types', label: 'Type tools', icon: 'category' },
    { path: 'stacks', label: 'Stacks', icon: 'layers' },
    { path: 'stack-types', label: 'Type stacks', icon: 'view_carousel' },
    { path: 'audit-logs', label: 'Audit logs', icon: 'history' },
  ];
}