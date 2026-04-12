import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import {Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import FormField from '../../types/form.types';
import { GenericFormComponent } from '../../shared/components/generic-form/generic-form';

@Component({
  selector: 'app-change-password',
  imports: [GenericFormComponent, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
     constructor(private userSer: UserService,
                 private toastr: ToastrService,
                 private router: Router,
                 private location: Location
     ){}

     currentPassword: string = '';
     newPassword: string = '';

     changePassBluePrint: FormField[] = [
        {
            name: 'currentPassword',
            label: 'Current Password',
            type: 'password',
            placeholder: 'Enter your current Password',
            validations: { required: true, minLength: 6 }
        },
        {
            name: 'newPassword',
            label: 'New Password',
            type: 'password',
            placeholder: 'Enter new password',
            validations: { required: true, minLength: 6}
        }
     ]

     handelChangePassword(data: any){
         this.userSer.changePassword(data.currentPassword, data.newPassword).subscribe({
             next: (res)=>{
                 this.toastr.success(res.message);
                 this.router.navigate(['/auth/login']);

             },
             error:(err) =>{
                this.toastr.error(err.error.message);
             },
         })
     }

     goBack() {
        this.location.back();
    }
}
