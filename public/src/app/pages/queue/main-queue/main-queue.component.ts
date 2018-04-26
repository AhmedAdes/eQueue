import { Component, OnInit, animate } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import * as hf from '../../helper.functions'
import { DepartmentService, AuthenticationService, TicketService } from 'app/services';
import { Ticket, CurrentUser } from 'app/Models';
import swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-main-queue',
  templateUrl: './main-queue.component.html',
  styleUrls: ['./main-queue.component.scss']
})
export class MainQueueComponent implements OnInit {
  currentUser = this.srvAuth.getUser()
  tickets: Observable<any>
  sTkts: any[] = [];
  depts: any[] = [];
  all; hold; trans; vip;
  sDept; sTab;
  sTk = new Ticket();
  start: boolean;
  deptsWQ: number[] = [];
  maxPend;
  startTimer = false;
  branchId = this.currentUser.bID;
  private subscription = new Subscription();

  constructor(public db: AngularFireDatabase, private srvDept: DepartmentService,
    private srvAuth: AuthenticationService, private srvTkts: TicketService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.srvDept.getUserDepts(this.currentUser.uID)
      .subscribe(res => {
        this.depts = res[0];
        this.maxPend = res[1][0].MaxPend;

        if (this.depts.length > 0) {
          this.sDept = this.depts[0];
          this.observQueueList();
          this.initQueueList(this.depts[0].DeptID.toString())
        }
      });
  }

  observQueueList() {
    this.tickets = this.db.list('MainQueue/' + this.currentUser.bID.toString(),
      ref => ref.orderByChild('QID')
    ).valueChanges().map(tks => {
      return tks.filter((tkt) => {
        if (tkt['VisitDate'] == hf.handleDate(new Date())) {
          return true;
        } else {
          return false;
        }
      })
    })
  }
  initQueueList(deptID) {
    this.tickets.subscribe(data => {
      this.deptsWQ = [];
      for (var i = 0; i < this.depts.length; i++) {
        this.deptsWQ.push(data.filter(x => x['DeptID'] == this.depts[i].DeptID.toString() && (x.QStatus == 'Transferred' || x.QStatus == 'Waiting' || x.QStatus == 'Pending' || x.QStatus == 'Current')).length)
      }
      this.all = data.filter(x => x['DeptID'] == deptID && (x.QStatus == 'Waiting' || x.QStatus == 'Pending' || x.QStatus == 'Current')).length;
      this.hold = data.filter(x => x['DeptID'] == deptID && x['QStatus'] == 'Hold' && x.ProvUserID == this.currentUser.uID).length;
      this.trans = data.filter(x => x['DeptID'] == deptID && (x['QStatus'] == 'Transferred' || x['QStatus'] == 'Current')).length;
      this.vip = data.filter(x => x['DeptID'] == deptID && x['UserID'] == '1').length;

    })
    this.changeList(0);
  }
  deptWQ() {

  }
  changeList(i: number) {
    this.sTk = new Ticket();
    switch (i) {

      case 0:
        this.tickets.subscribe(t => {
          this.sTkts = t.filter(x => x['DeptID'] == this.sDept.DeptID && x.QTransfer == false);
          this.sTab = 'All';
        })
        break;
      case 1:
        this.tickets.subscribe(t => {
          this.sTkts = t.filter(x => x['DeptID'] == this.sDept.DeptID && x.QStatus == 'Hold' && x.ProvUserID == this.currentUser.uID);
          this.sTab = 'Hold';
        })
        break;
      case 2:
        this.tickets.subscribe(t => {
          this.sTkts = t.filter(x => x['DeptID'] == this.sDept.DeptID && x.QTransfer == true);
          this.sTab = 'Transferred';
        })
        break;
      case 3:
        this.tickets.subscribe(t => {
          this.sTkts = t.filter(x => x['DeptID'] == this.sDept.DeptID && x.UserID == '1');
          this.sTab = 'Vip';
        })
        break;
      default:
        break;
    }
  }

