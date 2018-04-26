import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { NodeUrl, Service } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()
export class DeptServsService {

    url = NodeUrl + 'srvc/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService) { }

    getServs(id?: number) {
        let geturl = this.url;
        if (id != null) {
            geturl = this.url + id;
        }
        return this.http.get(geturl, this.options).map(res => res.json());
    }
    getDeptServss(id: number) {
        return this.http.get(this.url + 'DeptServs/' + id, this.options).map(res => res.json());
    }
    getCompServss(compId: number) {
        return this.http.get(this.url + 'CompServs/' + compId, this.options).map(res => res.json());
    }
    getBranchServss(brncId: number) {
        return this.http.get(this.url + 'BranchServs/' + brncId, this.options).map(res => res.json());
    }
    createService(service: Service) {
        return this.http.post(this.url, service, this.options).map(res => res.json());
    }
    updateService(id: number, service: Service) {
        return this.http.put(this.url + id, service, this.options).map(res => res.json());
    }
    deleteService(id: number) {
        return this.http.delete(this.url + id, this.options);
    }
}
