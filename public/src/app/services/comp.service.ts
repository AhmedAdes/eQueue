import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Company, NodeUrl } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()
export class CompanyService {

    url = NodeUrl + 'comp/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService) { 
        console.log(this.headers)
    }

    getComp(id?: number) {
        let geturl = this.url;
        if (id != null) {
            geturl = this.url + id;
        }
        return this.http.get(geturl, this.options).map(res => res.json());
    }
    checkCompanySetup(id: number) {
        return this.http.get(this.url + 'checkCompanySetup/' + id, this.options).map(res => res.json());
    }
    getCompanyId(id: number) {
        return this.http.get(this.url + 'getCompId/' + id, this.options).map(res => res.json());
    }
    getAllProviders() {
        return this.http.get(this.url + 'allProviders/all', this.options).map(res => res.json());
    }
    getCountryCities(id) {
        return this.http.get(this.url + 'CountryCities/' + id, this.options).map(res => res.json());
    }
    InsertComp(comp, id) {
        return this.http.post(this.url, { basic: comp, userID: id }, this.options).map(res => res.json());
    }

    UpdateComp(company: Company) {
        return this.http.put(this.url + company.CompID, company, this.options).map(res => res.json());
    }
}
