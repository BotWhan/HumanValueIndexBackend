var http = require('http');
var url = require('url');
var fs = require('fs');

function search(id, profiles) {
  var idx = profiles.length;
  while (idx--) {
    if (profiles[idx] === id) {
      return idx;
    }
  }
  return false;
}
function writeProfiles(data) {
  console.log("added");
  fs.writeFile('C:\\jsFilesForNode\\playerRatings.json', JSON.stringify(data), function (err) {
    if (err) throw err;
    fs.readFile('C:\\jsFilesForNode\\updateIndex.txt', 'utf8', (err, indexedNum) => {
      if (err) throw err;
      fs.writeFile('C:\\jsFilesForNode\\updateIndex.txt', String((Number(indexedNum) + 1)), function (err) {
        if (err) throw err;
      });
    })
  });
}
http.createServer(function (req, res) {

  if (req.url != '/favicon.ico' && typeof url.parse(req.url, true).query.case != 'undefined') {
    console.log(url.parse(req.url, true).query);
    const d = new Date();
    console.log(d.getDate() + ":" + d.getHours() + ": " + d.getMinutes());

    var URLquery = url.parse(req.url, true).query;

    fs.readFile('C:\\jsFilesForNode\\playerRatings.json', 'utf8', (err, profiles) => {
      if (err) throw err;
      fs.readFile('C:\\jsFilesForNode\\trusted.json', 'utf8', (err, trustedIdArray) => {
        var profilesJson = JSON.parse(profiles);
        var profileKeys = Object.keys(profilesJson)
        var result = search(URLquery.uberid, profileKeys);
        switch (URLquery.case) {
          case '0':
            //get name
            res.writeHead(200, { 'Content-Type': 'text/json' });
            if (typeof result == "boolean") {
              res.write(JSON.stringify({
                "name": "not registered",
                "rating": "not registered",
                "auth": (typeof search(URLquery.authentication, JSON.parse(trustedIdArray)) != "boolean")
              }))
            }
            else {
              res.write(JSON.stringify({
                "name": profilesJson[profileKeys[result]].Names[0],
                "rating": profilesJson[profileKeys[result]].Rating[0],
                "auth": (typeof search(URLquery.authentication, JSON.parse(trustedIdArray)) != "boolean")
              }));
            }
            res.end();
            break;

          case '1':
            // edit profile
            if (err) throw err;
            if (typeof search(URLquery.authentication, JSON.parse(trustedIdArray)) != "boolean" &&
              typeof URLquery.uberid != 'undefined' &&
              typeof URLquery.rating != 'undefined' &&
              typeof URLquery.name != 'undefined') {

              //existing profile
              if (typeof result != "boolean") {
                if (profilesJson[profileKeys[result]].Rating[0] != URLquery.rating) {
                  console.log("updating");
                  profilesJson[profileKeys[result]].Rating.unshift(URLquery.rating)

                  writeProfiles(profilesJson);
                }
              }
              //new profile
              else if (typeof result == "boolean") {
                console.log("creating new");
                var newprofile = { [URLquery.uberid]: { Names: [URLquery.name], Rating: [URLquery.rating] } };
                console.log(newprofile);
                writeProfiles(Object.assign(newprofile, profilesJson));
              }
            }
            res.end();

            break;
          case '3':
            //get auth
            res.writeHead(200, { 'Content-Type': 'text/json' });
            fs.readFile('C:\\jsFilesForNode\\trusted.json', 'utf8', (err, trustedIdArray) => {
              if (err) throw err;
              console.log("asd")
              res.write((typeof search(URLquery.authentication, JSON.parse(trustedIdArray)) == "boolean") ? "false" : "true");
              res.end();
            })
            break;
        }
      })
    })
  }
  else {
    fs.readFile('C:\\jsFilesForNode\\updateIndex.txt', 'utf8', (err, indexedNum) => {
      if (err) throw err;
      res.write(indexedNum);
      res.end();
    })
  }
}).listen(11280, "0.0.0.0");