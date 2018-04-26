import { Component, OnInit, OnChanges } from '@angular/core';
import { AuthenticationService } from 'app/services';
import { ActivatedRoute } from '@angular/router';


@Component({
    selector: 'msw-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
    setup; active; currComp;

    constructor(private srvAuth: AuthenticationService, private route: ActivatedRoute) {
        this.setup = this.srvAuth.currentUser.cSet;
    }
    ngOnInit() {
        this.currComp = this.route.children[0].routeConfig.path;
        console.log(this.currComp)
    }
}