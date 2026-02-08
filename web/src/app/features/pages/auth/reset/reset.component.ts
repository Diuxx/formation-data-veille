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
export class ResetPassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  submitted = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit() {
    if (this.form.invalid) return;

    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: () => (this.submitted = true),
    });
  }
}