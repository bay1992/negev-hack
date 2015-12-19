// Copyright 2015, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var fs = require("fs")
var express = require('express')
var twilio = require('twilio')
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var mes = require("./messenger")



/* setup twilio */

var TWILIO_NUMBER = "+14159658674"
var TWILIO_ACCOUNT_SID = ""
var TWILIO_AUTH_TOKEN = ""

var client = new twilio.RestClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


var sendMessages = function(ms) {
  var n = 0
  ms.forEach(function(m) {
    console.log("sending a twilio message to " + m.number)
    client.sms.messages.create({
        to: m.number,
        from: TWILIO_NUMBER,
        body: m.text
    }, function(error, message) {
        if (!error) {    
            console.log('Message sent on:');
            console.log(message.dateCreated);
            console.log("!!to: " + message.to)
        } else {
            console.log('!!Err: ' + JSON.stringify(error))
        }

        n++

        if (n === ms.length) {
          console.log("done with batch")
        }
    });  
  })
}

if (false) {
  sendMessages([{number: "+14154136926", text: "FUAK"}, {number: "+18327959744", text: "just testing brah"}])
}

/*
if (false) {
	console.log("sending a twilio message..")
	client.sms.messages.create({
	    to:'415-413-6926',
	    from: TWILIO_NUMBER,
	    body:'ahoy hoy! Testing Twilio and node.js'
	}, function(error, message) {
	    if (!error) {
	        console.log('Success! The SID for this SMS message is:');
	        console.log(message.sid);
	 
	        console.log('Message sent on:');
	        console.log(message.dateCreated);
	    } else {
	        console.log('Oops! There was an error.' + JSON.stringify(error))
	    }
	});	
}


if (false) {

  var fs = require("fs")
  var mes = require("./messenger")

  var wellFormattedNumbers = []

  var failures = []

  //var housemates =  [{name: "Dan", number: "415-413-6926"}]
  var housemates =  mes.normalizeHousemates(JSON.parse(fs.readFileSync("roommate_data.json")))

  //for (var i = 0; i < housemates.length; i++) {

  var n = 0

  housemates.forEach(function(h) {

    //var h = {name: housemates[i].name, number: housemates[i].number}

    console.log("sending a twilio message to " + h.name)
    client.sms.messages.create({
        to: h.number,
        from: TWILIO_NUMBER,
        body: "Hey " + h.name + ", the Negev Hackathon judging starts at 8:00PM! Come over for pizza and to see what we've build! #negevhackathon"
    }, function(error, message) {
        if (!error) {    
            console.log('Message sent on:');
            console.log(message.dateCreated);
            console.log("!!to: " + h.name + "|num: " + message.to)

            wellFormattedNumbers.push({name: h.name, number: message.to})
        } else {
            console.log('!!Err: ' + h.name + " " + JSON.stringify(error))
            failures.push({name: h.name, error: error})
        }

        n++

        if (n === housemates.length) {
          fs.writeFileSync("goodNumbers.json", JSON.stringify(wellFormattedNumbers))
          fs.writeFileSync("badNumbers.json", JSON.stringify(failures))
        }
    });     
  })

}
*/

/*
 == FIXTURE
*/
var housemates = mes.normalizeHousemates(JSON.parse(fs.readFileSync("./good_roommates.json")))



var newGuyName = "Kumarovski Thangudic"
var len = housemates.length
var newGuy = housemates.filter(function(h) {return h.name === newGuyName})[0]


var betaGroup = ["Zhao Xu", "Dan Octavian", "Haider Khan", "Steve Zelaznik", "Cory Brandli"]

function inSet(s, v) {
  return s.find(function(e) { return e === v})
}

// without the new guy
housemates = housemates.filter(function(h) {return h.name !== newGuyName && inSet(betaGroup, h.name)})

console.log(housemates)

newGuy.arrivalDate = new Date('December 17, 2015 03:24:00')

var current = housemates.slice(0, len - 1)

console.log(newGuy)

var welcome = new mes.Messenger(housemates)

var app = express()

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// [START hello_world]
// Say hello!
app.get('/', function(req, res) {
  res.status(200).send('Hello, pe matah s-o fut in gat!')
})


app.post("/msg", function(req, res) {
	console.log("receiving message " + JSON.stringify(req.params) + " " + JSON.stringify(req.body))

  var message = req.body
	//res.status(200).send('RESPONSE!')
      //Create TwiML response
  var twiml = new twilio.TwimlResponse()
  twiml.say("Hello you fucker")

  welcome.onMessage(message.From, message.Body, function(ms) {
    console.log("blasting messages")
    sendMessages(ms)
  })

/*
  client.sms.messages.create({
      to: message.From,
      from: TWILIO_NUMBER,
      body:'Fuck you too motherfucker'
  }, function(error, message) {
      if (!error) {
          console.log('Success! The SID for this SMS message is:');
          console.log(message.sid);
   
          console.log('Message sent on:');
          console.log(message.dateCreated);
      } else {
          console.log('Oops! There was an error.' + JSON.stringify(error))
      }
  })
*/

  res.writeHead(200, {'Content-Type': 'text/xml'})
  res.end(twiml.toString())
})

app.get("/newguy", function(req, res) {
  console.log("adding new guy") // kumar
  welcome.onNewHousemate(newGuy, function(ms) {
    sendMessages(ms)
  })

  res.writeHead(200, {'Content-Type': 'text'})
  res.end("wtf")
})
// [END hello_world]


// [START server]
// Start the server
var server = app.listen(process.env.PORT || 8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
// [END server]
