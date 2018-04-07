import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../services'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent {
  currentLang = 'en';
  toggleClass = 'ft-maximize';

  constructor(public translate: TranslateService,
    public auth: AuthenticationService,
    public router: Router) {
    translate.setDefaultLang(this.currentLang)
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de|fr/) ? browserLang : 'en');
  }

  ChangeLanguage(language: string) {
    this.translate.use(language);
  }

  DoLogout() {
    this.auth.logout()
    this.router.navigate(['/out/login'])
  }

  ToggleClass() {
    if (this.toggleClass === 'ft-maximize') {
      this.toggleClass = 'ft-minimize';
    }
    else
      this.toggleClass = 'ft-maximize'
  }

}
