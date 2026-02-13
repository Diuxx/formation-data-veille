import { Component, OnInit, inject, signal } from "@angular/core";
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AdminUser, AdminUserService } from 'app/core/auth/services/admin-user.service';
import { UserFormDialogComponent, UserFormDialogData, UserFormDialogResult } from './user-form-dialog.component';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ]
})
export class Admin implements OnInit {
  private readonly userService = inject(AdminUserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  public readonly displayedColumns = ['name', 'email', 'role', 'status', 'actions'];
  public readonly users = signal<AdminUser[]>([]);
  public readonly loading = signal(false);

  public ngOnInit(): void {
    this.fetchUsers();
  }

  public fetchUsers(): void {
    this.loading.set(true);
    this.userService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (users) => this.users.set(users),
        error: () => this.snackBar.open('Impossible de charger les utilisateurs', 'Fermer', { duration: 3000 })
      });
  }

  public addUser(): void {
    const data: UserFormDialogData = { mode: 'create' };

    this.dialog.open(UserFormDialogComponent, { data, width: '640px' }).afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.createUser(result);
    });
  }

  public editUser(user: AdminUser): void {
    const data: UserFormDialogData = {
      mode: 'edit',
      user
    };

    this.dialog.open(UserFormDialogComponent, { data, width: '640px' }).afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.updateUser(user.id, result);
    });
  }

  public deleteUser(user: AdminUser): void {
    const confirmed = window.confirm(`Supprimer l'utilisateur ${user.email} ?`);
    if (!confirmed) {
      return;
    }

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update((items) => items.filter((item) => item.id !== user.id));
        this.snackBar.open('Utilisateur supprimé', 'Fermer', { duration: 2500 });
      },
      error: () => this.snackBar.open('Échec de la suppression', 'Fermer', { duration: 3000 })
    });
  }

  private createUser(payload: UserFormDialogResult): void {
    if (!payload.password) {
      this.snackBar.open('Le mot de passe est requis pour la création', 'Fermer', { duration: 3000 });
      return;
    }

    this.userService.create({
      email: payload.email,
      name: payload.name,
      role: payload.role,
      isActive: payload.isActive,
      password: payload.password
    }).subscribe({
      next: (createdUser) => {
        this.users.update((items) => [createdUser, ...items]);
        this.snackBar.open('Utilisateur créé', 'Fermer', { duration: 2500 });
      },
      error: () => this.snackBar.open('Échec de la création', 'Fermer', { duration: 3000 })
    });
  }

  private updateUser(userId: string, payload: UserFormDialogResult): void {
    this.userService.update(userId, payload).subscribe({
      next: (updatedUser) => {
        this.users.update((items) => items.map((item) => item.id === userId ? updatedUser : item));
        this.snackBar.open('Utilisateur mis à jour', 'Fermer', { duration: 2500 });
      },
      error: () => this.snackBar.open('Échec de la mise à jour', 'Fermer', { duration: 3000 })
    });
  }

}