import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import 'rxjs/add/operator/map';
import { Company, NodeUrl } from '../Models';
import { AuthenticationService } from './auth.service';

@Injectable()

export class AudioService {

    url = NodeUrl + 'aud/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers, responseType: ResponseContentType.ArrayBuffer | ResponseContentType.Json });

    constructor(private http: Http, private authService: AuthenticationService) { }

    playAud(object) {
        return this.http.post(this.url + 'audio/', object, this.options);
    }
}