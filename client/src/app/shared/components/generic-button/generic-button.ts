import { Component, EventEmitter, Input, Output } from '@angular/core';
import ButtonConfig from '../../../types/button.type';

@Component({
  selector: 'app-generic-button',
  imports: [],
  templateUrl: './generic-button.html',
  styleUrl: './generic-button.css',
})
export class GenericButton {
      @Input() buttonConfig!: ButtonConfig;
      @Output() buttonClick = new EventEmitter<void>();

      handleClick() {
         if(this.buttonConfig.type === 'button') {
            this.buttonClick.emit();
         }
      }
}
