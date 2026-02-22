import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/services/auth.service';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
],
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetPassword implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  public submitted = false;
  public token: string | null = null;
  public form!: FormGroup;
  public loading = false;
  public serverError: string | null = null;

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (this.token)
        this.buildChangeForm();
      else 
        this.buildResetForm()

      this.cdr.markForCheck(); // --
    })
  }

  public submit(): void {
    if (this.form.invalid) return;

    if (this.token) {
      this.serverError = null;
      this.loading = true;
      this.auth.changePassword({
        token: this.token,
        password: this.form.getRawValue().password,
      }).subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
        },
        error: (err) => {
          const status = err?.status;
          const message = err?.error?.message || err?.message;

          if (status === 400) {
            this.serverError = "Jeton invalide ou requête incorrecte.";
          } else if (status === 404) {
            this.serverError = "Lien de réinitialisation invalide ou expiré.";
          } else if (status === 429) {
            this.serverError = "Trop de tentatives. Réessayez plus tard.";
          } else if (status >= 500) {
            this.serverError = "Erreur serveur. Réessayez ultérieurement.";
          } else {
            this.serverError = message || "Une erreur est survenue.";
          }

          this.form.setErrors({ changePassword: true });
          this.loading = false;
        }
      });
    } 
    else {
      this.serverError = null;
      this.loading = true;
      this.auth.resetPassword(this.form.getRawValue()).subscribe({
        next: () => {
          this.submitted = true;
          this.loading = false;
        },
        error: (err) => {
          const status = err?.status;
          const message = err?.error?.message || err?.message;
          if (status === 400) {
            this.serverError = "Requête invalide. Vérifiez l'adresse e-mail.";
          } else if (status === 429) {
            this.serverError = "Trop de tentatives. Réessayez plus tard.";
          } else if (status >= 500) {
            this.serverError = "Erreur serveur. Réessayez ultérieurement.";
          } else {
            this.serverError = message || "Une erreur est survenue.";
          }
          this.form.setErrors({ resetPassword: true });
          this.loading = false;
        }
      });
    }
  }

  public buildChangeForm(): void {
    this.form = this.fb.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  public buildResetForm(): void {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
}