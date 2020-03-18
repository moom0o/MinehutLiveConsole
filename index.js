// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const unirest = require("unirest");
// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("views"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});
app.get("/login", (req, resp) => {
  let server = req.query.server
  var unirest = require("unirest");
  var req = unirest("POST", "https://api.minehut.com/users/login")
    .headers({
      "content-type": "application/json;charset=UTF-8"
    })
    .send(
      `{\"email\":\"${req.query.email}\",\"password\":\"${req.query.pass}\"}`
    )
    .end(function(res) {
      if (res.error) throw new Error(res.error);
      let id = JSON.parse(res.raw_body)._id;
      let token = JSON.parse(res.raw_body).token;
      let session = JSON.parse(res.raw_body).sessionId;
      var req = unirest(
        "GET",
        `https://api.minehut.com/servers/${
          JSON.parse(res.raw_body)._id
        }/all_data`
      )
        .headers({
          Authorization: JSON.parse(res.raw_body).token,
          "x-session-id": JSON.parse(res.raw_body).sessionId
        })
        .end(function(res) {
          if (res.error) throw new Error(res.error);
          var req = unirest(
            "GET",
            `https://api.minehut.com/servers/${id}/all_data`
          )
            .headers({
              Authorization: token,
              "x-session-id": session
            })
            .end(function(res) {
              if (res.error) throw new Error(res.error);
              Object.keys(JSON.parse(res.raw_body)).forEach(b => {
                if (JSON.parse(res.raw_body)[b].name.toLowerCase() === server.toLowerCase()) {
                  const request = unirest(
                    "GET",
                    `https://api.minehut.com/file/${JSON.parse(res.raw_body)[b]._id}/read//logs/latest.log`
                  )
                    .headers({
                      Authorization: token,
                      "x-session-id": session
                    })
                    .end(response => {
                      if (response.error) {
                        resp.send(response.error);
                      } else {
                        resp.send(
                          JSON.parse(response.raw_body).content.replace(/\n/g, "<br>")
                        );
                      }
                      //res.send(JSON.parse(response.raw_body));
                    });
                  return;
                }
              });
            });
        });
    });
});
app.get("/info", (req, res) => {
  const request = unirest(
    "GET",
    `https://api.minehut.com/file/5bfa31b58aefbe3654a9c1a4/read//logs/latest.log`
  )
    .headers({
      Authorization: req.query.authorization,
      "x-session-id": req.query.sessionid
    })
    .end(response => {
      if (response.error) {
        res.send(response.error);
      } else {
        res.send(JSON.parse(response.raw_body).content.replace(/\n/g, "<br>"));
      }
      //res.send(JSON.parse(response.raw_body));
    });
});
// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
