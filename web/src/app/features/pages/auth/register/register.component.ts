import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'app/core/auth/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  public hidePassword = true;
  public loading = false;
  public serverError: string | null = null;
  public created = false;
  
  private passwordMatchValidator = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      return { passwordsDontMatch: true };
    }
    return null;
  }
  
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });


  submit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();

    this.serverError = null;
    this.loading = true;

    this.auth.register(payload).pipe(finalize(() => {
      this.loading = false;
      // force le change detection.
      // @if / @else is not triggering the change detection always.
      this.cdr.markForCheck();
    })).subscribe({
      next: () => this.created = true,
      error: (err) => {
        const status = err?.status;
        const message = err?.error?.message || err?.message;

        if (status === 400) {
          this.serverError = "Requête invalide. Vérifiez vos informations.";
        } else if (status === 409) {
          this.serverError = "Un compte avec cet e-mail existe déjà.";
        } else if (status === 429) {
          this.serverError = "Trop de tentatives. Réessayez plus tard.";
        } else if (status >= 500) {
          this.serverError = "Erreur serveur. Réessayez ultérieurement.";
        } else {
          this.serverError = message || "Une erreur est survenue.";
        }

        this.form.setErrors({ register: true });
      }
    });
  }
}
