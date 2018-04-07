import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { User, NodeUrl, Ticket } from '../Models';
import { AuthenticationService } from './auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
@Injectable()
export class TicketService {

    url = NodeUrl + 'tckt/';
    headers = new Headers({
        'Authorization': this.authService.token,
        'Salt': this.authService.salt
    });
    options = new RequestOptions({ headers: this.headers });

    constructor(private http: Http, private authService: AuthenticationService, public db: AngularFireDatabase) { }

    issueTicket(newTicket) {
        return this.http.post(this.url + 'IssueNew/', { tckt: newTicket }, this.options).map(res => res.json());
    }
    getActiveTickets(userId: number) {
        return this.http.get(this.url + 'ActiveTickets/' + userId, this.options).map(res => res.json());
    }
    getTicketHistory(vDate, compId, branchId, deptId, servId, userId: number) {
        return this.http.get(this.url + 'TicketsHistory/' + userId + '/' + vDate + '/' + compId
            + '/' + branchId + '/' + deptId + '/' + servId, this.options).map(res => res.json());
    }
    CancelTicket(QID: number) {
        return this.http.put(this.url + 'CancelTicket/' + QID, { id: QID }, this.options).map(res => res.json())
    }
    getTicketDetails(id: number) {
        return this.http.get(this.url + 'TicketDetails/' + id, this.options).map(res => res.json());
    }
    getSelectedTicket(id: number) {
        return this.http.get(this.url + 'SelectedTicket/' + id, this.options).map(res => res.json());
    }
    getHoldEvents(id: number) {
        return this.http.get(this.url + 'HoldEvents/' + id, this.options).map(res => res.json());
    }
    GetToday(): any {
        return this.http.get(this.url + 'getToday/', this.options).map(res => res.json());
    }
    getUserSrchDetails(userId: number) {
        return this.http.get(this.url + 'SearchDetails/' + userId, this.options).map(res => res.json());
    }
    updateTicket(id: number, ticket: Ticket) {
        return this.http.put(this.url + 'updateTicket/' + id, ticket, this.options).map(res => res.json());
    }
    transferTicket(ticket: Ticket) {
        return this.http.put(this.url + 'transferTicket/', ticket, this.options).map(res => res.json());
    }
    checkTransQ(id: number) {
        return this.http.get(this.url + 'CheckTransQ/' + id, this.options).map(res => res.json());
    }
    updateQCount(tkt: Ticket) {
        return this.http.put(this.url + 'updateQCount/', tkt, this.options).map(res => res.json());
    }
}
