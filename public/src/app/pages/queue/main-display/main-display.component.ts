import { Component, OnInit, animate, OnChanges } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { ISubscription, Subscription } from 'rxjs/Subscription';

import * as hf from '../../helper.functions'
import { DepartmentService, AuthenticationService, TicketService } from 'app/services';
import { Ticket, CurrentUser } from 'app/Models';
import swal from 'sweetalert2';
import { AudioService } from 'app/services/audio.service';
import { setInterval, setTimeout } from 'core-js/library/web/timers';

@Component({
  selector: 'main-display',
  templateUrl: './main-display.component.html',
  styleUrls: ['./main-display.component.scss']
})

export class MainDisplayComponent implements OnInit {
  audioUrl = '../../../../assets/audio/';
  tickets: Observable<any>
  currentUser = this.srvAuth.getUser()
  departments = [];
  curTickets = [];
  curPlayTickets;
  playedTickets = [];
  audFiles = [];
  date = new Date();
  audio = new Audio()
  audioContx = new AudioContext();
  constructor(public db: AngularFireDatabase, private srvAuth: AuthenticationService,
    private srvDept: DepartmentService, private srvTkt: TicketService, private srvAud: AudioService) {
    this.observQueueList();
  }

  ngOnInit() {
    this.srvDept.getBranchDepts(this.currentUser.bID)
      .subscribe(res => {
        this.departments = res;

        this.tickets.subscribe(data => {
          this.curTickets = data.filter(x => (x.QStatus == 'Current') && (this.playedTickets.findIndex(s => s.QID == x.QID) == -1 ||
            this.playedTickets.findIndex(s => s.QID == x.QID && s.CallCount != x.CallCount) > -1));

          this.departments.map(d => {
            d.tickets = data.filter(x => x.QStatus == 'Current' && x.DeptID == d.DeptID);
          })
          // setInterval(() => {
          //   console.log('loza' + this.curTickets.length + this.audReady)            
          //   
          // }, 1000)
        })
      })
    setInterval(() => {
      if (this.curTickets.length)
        //console.log(this.curTickets)
        this.startPlay();
    }, 2000)
  }
  startPlay() {
    if (this.curTickets.length > 0 && this.audio.paused) {
      if (this.curTickets.length == 0) {
        return;
      }
      //      this.curTickets[0].ServiceNo = "0412-D"
      this.srvAud.playAud({ ticket: [this.curTickets[0]], audioLang: this.currentUser.uAL }).subscribe(res => {
        let curServ = this.curTickets.shift()
        let url = URL.createObjectURL(res.blob());

        this.audio.src = url;
        this.audio.play().then(() => {
          if (curServ != undefined) {
            let index = this.playedTickets.findIndex(f => f.QID == curServ.QID)
            if (index == -1) {
              this.playedTickets.push(curServ)
            } else {
              this.playedTickets.fill(curServ, index, index + 1)
            }
          }
        })
        this.audio.addEventListener('ended', function () {
          this.pause();
        }, true)
      })
    }
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
  async playURLAudio(url) {
    this.audio.src = url;
    this.audio.play();
    this.audio.addEventListener('ended', function () {
      let playAud = this.play();
      if (playAud !== undefined) {
        playAud.then(_ => {
          this.pause();
          console.log(this.paused)
        })
      }
    }, true)
  }

  async playAudio(ServiceNos: string[]) {
    let paths = this.playQAud(ServiceNos)
    let i = 0;

    let audUrl = this.audioUrl
    console.log(ServiceNos)

    this.audio.src = audUrl + paths[0];
    this.audio.play();

    this.audio.addEventListener('ended', function () {
      i = ++i < paths.length ? i : 0;
      this.src = audUrl + paths[i];
      let playAud = this.play();
      if (playAud !== undefined) {
        playAud.then(_ => {
          if (i == 0) {
            this.pause();
          }
        })
      }
    }, true)
  }

  playQAud(ServiceNos: string[]) {
    let qNum: number;
    let paths = [];

    for (let i = 0; i < ServiceNos.length; i++) {
      qNum = parseInt(ServiceNos[i]['ServiceNo'].substr(0, 4));
      if (qNum < 20) {
        paths.push(qNum + '.wav');
      }
      else if (qNum > 20 && qNum < 100) {
        if (qNum.toString().substr(1, 1) == '0')
          paths.push(qNum + '.wav');
        else {
          paths.push(qNum.toString().substr(1, 1) + '.wav');
          paths.push('and.wav');
          paths.push(qNum.toString().substr(0, 1) + '0' + '.wav');
        }
      }
    }
    return paths;
  }
} 