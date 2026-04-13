import { Component, Input } from '@angular/core';
import ToastConfig from '../../../types/toast.type';

@Component({
  selector: 'app-generic-toast',
  imports: [],
  templateUrl: './generic-toast.html',
  styleUrl: './generic-toast.css',
})
export class GenericToast {
    @Input() toastConfig!: ToastConfig;
}
