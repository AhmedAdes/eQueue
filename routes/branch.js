var express = require("express");
var router = express.Router();
var sql = require("mssql");
var jwt = require("jsonwebtoken");
var sqlcon = sql.globalPool;
var cmof = require("../scripts/common.js");

router.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers["authorization"];
  var secret = req.body.salt || req.query.salt || req.headers["salt"];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return res.status(403).send({ success: false, message: "Failed to authenticate token." });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ success: false, message: "No token provided." });
  }
});

router.get("/", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.Branch`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/:id(\\d+)", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.Branch Where BranchID=${req.params.id}`)
    .then(function(ret) { res.json(ret.recordset); })
    .catch(function(err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/CompBranch/:id(\\d+)", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.Branch Where CompID = ${req.params.id}`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/GetCompBrnchs/:compId", function (req, res, next) {
  var branches = [];
  var departments = [];
  var branches_departments = [];
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`Select * from dbo.Branch where CompId = ${req.params.compId}`)
    .then(function (ret) {
      branches = ret.recordset;
      var request = new sql.Request(sqlcon);
      request.query(`Select bd.* ,cd.DeptName from dbo.BranchDepts bd join dbo.CompDept cd  on bd.DeptID = cd.DeptID and cd.CompID = ${req.params.compId}`)
        .then(function (ret) {
          departments = ret.recordset;
          for (var i = 0; i < branches.length; i++) {
            branches_departments.push(branches[i]);
            branches_departments[i].Departments = departments.filter(function (obj) {
              if (branches_departments[i].BranchID === obj.BranchID) {
                return true;
              }
            });
          }
          res.json(branches_departments);
        });
    })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});

router.get("/BrnchsDepts/:compId", function (req, res, next) {

  let branches = [];

  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);

  request.input("CompID", req.params.compId);
  request
    .execute(`BrnchUsersSelect`)
    .then(function (ret) {

      branches =
        ret.recordset.map(obj => {
          return obj.BranchID
        })

      branches = branches.filter((x, i, a) => a.indexOf(x) === i);

      branches = branches.map(b => {
        return {
          BranchID: b,
          BranchName: ret.recordset.find(c => c.BranchID == b).BranchName,
          Departments: cmof.removeDuplicates(
            ret.recordset.filter(obj => obj.bdBranchID == b).map(d => {
              return {
                DeptID: d.bdDeptID,
                DeptName: d.DeptName
              }
            })
            , "DeptID"
          ),
          Users: cmof.removeDuplicates(
            ret.recordset.filter(obj => obj.uBranchID == b).map(u => {
              return {
                UserID: u.UserID,
                CompID: u.CompID,
                BranchID: b,
                ManagerID: u.ManagerID,
                UserName: u.UserName,
                UserRole: u.UserRole,
                Phone: u.Phone,
                Mobile: u.Mobile,
                Email: u.Email,
                Title: u.Title,
                Disabled: u.Disabled,
                Departments: ret.recordset.filter(obj => obj.UserID == u.UserID && obj.uDeptID).map(ud => {

                  return {
                    DeptID: ud.uDeptID,
                    DeptName: ret.recordset.find(d => d.bdDeptID == ud.uDeptID).DeptName
                  }

                })
              }
            })
            , "UserID"
          )
        }
      })
      res.json(
        branches
      );

    })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});

router.post("/", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var branch = req.body;
  
  var tvp = new sql.Table();
  
  tvp.columns.add('BranchID', sql.INT);
  tvp.columns.add('DeptID', sql.INT);
  
  for (var i = 0; i < branch.Departments.length; i++) {
    var branchID = 0;
    var deptID = branch.Departments[i].DeptID;
    tvp.rows.add(branchID, deptID);
  }
  var request = new sql.Request(sqlcon);
  request.input("CompID", branch.CompID);
  request.input("BranchName", branch.BranchName);
  request.input("Country", branch.Country);
  request.input("City", branch.City);
  request.input("BranchAddress", branch.BranchAddress);
  request.input("Phone", branch.Phone);
  request.input("Mobile", branch.Mobile);
  request.input("Email", branch.Email);
  request.input("Fax", branch.Fax);
  request.input("Disabled", branch.Disabled);
  request.input("DefaultLang", branch.DefaultLang);
  request.input("AudioLang", branch.AudioLang);
  request.input("BranchDepts", tvp);
  request.execute("BrnchDeptInsert").
    then(function (ret) {
      res.json(ret.recordset[0].BrnchID);
    })
    .catch(function (err) {
      res.json({ error: err });
    })
});
router.put("/:BranchID", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var branch = req.body;
  console.log(branch)
  var tvp = new sql.Table();
  tvp.columns.add('BranchID', sql.INT);
  tvp.columns.add('DeptID', sql.INT);
  for (var i = 0; i < branch.Departments.length; i++) {
    var branchID = 0;
    var deptID = branch.Departments[i].DeptID;
    tvp.rows.add(branch, deptID);
  }
  var request = new sql.Request(sqlcon);
  request.input("BranchID", branch.BranchID);
  request.input("CompID", branch.CompID);
  request.input("BranchName", branch.BranchName);
  request.input("Country", branch.Country);
  request.input("City", branch.City);
  request.input("BranchAddress", branch.BranchAddress);
  request.input("Phone", branch.Phone);
  request.input("Mobile", branch.Mobile);
  request.input("Email", branch.Email);
  request.input("Fax", branch.Fax);
  request.input("Disabled", branch.Disabled);
  request.input("DefaultLang", branch.DefaultLang);
  request.input("AudioLang", branch.AudioLang);
  request.input("BranchDepts", tvp);
  request.execute("BrnchDeptUpdate").
    then(function (ret) {
      res.json(ret.recordset[0].BrnchID);
    })
    .catch(function (err) {
      res.json({ error: err });
    })
});
module.exports = router;