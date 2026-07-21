import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogContent } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-update-dialog',
  imports: [MatDialogContent, TranslatePipe],
  templateUrl: './update-dialog.html',
  styleUrl: './update-dialog.css',
})
export class UpdateDialog {
  dialogRef = inject(MatDialogRef<UpdateDialog>);

  onReload() {
    this.dialogRef.close(true);
  }

  onDismiss() {
    this.dialogRef.close(false);
  }
}