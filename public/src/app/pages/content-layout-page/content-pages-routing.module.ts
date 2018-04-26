import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContentLayoutPageComponent } from './content-layout-page.component';
import { LoginPageComponent } from '../login/login-page.component';

import { AuthGuard } from 'app/services';
import { MainDisplayComponent } from 'app/pages/queue';
import { RegisterComponent } from 'app/register/register.component';


const routes: Routes = [
  {
    path: '',
    component: ContentLayoutPageComponent,
    data: {
      title: 'Content Layout page'
    },
  },
  {
    path: 'login',
    component: LoginPageComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: 'mdisplay',
    component: MainDisplayComponent,
    data: {
      title: 'Main Display Page'
    }
  },
  { path:'companySetup',loadChildren: '../company-setup/company-setup.module#CompanySetupModule'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
