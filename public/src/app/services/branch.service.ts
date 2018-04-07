import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Branch, NodeUrl } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()
export class BranchService {

    url = NodeUrl + 'brnc/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService) { }

    getBranch(id?: number) {
        let geturl = this.url;
        if (id != null) {
            geturl = this.url + id;
        }
        return this.http.get(geturl, this.options).map(res => res.json());
    }
    getCompBranch(compId: number) {
        return this.http.get(this.url + 'CompBranch/' + compId, this.options).map(res => res.json());
    }
    getCompBrnchs(compId: number) {
        return this.http.get(this.url + 'GetCompBrnchs/' + compId, this.options).map(res => res.json());
    }
    getBrnchsDepts(compId: number) {
        return this.http.get(this.url + 'BrnchsDepts/' + compId, this.options).map(res => res.json());
    }
    createBranch(branch: Branch) {
        return this.http.post(this.url, branch, this.options).map(res => res.json());
    }
    updateBranch(branch: Branch) {
        return this.http.put(this.url + branch.BranchID, branch, this.options).map(res => res.json());
    }

}
