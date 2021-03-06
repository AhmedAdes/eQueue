var express = require("express");
var router = express.Router();
var sql = require("mssql");
var jwt = require("jsonwebtoken");
var sqlcon = sql.globalPool;

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
    .query(`SELECT * FROM dbo.DeptServices`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/:id(\\d+)", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.DeptServices Where ServID=${req.params.id}`)
    .then(function (recordset) { res.json(recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/DeptServs/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.DeptServices Where DeptID = ${req.params.id} AND Disabled=0`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/CompServs/:compId", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT ds.* FROM dbo.DeptServices ds join CompDept cd on cd.DeptID = ds.DeptID and cd.CompID = ${req.params.compId}`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});
router.get("/BranchServs/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`SELECT * FROM dbo.DeptServices s JOIN dbo.BranchDepts b ON b.DeptID = s.DeptID
            WHERE b.BranchID = ${req.params.id}`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});

router.post("/", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var srv = req.body;
  var request = new sql.Request(sqlcon);
  request.input("DeptID", srv.DeptID);
  request.input("ServName", srv.ServName);
  request.input("Disabled", srv.Disabled);

  request.execute("DeptServInsert").
    then(function (ret) {
      res.json(ret.recordset[0]);
    }).catch(function (err) {
      res.json({ error: err });
    })
});

router.put("/:id", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var srv = req.body;
  var request = new sql.Request(sqlcon);
  request.input("DeptID", srv.DeptID);
  request.input("ServID", srv.ServID);
  request.input("ServName", srv.ServName);
  request.input("Disabled", srv.Disabled);

  request.execute("DeptServUpdate").
    then(function (ret) {
      res.json(ret.recordset[0]);
    }).catch(function (err) {
      res.json({ error: err });
    })
});

router.delete("/:id",function(req,res,next){
  res.setHeader("Content-Type", "application/json");
  var request = new sql.Request(sqlcon);
  request
    .query(`DELETE from dbo.DeptServices where ServID = ${req.params.id}`)
    .then(function (ret) { res.json(ret.recordset); })
    .catch(function (err) {
      if (err) { res.json({ error: err }); console.log(err); }
    });
});

module.exports = router;