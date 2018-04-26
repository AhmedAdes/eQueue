import { Component, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { NgbDateStruct, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { FormArray } from '@angular/forms/src/model';

import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import {
  CompanyService, BranchService, DepartmentService, DeptServsService, TicketService,
  AuthenticationService
} from '../../../services'
import { Company, Branch, Department, CurrentUser, QueueService } from '../../../Models'
import * as hf from '../../helper.functions'

@Component({
  selector: 'app-issue-ticket',
  templateUrl: './issue-ticket.component.html',
  styleUrls: ['./issue-ticket.component.scss']
})
export class IssueTicketComponent implements OnInit {
  currentUser = this.auth.getUser()
  compList: Company[] = []
  branchList: Branch[] = []
  deptList: Department[] = []
  servList: QueueService[] = []
  tickets: Observable<any>
  fireDeptCustNo = 0
  fireCustNo: any[]

  selServ: any[]
  visitDate: string
  inFrm: FormGroup
  comp: AbstractControl
  branch: AbstractControl
  dept: AbstractControl
  vDate: AbstractControl
  modDate: AbstractControl
  user: AbstractControl
  srvfrm
  servNo: string
  uniqueNo: string
  waiting: number
  visitTime: string
  submitted = false
  showForm = true
  now = new Date()
  today: NgbDateStruct
  modelDate: NgbDateStruct

  constructor(private srvtkt: TicketService, private auth: AuthenticationService,
    private srvComp: CompanyService, private srvBrnc: BranchService,
    private srvDept: DepartmentService, private srvSrv: DeptServsService,
    private fb: FormBuilder, public db: AngularFireDatabase
  ) {
    this.inFrm = fb.group({
      'comp': ['', Validators.required],
      'branch': ['', Validators.required],
      'dept': ['', Validators.required],
      'modDate': ['', Validators.required],
      'srvfrm': fb.array([], Validators.required),
      'vDate': '',
      'user': ''
    })
    this.inFrm.controls['comp'].valueChanges.subscribe(val => this.OnCompChange(val))
    this.inFrm.controls['branch'].valueChanges.subscribe(val => this.OnBranchChange(val))
    this.inFrm.controls['dept'].valueChanges.subscribe(val => this.onDeptChange(val))
    this.inFrm.controls['modDate'].valueChanges.subscribe(val => this.observQueueList())

    this.comp = this.inFrm.get('comp')
    this.branch = this.inFrm.get('branch')
    this.dept = this.inFrm.get('dept')
    this.modDate = this.inFrm.get('modDate')
    this.vDate = this.inFrm.get('vDate')
    this.user = this.inFrm.get('user')
    this.srvfrm = this.inFrm.get('srvfrm')
    this.modDate.setValue(this.selectToday())
    this.vDate.setValue(this.now)
  }

  ngOnInit() {
    this.srvComp.getAllProviders().subscribe(c => {
      this.compList = c
      this.srvtkt.GetToday().subscribe(d => this.today = { year: new Date(d).getFullYear(), month: new Date(d).getMonth() + 1, day: new Date(d).getDate() }, err => hf.handleError(err))
    })
  }
  selectToday() {
    return { year: this.now.getFullYear(), month: this.now.getMonth() + 1, day: this.now.getDate() };
  }
  initService(s) {
    return this.fb.group({
      ServID: s.ServID,
      ServName: s.ServName,
      checked: s.checked,
      ServCount: s.ServCount,
      Notes: s.Notes
    })
  }
  addService(s) {
    (<FormArray>this.inFrm.controls['srvfrm']).push(this.initService(s))
  }
  subscribeChecked(i, val) {
    if (val == true) {
      (<FormGroup>(<FormArray>this.srvfrm).controls[i]).get('ServCount')
        .setValidators([Validators.required, Validators.min(1)])
    } else {
      (<FormGroup>(<FormArray>this.srvfrm).controls[i]).get('ServCount').clearValidators();
      (<FormGroup>(<FormArray>this.srvfrm).controls[i]).get('ServCount').reset(0);
    }
  }
  OnCompChange(val) {
    if (!val) { this.branchList = []; return }
    this.srvBrnc.getCompBranch(val).subscribe(br => {
      this.branchList = br
      this.branch.setValue(null)
      this.deptList = []
      this.servList = [];
      (<FormArray>this.srvfrm).controls = []
      // this.OnBranchChange(this.branchList[0].BranchID)
    })
  }
  OnBranchChange(val) {
    if (!val) { this.deptList = []; return }
    this.srvDept.getBranchDepts(val).subscribe(dp => {
      this.deptList = dp
      this.dept.setValue(null)
      this.servList = [];
      (<FormArray>this.srvfrm).controls = [];
      this.observQueueList()
      // this.onDeptChange(this.deptList[0].DeptID)
    })
  }
  onDeptChange(val) {
    if (!val) {
      this.servList = [];
      (<FormArray>this.srvfrm).controls = []
      return
    }
    this.observQueueList()
    this.srvSrv.getDeptServss(val).subscribe(sv => {
      this.servList = sv.map(v => {
        return {
          ServID: v.ServID, ServName: v.ServName,
          checked: false, ServCount: 0, Notes: ''
        }
      })
      if (this.srvfrm.controls.length > 0) (<FormArray>this.srvfrm).controls = []
      this.servList.forEach(s => this.addService(s))
    })
  }
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  HandleForm(formValue) {
    this.submitted = true;
    let selServs = this.srvfrm.controls.filter((s: FormGroup) => s.controls['checked'].value == true)
    if (selServs.length == 0) {
      hf.handleError('Please select Service from the List')
      return
    }
    if (!selServs.every((s: FormGroup) => s.controls['ServCount'].value > 0)) {
      hf.handleError('Please add a count for each selected Service')
      return
    }
    this.vDate.setValue(this.modDate.value ?
      new Date(Date.UTC(this.modDate.value.year, this.modDate.value.month - 1, this.modDate.value.day)) : null)
    this.user.setValue(this.currentUser.uID)

    if (this.inFrm.invalid) { console.log(this.inFrm); return }
    this.srvtkt.issueTicket(this.inFrm.value).subscribe(cols => {
      if (cols.error) {
        hf.handleError(cols.error); this.submitted = false; return
      }
      this.servNo = cols.ServiceNo
      this.uniqueNo = cols.UniqueNo
      this.waiting = cols.Waiting
      this.visitTime = hf.changeToServerTime(cols.VisitTime)
      this.showForm = false
    }, err => hf.handleError(err))
  }
  resetAll() {
    (<FormArray>this.srvfrm).controls = []
    this.inFrm.reset()
    this.modDate.setValue(this.selectToday())
    this.showForm = true
    // this.foc.first.nativeElement.focus()
    this.submitted = false
  }
  observQueueList() {
    if (!this.branch.value) {
      return
    }
    // this.db.list('MainQueue')
    this.tickets = this.db.list('MainQueue/' + this.branch.value)
      .valueChanges()
      .map(tks => {
        return tks.filter((tkt) => {
          let dd = new Date(Date.UTC(this.modDate.value.year, this.modDate.value.month - 1, this.modDate.value.day))

          if (tkt['VisitDate'] == hf.handleDate(dd)
            // && tkt['DeptID'] == this.dept.value
            && (['Waiting', 'Current', 'Hold', 'Pending'].findIndex(c => c == tkt['QStatus']) > -1)) {
            return true;
          } else {
            return false;
          }
        })
      })
    this.tickets.subscribe(t => {
      // console.log(t);
      let unique = t.map(obj => { return obj.DeptID });
      unique = unique.filter((x, i, a) => a.indexOf(x) === i);

      this.fireCustNo = unique.map(obj => {
        return {
          name: this.deptList.find(d => d.DeptID == obj).DeptName,
          value: t.filter(k => k.DeptID == obj).length,
          active: obj == this.dept.value
        }
      })
      this.fireDeptCustNo = this.fireCustNo.find(k => k.active == true).value -1
      // console.log(this.fireCustNo);
    })
  }
}