  updateQ(action: string) {

    switch (action) {
      case 'NEXT':

        if (this.sTab == 'All') {
          this.sTk = this.sTkts.find(x => x.QStatus == 'Waiting');
          if (this.sTk) {
            this.sTk.ProvUserID = this.currentUser.uID;
            this.sTk.QStatus = 'Current';
            this.sTk.ProvWindow = this.currentUser.uWD;
            this.sTk.CallCount = 1;
            this.sTk.QCurrent = true;
            this.sTk.Qtask = action;
            if (this.getLastCurQ()) this.sTk.lastCurQ = this.getLastCurQ().QID;// Get Last Current Q tt Not Served if any
            this.getFirstPend();// Get First Pending Q to Change Status into Not Attended
            this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe();
          } else {
            this.sTk = new Ticket();
            swal('Next Q', "There's No Waiting Q in the List ", 'info');
          }
        }
        if (this.sTab == 'Transferred') {
          this.sTk = this.sTkts.find(x => (x.QTransfer == true && x.QStatus == 'Transferred'));
          if (this.sTk) {
            this.sTk.ProvUserID = this.currentUser.uID;
            this.sTk.QStatus = 'Current';
            this.sTk.ProvWindow = this.currentUser.uWD;
            this.sTk.CallCount = 1;            
            this.sTk.QCurrent = true;
            this.sTk.Qtask = action;
            console.log(this.sTk)
            if (this.getLastCurQ()) this.sTk.lastCurQ = this.getLastCurQ().QID;// Get Last Current Q tt Not Served if any            
            this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe();
          } else {
            this.sTk = new Ticket();
            swal('Next Q', "There's No Waiting Trans Q in the List ", 'info');
          }
        }
        break;
      case 'START':
        if (this.sTk) {
          if (this.checkQStatus()) {
            this.startTimer = true;
            this.sTk.ProvUserID = this.currentUser.uID;
            this.sTk.QStatus = 'Current';
            this.sTk.ProvWindow = this.currentUser.uWD;
            this.sTk.QCurrent = true;
            this.sTk.Qtask = 'START';
            this.start = true;
            this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe();
          }
          else {
            swal('Waiting Status', "Cannot Start Ticket till you Call Him First, you must click NEXT ", 'info');
          }
        }
        break;
      case 'STOP':
        if (this.start) {
          this.startTimer = false;
          this.sTk.QStatus = 'Served';
          this.sTk.QCurrent = false;
          this.sTk.Qtask = 'STOP';
          this.start = false;
          this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe(res => this.sTk = new Ticket());
        }
        break;
      case 'HOLD':
        if (this.start) {
          this.startTimer = false;
          this.sTk.QStatus = 'Hold';
          this.sTk.QCurrent = false;
          this.sTk.Qtask = 'HOLD';
          this.start = false;
          this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe(res => this.sTk = new Ticket());
        }
        break;
      case 'RESUMEQ':
        if (this.sTk) {
          this.startTimer = true;
          this.sTk.QStatus = 'Hold';
          this.sTk.QCurrent = true;
          this.sTk.Qtask = 'RESUMEQ';
          this.sTk.ProvUserID = this.currentUser.uID;
          this.start = true;
          this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe();
        }
        break;
      case 'PAUSEQ':
        if (this.start) {
          this.startTimer = false;
          this.sTk.QStatus = 'Hold';
          this.sTk.QCurrent = false;
          this.sTk.Qtask = 'ENDQ';
          this.sTk.ProvUserID = this.currentUser.uID;
          this.start = false;
          this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe(res => this.sTk = new Ticket());
        }
        break;
      case 'STOPQ':
        if (this.start) {
          this.startTimer = false;
          this.sTk.QStatus = 'Served';
          this.sTk.QCurrent = false;
          this.sTk.Qtask = 'ENDQ';
          this.sTk.ProvUserID = this.currentUser.uID;
          this.start = false;
          this.srvTkts.updateTicket(this.sTk.QID, this.sTk).subscribe(res => this.sTk = new Ticket());
        }
        break;
    }
  }

  checkQStatus() {
    if ((this.sTk.QStatus == 'Current' && this.sTk.ProvUserID == this.currentUser.uID) || this.sTk.QStatus == 'Pending')
      return true;
    return false;
  }
  checkIdleQ(q) {
    if (this.sTkts.find(x => x.QStatus == 'Waiting').ServiceNo.split('-')[0] < q)
      return true;
    return false;
  }
  getLastCurQ() {
    return this.sTkts.find(x => x.QStatus == 'Current' && x.ProvUserID == this.currentUser.uID && x.DeptID == this.sDept.DeptID);
  }
  getFirstPend() {
    let pend, curr, revTkts: any[];

    pend = this.sTkts.findIndex(x => x.QStatus == 'Pending' && x.DeptID == this.sDept.DeptID) // Return first Pending Index
    curr = this.sTkts.findIndex(x => x.QStatus == 'Current' && x.DeptID == this.sDept.DeptID)  // Return first Current Index    
    console.log(pend, curr)
    if (pend > -1) {
      if (curr > (pend + this.maxPend)) {
        this.sTk.FirstPendQ = this.sTkts[pend].QID;
      }
    }
  }
  callQ() {
    this.sTk.CallCount += 1;
    this.srvTkts.updateQCount(this.sTk).subscribe();
  }
  onQSelect(ticket) {
    if (!this.start)
      this.sTk = ticket;
  }
  onDeptSelect(dept) {
    this.sDept = dept;
    this.sTk = new Ticket();
    this.initQueueList(this.sDept.DeptID.toString());
  }

  open(content) {
    this.srvTkts.checkTransQ(this.sTk.QID)
      .subscribe(res => {
        if (!res.OQTransferred) {
          this.sTk.NQTransferredBy = this.currentUser.uName;
          this.sTk.OQTransferredBy = this.currentUser.uName;
          this.sTk.NQTransferredFrom = this.sDept.DeptName;
          this.sTk.OQTransferredTo = "";
          this.sTk.Services = [];

          this.modalService.open(content);
        } else {
          swal("Transfer Q", "This Q Already Transferred before , You cannot transfer Same Q more than Once !", "error")
        }
      })
  }
}
