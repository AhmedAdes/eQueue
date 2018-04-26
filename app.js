var express = require("express");
var http = require("http");
var path = require("path");
var compression = require("compression");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var favicon = require("serve-favicon");
var jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens

var sql = require("mssql");
var con = require("./SQLConfig.js");
const Connection = new sql.ConnectionPool(con.config);
//store the connection
sql.globalPool = Connection;
var app = express();

// all environments
app.set("port", 2525);

app.set("views", path.join(__dirname, "public/dist"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

app.use(cors());
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());

var stylus = require("stylus");
app.use(stylus.middleware(path.join(__dirname, "public/dist")));
app.use(express.static(path.join(__dirname, "public/dist")));

// development only
//if ('development' == app.get('env')) {
//    app.use(express.errorHandler());
//}

var index = require("./routes/index.js");
var login = require("./routes/login.js");
var user = require("./routes/users.js");
var comp = require("./routes/company.js");
var brnc = require("./routes/branch.js");
var dept = require("./routes/department.js");
var srvc = require("./routes/service.js");
var tckt = require("./routes/ticket.js");
var audio = require("./routes/audio.js");

app.use("/", index);
app.use("/api/auth", login);
app.use("/api/users", user);
app.use("/api/comp", comp);
app.use("/api/brnc", brnc);
app.use("/api/dept", dept);
app.use("/api/srvc", srvc);
app.use("/api/tckt", tckt);
app.use("/api/aud", audio);

let daycron = require('./scripts/dayCrons.js')
daycron.scdul.start()

Connection.connect(err => {
  if (err) {
    console.log("Failed to open a SQL Database connection.", err.stack);
  } else {
    http.createServer(app).listen(app.get("port"), function() {
      console.log("Express server listening on port " + app.get("port"));
    });
  }
});

Connection.on("error", function(err) {
  console.log("Sql Connection Error.", err);
});
