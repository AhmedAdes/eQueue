var express = require("express");
var router = express.Router();
var sql = require("mssql");
var jwt = require("jsonwebtoken");
var sqlcon = sql.globalPool;


var firebase = require("firebase");
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBEzZp-q-FDr6NipFRU3IHAJ0X0Ul9zNHY",
  authDomain: "equeueing-5acb7.firebaseapp.com",
  databaseURL: "https://equeueing-5acb7.firebaseio.com",
  projectId: "equeueing-5acb7",
  storageBucket: "equeueing-5acb7.appspot.com",
  messagingSenderId: "904716700018"
};
firebase.initializeApp(config);
var database = firebase.database();


router.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers["authorization"];
  var secret = req.body.salt || req.query.salt || req.headers["salt"];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: "Failed to authenticate token."
        });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: "No token provided."
    });
  }
});

router.get("/ActiveTickets/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM vwActiveTickets WHERE UserID = ${req.params.id};
            SELECT * FROM vwActiveTicketsServices WHERE UserID = ${req.params.id};`)
    .then(function (ret) {
      let Que = ret.recordsets[0]
      let Srv = ret.recordsets[1]
      Que.forEach(q => {
        q.Services = Srv.filter(s => s.QID == q.QID)
      })
      res.json(Que);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/TicketDetails/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`
    SELECT q.QID ,q.UserID ,q.BranchID ,q.DeptID ,q.ServiceNo ,q.RequestDate ,q.VisitDate ,
          q.VisitTime ,q.StartServeDT ,q.EndServeDT ,q.QStatus ,q.ServingTime ,q.QCurrent ,
          q.QTransfer ,q.TransferedFrom ,q.UniqueNo ,q.ProvUserID ,b.BranchName, b.BranchAddress,
          c.CompName, c.WorkField, d.DeptName 
    FROM dbo.vwAllQueue q 
    JOIN dbo.Branch b ON b.BranchID = q.BranchID 
    JOIN dbo.Company c ON c.CompID = b.CompID 
    JOIN dbo.CompDept d ON q.DeptID = d.DeptID
    WHERE q.QID = ${req.params.id};
    SELECT QID ,qd.ServID, s.ServName, s.ServTime ,ServCount ,Notes 
    FROM vwAllQueueDetails qd JOIN dbo.DeptServices s ON s.ServID = qd.ServID 
    WHERE QID = ${req.params.id};`)
    .then(function (ret) {
      let Que = ret.recordsets[0]
      let Srv = ret.recordsets[1]
      Que.forEach(q => {
        q.Services = Srv.filter(s => s.QID == q.QID)
      })
      res.json(Que);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
// Check if Ticket Already Transferred Before 
router.get("/CheckTransQ/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT ISNULL(OQTransferred,0) as OQTransferred FROM MainQueue WHERE QID = ${req.params.id};`)
    .then(function (ret) {
      res.json(ret.recordset[0]);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/TicketsHistory/:id/:vdate/:comp/:branc/:dept/:serv", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  // @UserID INT, @CompID INT, @BranchID INT, @DeptID INT, @VisitDate DATE
  request.input('UserID', req.params.id)
  request.input('CompID', req.params.comp == 'undefined' ? null : req.params.comp)
  request.input('BranchID', req.params.branc == 'undefined' ? null : req.params.branc)
  request.input('DeptID', req.params.dept == 'undefined' ? null : req.params.dept)
  request.input('ServID', req.params.serv == 'undefined' ? null : req.params.serv)
  request.input('VisitDate', req.params.vdate == 'undefined' ? null : req.params.vdate)
  request
    .execute(`SearchUserTickets`)
    .then(function (ret) {
      res.json(ret.recordset);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/SearchDetails/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT DISTINCT c.CompID, c.CompName 
    FROM dbo.vwAllQueue q JOIN dbo.Branch b ON b.BranchID = q.BranchID 
    JOIN dbo.Company c ON c.CompID = b.CompID WHERE UserID = ${req.params.id};
    SELECT DISTINCT b.CompID, q.BranchID, b.BranchName 
    FROM dbo.vwAllQueue q JOIN dbo.Branch b ON b.BranchID = q.BranchID WHERE UserID = ${req.params.id} ;
    SELECT DISTINCT q.BranchID, q.DeptID, d.DeptName 
    FROM dbo.vwAllQueue q JOIN dbo.CompDept d ON d.DeptID = q.DeptID WHERE UserID = ${req.params.id};
    SELECT DISTINCT s.DeptID, q.ServID, s.ServName 
    FROM dbo.vwAllQueueDetails q JOIN dbo.DeptServices s ON s.ServID = q.ServID
    WHERE q.QID IN (SELECT QID FROM dbo.vwAllQueue WHERE UserID = ${req.params.id});`)
    .then(function (ret) {
      res.json(ret.recordsets);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/SelectedTicket/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM vwDailyTickets  WHERE QID = ${req.params.id};
            SELECT * FROM vwDailyTicketsServices WHERE QID =  ${req.params.id};`)
    .then(function (ret) {
      res.json(ret.recordsets);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});

router.get("/HoldEvents/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT StartTime,EndTime FROM QueueHoldDetails WHERE QID = ${req.params.id};`)
    .then(function (ret) {
      res.json(ret.recordset);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
router.get("/getToday", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  res.json(new Date());
});
router.put("/updateQCount", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let tkt = req.body;
  console.log(tkt)
  firebase
    .database()
    .ref("MainQueue/" + tkt.BranchID + "/" + + tkt.QID)
    .update({
      CallCount: tkt.CallCount
    });
  res.json({
    res: 'done'
  })
})
router.post("/IssueNew", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let det = req.body.tckt

  let tvp = new sql.Table()
  tvp.columns.add('QID', sql.Int)
  tvp.columns.add('DeptID', sql.Int)
  tvp.columns.add('ServID', sql.Int)
  tvp.columns.add('ServCount', sql.Int)
  tvp.columns.add('Notes', sql.NVarChar)

  for (let i = 0; i < det.srvfrm.length; i++) {
    let r = det.srvfrm[i]
    if (r.checked) {
      tvp.rows.add(r.QID, det.dept, r.ServID, r.ServCount, r.Notes);
    }
  }

  // CompID int, DeptID INT, BranchID INT, UserID INT, VisitDate Date
  let request = new sql.Request(sqlcon);
  request.input("DeptID", det.dept);
  request.input("BranchID", det.branch);
  request.input("CompID", det.comp);
  request.input("UserID", det.user);
  request.input("VisitDate", det.vDate);
  request.input("QueueDetails", tvp);
  request
    .execute(`IssueTicket`)
    .then(function (ret) {
      let qid = ret.recordset[0].QID
      firebase
        .database()
        .ref("MainQueue/" + det.branch + '/' + qid)
        .set({
          QID: qid,
          VisitDate: det.vDate.split('T')[0],
          DeptID: det.dept,
          BranchID: det.branch,
          UserID: det.user,
          ServiceNo: ret.recordset[0].ServiceNo,
          UniqueNo: ret.recordset[0].UniqueNo,
          QStatus: 'Waiting',
          QTransfer: false
        })
      res.json(ret.recordset[0]);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    })
})
router.put("/CancelTicket/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let b = req.body.tkt;
  let request = new sql.Request(sqlcon);
  request.input('QID', req.params.id)
  request
    .execute(`CancelTicket`)
    .then(function (ret) {
      firebase
        .database()
        .ref("MainQueue/" + b.BranchID + '/' + req.params.id)
        .update({
          QStatus: 'Cancelled'
        })

      res.json({
        affected: ret.rowsAffected[0]
      });
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    });
});
//TODO: Change the path of firebase ref to the new structure of branchID/Qid
router.put("/updateTicket/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let ticket = req.body;
  let request = new sql.Request(sqlcon);

  request.input("QID", ticket.QID);
  request.input("QStatus", ticket.QStatus);
  request.input("QCurrent", ticket.QCurrent);
  request.input("QTransfer", ticket.QTransfer);
  request.input("ProvUserID", ticket.ProvUserID);
  request.input("FirstPendQ", ticket.FirstPendQ);
  request.input("Qtask", ticket.Qtask);

  request.execute("TicketUpdate")
    .then(function (ret) {
      switch (ticket.Qtask) {
        case 'NEXT':

          if (ticket.QTransfer == false) {
            firebase
              .database()
              .ref("MainQueue/" + ticket.BranchID + "/" + ticket.lastCurQ)
              .update({
                QStatus: 'Pending'
              });
            firebase
              .database()
              .ref("MainQueue/" + ticket.BranchID + "/" + ticket.QID)
              .update({
                QStatus: ticket.QStatus,
                ProvUserID: ticket.ProvUserID,
                ProvWindow: ticket.ProvWindow,
                CallCount: ticket.CallCount
              });
            firebase
              .database()
              .ref("MainQueue/" + ticket.BranchID + "/" + ticket.FirstPendQ)
              .update({
                QStatus: 'NotAttended'
              })
          } else {
            // firebase
            //   .database()
            //   .ref("MainQueue/" + ticket.BranchID + "/" + ticket.lastCurQ)
            //   .update({
            //     QStatus: 'NotAttended'
            //   });
            firebase
              .database()
              .ref("MainQueue/" + ticket.BranchID + "/" + ticket.QID)
              .update({
                QStatus: ticket.QStatus,
                ProvUserID: ticket.ProvUserID,
                ProvWindow: ticket.ProvWindow,
                CallCount: ticket.CallCount
              });
          };
          break;
        default:
          firebase
            .database()
            .ref("MainQueue/" + ticket.BranchID + "/" + ticket.QID)
            .update({
              QStatus: ticket.QStatus,
              ProvUserID: ticket.ProvUserID
            });
          break;
      }

      res.json(ret.recordset[0]);
    })
})
router.put("/transferTicket", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  let ticket = req.body;

  let tvp = new sql.Table()
  tvp.columns.add('QID', sql.Int)
  tvp.columns.add('DeptID', sql.Int)
  tvp.columns.add('ServID', sql.Int)
  tvp.columns.add('ServCount', sql.Int)
  tvp.columns.add('Notes', sql.NVarChar)

  for (let i = 0; i < ticket.Services.length; i++) {
    tvp.rows.add(
      ticket.QID, ticket.DeptID,
      ticket.Services[i].ServID, ticket.Services[i].ServCount,
      "");
  }
  let request = new sql.Request(sqlcon);

  request.input("QID", ticket.QID);
  request.input("DeptID", ticket.DeptID);
  request.input("NQTransferredFrom", ticket.NQTransferredFrom);
  request.input("NQTransferredBy", ticket.NQTransferredBy);
  request.input("OQTransferredBy", ticket.OQTransferredBy);
  request.input("OQTransferredTo", ticket.OQTransferredTo);
  request.input("QueueDetails", tvp);

  request.execute("QTransfer")
    .then(function (ret) {
      let qid = ret.recordset[0].QID
      firebase
        .database()
        .ref("MainQueue/" + ticket.BranchID + "/" +  qid)
        .set({
          QID: qid,
          VisitDate: ticket.VisitDate,
          DeptID: ticket.DeptID,
          BranchID: ticket.BranchID,
          UserID: ticket.UserID,
          ServiceNo: ticket.ServiceNo,
          UniqueNo: ticket.UniqueNo,
          QStatus: 'Transferred',
          QTransfer: true
        })
      res.json(ret.recordset[0]);
    })
    .catch(function (err) {
      res.json({
        error: err
      });
      console.log(err);
    })
})
module.exports = router;