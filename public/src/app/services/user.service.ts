import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { User, NodeUrl } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()
export class UserService {

    url = NodeUrl + 'users/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService) { }

    getuser(id?: number) {
        let geturl = this.url;
        if (id != null) {
            geturl = this.url + id;
        }
        return this.http.get(geturl, this.options).map(res => res.json());
    }
    getUserChain(id: number) {
        return this.http.get(this.url + 'chain/' + id, this.options).map(res => res.json());
    }
    getManagerChain(id: number) {
        return this.http.get(this.url + 'managerChain/' + id, this.options).map(res => res.json());
    }
    getCompUsers(id: number) {
        return this.http.get(this.url + 'compUsers/' + id, this.options).map(res => res.json());
    }
    CheckCompAdmin(id: number) {
        return this.http.get(this.url + 'compAdm/' + id, this.options).map(res => res.json());
    }
    InsertUser(user: User) {
        return this.http.post(this.url, { basic: user }, this.options).map(res => res.json());
    }
    UpdateUser(id: number, user: User) {
        return this.http.put(this.url + id, { basic: user }, this.options).map(res => res.json());
    }
    UpdateCompUser(id: number, user) {
        return this.http.put(this.url + 'RegUserComp/' + id, { basic: user }, this.options).map(res => res.json());
    }
}
