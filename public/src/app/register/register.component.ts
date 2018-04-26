import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'app/services';
import { Form } from '@angular/forms/src/directives/form_interface';
import { Router } from '@angular/router';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  error = '';

  constructor(private authServ: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  onSubmit(f) {
    this.authServ.register(f.value)
      .subscribe(res => {
        this.router.navigateByUrl('out/companySetup/companies')
      })
  }
}
