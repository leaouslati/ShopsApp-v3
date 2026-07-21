import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { UpdateDialog } from '../../shared/modal-shell/update-dialog/update-dialog';

@Injectable({
  providedIn: 'root',
}) export class Update {
  private dialog = inject(MatDialog);
  private swUpdate = inject(SwUpdate);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
      .subscribe(() => {
        const dialogRef = this.dialog.open(UpdateDialog);

        dialogRef.afterClosed().subscribe((shouldReload) => {
          if (shouldReload) {
            this.swUpdate.activateUpdate().then(() => {
              document.location.reload();
            });
          }
        });
      });
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 30 * 60 * 1000);
  }


}