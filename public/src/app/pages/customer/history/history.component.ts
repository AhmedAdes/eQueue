import { Component, OnInit } from '@angular/core';
import { CurrentUser, Ticket, Company, Department, Service, Branch } from 'app/Models';
import * as hf from '../../helper.functions'
import { TicketService, AuthenticationService } from 'app/services';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  currentUser: CurrentUser = this.auth.getUser()
  chkDate = true
  chkComp = false
  chkBrnc = false
  chkDept = false
  chkServ = false
  selFDate: string
  selTDate: string
  selComp: number
  selDept: number
  selBrnc: number
  selServ: number
  allList: any[]
  compList: Company[] = []
  brncList: Branch[] = []
  deptList: Department[] = []
  servList: Service[] = []
  ticketList: Ticket[] = []
  tModel = new Ticket()
  showDetails = false
  
  constructor(private srvTkt: TicketService, private auth: AuthenticationService) { }

  ngOnInit() {
    this.selFDate = hf.handleDate(new Date())
    this.selTDate = hf.handleDate(new Date())
    this.srvTkt.getUserSrchDetails(this.currentUser.uID).subscribe(cols => {
      this.allList = cols
      this.compList = cols[0]
      this.brncList = cols[1]
      this.deptList = cols[2]
      this.servList = cols[3]
    })
    this.ViewReport()
  }
  ViewReport() {
    if(!this.chkDate && !this.chkComp && ! this.chkBrnc && !this.chkDept && !this.chkServ){
      hf.handleError('Please Select a Filter By Field')
      return
    }
    this.srvTkt.getTicketHistory(
      this.chkDate ? this.selFDate : undefined,
      this.chkDate ? this.selTDate : undefined,
      this.chkComp ? this.selComp : undefined,
      this.chkBrnc ? this.selBrnc : undefined,
      this.chkDept ? this.selDept : undefined,
      this.chkServ ? this.selServ : undefined,
      this.currentUser.uID).subscribe(t => {
        if (t.error) {
          hf.handleError(t.error)
          this.ticketList = []
          return
        }
        this.ticketList = t
        const element = document.querySelector('#results')
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
          }, 300)
        }
      }, err => hf.handleError(err))
  }
  onCompChange(val) {
    if (val) {
      this.brncList = this.allList[1].filter(b => b.CompID == val)
    }
  }
  onCompCheck(chk) {
    if (!chk) {
      this.brncList = this.allList[1]
      this.selComp = undefined
    }
  }
  onBranchChange(val) {
    if (val) {
      this.deptList = this.allList[2].filter(d => d.BranchID == val)
    }
  }
  onBranchCheck(chk) {
    if (!chk) {
      this.deptList = this.allList[2]
      this.selBrnc = undefined
    }
  }
  onDeptChange(val) {
    if (val) {
      this.servList = this.allList[3].filter(s => s.DeptID == val)
    }
  }
  onDeptCheck(chk) {
    if (!chk) {
      this.servList = this.allList[3]
      this.selDept = undefined
    }
  }
  getTicketDetials(t: Ticket) {
    this.srvTkt.getTicketDetails(t.QID).subscribe(td => {
      if (td.error) { hf.handleError(td.error); return }
      this.tModel = td[0]
      this.showDetails = true
    }, err => hf.handleError(err))
  }
  Back() {
    this.showDetails = false
  }
}
