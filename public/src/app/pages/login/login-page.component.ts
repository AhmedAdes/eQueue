import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, DepartmentService, BranchService, UserService, CompanyService } from '../../services'
import { User, CurrentUser } from 'app/Models';
import { WorkflowService } from 'app/pages/company-setup/workflow/workflow.service';
import * as hf from '../helper.functions';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap/carousel/carousel-config';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss']
})

export class LoginPageComponent {
    user: User;
    currentUser: CurrentUser;
    @ViewChild('f') loginForm: NgForm;
    error = '';

    constructor(private router: Router,
        private route: ActivatedRoute,
        private srvAuth: AuthenticationService,
        private srvUser: UserService,
        private srvWorkFlow: WorkflowService,
        private config: NgbCarouselConfig) {
        config.interval = 5000;
        config.wrap = true;
        config.keyboard = false;
    }

    // On submit button click
    onSubmit() {
        const newuser = {
            LoginName: this.loginForm.controls['inputEmail'].value,
            UserPass: this.loginForm.controls['inputPass'].value
        };
        this.srvAuth.login(newuser).subscribe(result => {
            if (result.login === true) {
                this.currentUser = this.srvAuth.currentUser;
                this.onSuccessLogin();
            } else {
                this.error = result.error;
            }
        })
        // this.loginForm.reset();
    }
    // On Forgot password link click
    onForgotPassword() {
        this.router.navigate(['forgotpassword'], { relativeTo: this.route.parent });
    }
    // On registration link click
    onRegister() {
        this.router.navigate(['register'], { relativeTo: this.route.parent });
    }
    // Check User after Success Login and Select the Correct Component 
    onSuccessLogin() {
        // Select the appropriate Navigation 
        if (this.currentUser) {
            // if Not CompAdmin navigate to dashboard
            if (this.currentUser.uRl != 1) {
                this.router.navigate([`home/dashboard`]);
            } else {
                // if CompAdmin, Navigate to the appropriate page
                switch (this.currentUser.cSet) {
                    case 'Completed':
                        this.router.navigate([`home/dashboard`]);
                        break;
                    case null:
                        this.router.navigate([`out/companySetup/companies`]);
                        break;
                    case 'Comp':
                        this.router.navigate([`out/companySetup/departments`]);
                        break;
                    case 'Dept':
                        this.router.navigate([`out/companySetup/branches`]);
                        break;
                    case 'Brnch':
                        this.router.navigate([`out/companySetup/users`]);
                        break;
                }
            }
        }

        // checkCompanySetupState() {
        //     let step: string;
        //     let companyID: any;
        //     //Check if Logged user is Company Admin  
        //     this.srvUser.CheckCompAdmin(this.srvAuth.currentUser.uID)
        //         .subscribe(res => {
        //             //Get Not Completed Step. 
        //             if (res.error) { hf.handleError(res.error); return }

        //             if (res[0].UserRole !== 'CompAdmin') {
        //                 this.router.navigate([`home/dashboard`]);
        //             } else {
        //                 companyID = res[0].CompID;
        //                 if (companyID == null)
        //                     companyID = 0;
        //                 this.srvComp.checkCompanySetup(companyID)
        //                     .subscribe(
        //                     res => {
        //                         step = this.srvWorkFlow.getLoginFirstInvalidStep(res);
        //                         if (step != null)
        //                             this.router.navigate([`out/companySetup/${step}`]);
        //                         else
        //                             this.router.navigate([`home/dashboard`]);
        //                     });
        //             }
        //         });
        // }
    }
}
