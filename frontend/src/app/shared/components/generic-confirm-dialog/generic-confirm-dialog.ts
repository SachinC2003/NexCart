import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ConfirmDialog } from '../../../types/confirmDialog.type';

@Component({
  selector: 'app-generic-confirm-dialog',
  imports: [],
  templateUrl: './generic-confirm-dialog.html',
  styleUrl: './generic-confirm-dialog.css',
})
export class GenericConfirmDialog {
    @Input() dialogData!: ConfirmDialog;
    @Output() actionEvent = new EventEmitter<boolean>()

    onConfirm(){
        this.actionEvent.emit(true);
    }

    onCancel(){
        this.actionEvent.emit(false);
    }
}
