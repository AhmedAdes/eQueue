import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HttpModule } from '@angular/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent } from "./footer/footer.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { ToggleFullscreenDirective } from "./directives/toggle-fullscreen.directive";
import { BootstrapPanelComponent } from 'app/pages/bootstrap-panel/bootstrap-panel.component';
import { StopWatchComponent } from '../pages/stop-watch/stop-watch.component';
import { AuthenticationService } from '../services'



@NgModule({
  exports: [
    CommonModule,
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    BootstrapPanelComponent,
    StopWatchComponent,
    ToggleFullscreenDirective,
    NgbModule,
    HttpModule,
    TranslateModule
  ],
  imports: [
    RouterModule,
    CommonModule,
    NgbModule,
    TranslateModule
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    SidebarComponent,
    BootstrapPanelComponent,
    ToggleFullscreenDirective,
    StopWatchComponent
  ],
  providers: [
    AuthenticationService
  ]
})
export class SharedModule { }
