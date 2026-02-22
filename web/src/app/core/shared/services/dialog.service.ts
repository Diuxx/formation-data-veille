import { inject, Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogComponent } from "../components/dialog/dialog.component";

@Injectable({
    providedIn: 'root'
})
export class DialogService {

    private readonly dialog = inject(MatDialog);

    // variable
    private dialogRef?: MatDialogRef<DialogComponent>;

    // begin of methods 
    private display(title: string, message: string): MatDialogRef<DialogComponent> {
        if (this.dialogRef !== undefined) {
            this.dialogRef?.close();
        }

        this.dialogRef = this.dialog.open(DialogComponent, {
            data: {
                title: title,
                message: message
            },
            width: '400px',
        });
        this.dialogRef.afterClosed().subscribe(() => this.dialogRef = undefined);
        return this.dialogRef;
    }

    public confirm(title: string, message: string): MatDialogRef<DialogComponent> {
        return this.display(title, message);
    }

    public isDialogDisplayed(): boolean {
        return this.dialogRef !== undefined;
    }
}