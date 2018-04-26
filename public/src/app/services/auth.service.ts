import { Injectable } from '@angular/core';
import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { User, CurrentUser } from '../Models/user';
import { UserRoles, CompanyTypes, NodeUrl, Languages, CompanySetup } from '../Models/BasicObjects';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
    public token: string;
    public salt: string;
    public currentUser: CurrentUser;

    headers = new Headers({ 'Access-Control-Allow-Origin': '*' });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http?: Http) {
        // set token if saved in local storage
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        this.token = this.currentUser && this.currentUser.tkn;
        this.salt = this.currentUser && this.currentUser.slt;
    }
    login(user: any) {
        return this.http.post(NodeUrl + 'auth', user, this.options)
            .map((response: Response) => {
                const arrRet = response.json();
                if (arrRet.error) {
                    return { login: false, error: arrRet.error }
                } /* else if (arrRet.user[0].Approved == false) {
          return { login: false, error: 'this user is not approved yet please wait for the activation.' }
        } */

                // login successful if there's a jwt token in the response
                const token = arrRet.tkn;
                if (token) {
                    // set token property
                    this.token = token;
                    // console.log(arrRet);
                    this.salt = arrRet.salt
                    // var tt = new Buffer(arrRet.user[0].UserPhoto, 'base64')
                    let base64String
                    let photo
                    if (arrRet.user[0].UserPhoto != null) {
                        base64String = btoa([].reduce.call(new Uint8Array(arrRet.user[0].UserPhoto.data),
                            function (p, c) { return p + String.fromCharCode(c) }, ''))
                        photo = 'data:image/PNG;base64,' + base64String
                    } else {
                        photo = './assets/img/avatar5.png'
                    }
                    this.currentUser = {
                        uID: arrRet.user[0].UserID, uName: arrRet.user[0].UserName, uRl: this.getRole(arrRet.user[0].UserRole),
                        etyp: arrRet.user[0].EntityType, tkn: token, slt: arrRet.salt, photo: photo,
                        cID: arrRet.user[0].CompID, bID: arrRet.user[0].BranchID, uWD: arrRet.user[0].Window,
                        uDL: this.getLang(arrRet.user[0].DefaultLang), uAL: this.getLang(arrRet.user[0].AudioLang),
                        cSet: this.getCompSetup(arrRet.user[0].CompanySetup)
                    }

                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    // return true to indicate successful login
                    return { login: true, error: null };
                } else {
                    // return false to indicate failed login
                    return { login: false, error: 'Username or password is incorrect' };
                }
            });
    }
    register(user: User) {
        return this.http.post(NodeUrl + 'auth/' + 'register/', user).map(res => res.json());
    }
    logout(): void {
        // clear token remove user from local storage to log user out
        this.token = null;
        this.salt = null;
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
    getRole(job: string): number {
        const uRoles = UserRoles
        const ret = uRoles.find(obj => obj.name === job).class;
        return ret;
    }
    getCompSetup(compSetup: number) {
        if (compSetup != null) {
            const CompSetup = CompanySetup
            const ret = CompSetup.find(c => c.class == compSetup).name;
            return ret;
        }
        else {
            return null;
        }
    }
    getLang(lang): string {
        const languages = Languages;
        if (lang != null)
            return languages.find(l => l.name === lang).domain;
        else
            return languages.find(l => l.name === 'English').domain;
    }
    getType(typ: number): string {
        const Types = CompanyTypes
        const ret = Types.find(t => t.class == typ).name
        return ret;
    }

    getUser(): CurrentUser {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        return this.currentUser;
    }

}
