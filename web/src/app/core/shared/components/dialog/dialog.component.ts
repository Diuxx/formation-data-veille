import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  imports: [
    TranslatePipe,
    // TranslateDirective
  ]
})
export class DialogComponent {

  public readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  public data = inject<{ title: string, message: string}>(MAT_DIALOG_DATA);

  public closeDialog(result = true): void {
    this.dialogRef.close(result);
  }
}
