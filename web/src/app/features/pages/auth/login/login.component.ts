import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/auth/services/auth.service';
import { AuthStore } from 'app/core/auth/auth.store';

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

  hidePassword = true;

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

    this.auth.login(this.form.getRawValue()).subscribe({
      next: user => {
        this.store.setUser(user);
        this.router.navigate(['/home']);
      },
    });
  }
}