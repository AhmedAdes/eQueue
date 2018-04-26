import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ContentPagesRoutingModule } from './content-pages-routing.module';
import { ContentLayoutPageComponent } from './content-layout-page.component';
import { LoginPageComponent } from '../login/login-page.component';
import { AuthenticationService, AuthGuard, DepartmentService, BranchService, DeptServsService, TicketService } from '../../services'

import { FullPagesModule } from 'app/pages/full-layout-page/full-pages.module';
import { CompanySetupModule } from 'app/pages/company-setup/company-setup.module';
import { MainDisplayComponent } from 'app/pages/queue';
import { SharedModule } from 'app/shared/shared.module';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap/carousel/carousel-config';
import { RegisterComponent } from '../../register/register.component';

@NgModule({
    imports: [
        CommonModule, HttpModule, RouterModule,
        FormsModule,
        ContentPagesRoutingModule,
        FullPagesModule,
        CompanySetupModule,
        SharedModule
    ],
    declarations: [
        LoginPageComponent,
        ContentLayoutPageComponent,
        MainDisplayComponent,
        RegisterComponent
    ],
    providers: [AuthenticationService, AuthGuard, DepartmentService, BranchService, DeptServsService, TicketService, NgbCarouselConfig]
})
export class ContentPagesModule { }
    