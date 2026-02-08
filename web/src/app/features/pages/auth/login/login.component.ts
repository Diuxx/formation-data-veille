import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/services/auth.service';
import { AuthStore } from 'app/core/auth/auth.store';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private store = inject(AuthStore);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // variables
  public hidePassword = true;
  public loading = false;
  public serverError: string | null = null;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /**
   * Send the authentication form.
   * @returns void
   */
  public submit(): void {
    if (this.form.invalid) return;

    // Reset previous error and mark as loading
    this.serverError = null;
    this.loading = true;

    this.auth.login(this.form.getRawValue()).pipe(finalize(() => {
      this.loading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: user => {
        this.store.setUser(user);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Basic error mapping based on HTTP status
        const status = err?.status;
        const message = err?.error?.message || err?.message;

        if (status === 400) {
          this.serverError = "Requête invalide. Vérifiez vos informations.";
        } else if (status === 401) {
          this.serverError = "Identifiants incorrects. Veuillez réessayer.";
        } else if (status === 429) {
          this.serverError = "Trop de tentatives. Réessayez plus tard.";
        } else if (status >= 500) {
          this.serverError = "Erreur serveur. Réessayez ultérieurement.";
        } else {
          this.serverError = message || "Une erreur est survenue.";
        }
        
        this.form.setErrors({ auth: true }); // Optionally mark form as having an error
      }
    });
  }
}