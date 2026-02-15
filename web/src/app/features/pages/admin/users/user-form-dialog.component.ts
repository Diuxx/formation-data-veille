import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export type UserFormDialogData = {
  mode: 'create' | 'edit';
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'USER';
    isActive: number;
  };
};

export type UserFormDialogResult = {
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: number;
  password?: string;
};

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ]
})
export class UserFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent, UserFormDialogResult>);

  public readonly data = inject<UserFormDialogData>(MAT_DIALOG_DATA);
  public readonly isEditMode = this.data.mode === 'edit';

  public readonly form = this.fb.nonNullable.group({
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    name: [this.data.user?.name ?? '', [Validators.required, Validators.minLength(4)]],
    role: [this.data.user?.role ?? 'USER' as 'ADMIN' | 'USER', [Validators.required]],
    isActive: [Boolean(this.data.user?.isActive ?? 1)],
    password: ['', this.isEditMode ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)]]
  });

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: UserFormDialogResult = {
      email: value.email,
      name: value.name,
      role: value.role,
      isActive: value.isActive ? 1 : 0
    };

    if (value.password.trim()) {
      result.password = value.password.trim();
    }

    this.dialogRef.close(result);
  }
}
