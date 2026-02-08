import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from 'app/core/auth/services/auth.service';
import { AuthStore } from 'app/core/auth/auth.store';

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
  private store = inject(AuthStore);
  private router = inject(Router);

  hidePassword = true;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  submit() {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();

    this.auth.register(payload).subscribe({
      next: user => {
        this.store.setUser(user);
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
