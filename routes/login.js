var express = require("express");
var router = express.Router();
var sql = require("mssql");
var jwt = require("jsonwebtoken");
var sqlcon = sql.globalPool;

router.post("/", function (req, res, next) {
  res.setHeader("Content-Type", "application/json");
  var user = req.body;
  var request = new sql.Request(sqlcon);
  request.input("LoginName", user.LoginName);
  request.input("UserPass", user.UserPass);
  request.execute("AuthenticateUser", function (err, ret) {
    if (err) {
      res.json({
        error: err
      });
      console.log(err);
    } else {
      if (ret.recordset[0].Error) {
        res.json({
          error: ret.recordset[0].Error
        });
        console.log(ret.recordset[0].Error);
      } else {
        const payload = {
          admin: ret.recordset[0].UserName
        };
        var token = jwt.sign(payload, ret.recordset[0].Salt, {
          expiresIn: 32006000, // expires in 86400 sec = 1440 min = 24 hours
          algorithm: 'HS384'
        });

        res.json({
          user: ret.recordset,
          tkn: token,
          salt: ret.recordset[0].Salt
        });
      }
    }
  });
});

module.exports = router;