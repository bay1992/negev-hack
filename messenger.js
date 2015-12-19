
/*

assumptions:

only 1 new housemate at any given time

new roommate -> output messages

message received -> (message reply + other messages to send, events scheduled)

can have the concept of events but fuck it for now (event is a scheduled action meant to fire off in the future)

to handle things such as after we posted his data, he gets greeted for 4 hours and the question about who wants to help him comes in

i'm going to do it based on number of greetings.

*/

/*
house mate stages: 

GREETING -> MOVEIN ->  PIZZANIGHT
*/
var GREETING = "g"
var MOVEIN = "m"
var MOVEIN_CONFIRM = "c"
var PIZZANIGHT_QUERY = "q"
var PIZZANIGHT_ANNOUNCE = "a"

/*
 == CONSTANTS ==
*/

var PIZZA_GROUP_SIZE = 2


/* messenger class */
function Messenger(housemates) {
	this.housemates = housemates
}

/*
 number -> text -> [Message]
*/
Messenger.prototype.onMessage = function(senderNumber, text, callback) {
  var sender = this.housemates.filter(function (h) {return h.number === senderNumber})[0]
  var newHousemate = this.newHousemate


  //console.log("SENDER " + sender.name)
  var cb = callback

  var callback = function() {
    setImmediate(cb, arguments[0])
  }

  var newHousemateReply = undefined
  if (newHousemate.housemate.number === senderNumber) {
    newHousemateReply = text
  }

  if (!sender && !newHousemateReply) {
    console.log("fuck up!")
    callback(undefined, new Error("unknown sender " + senderNumber))
  }

  switch (newHousemate.stage.name) {
    case GREETING:

      var messages = []
      newHousemate.stage.data.greetCount += 1

      // forward  reply
      messages.push(Message(newHousemate.housemate.number, newGuyReply(sender.name,text)))


      if (newHousemate.stage.data.greetCount >= 2) {
        newHousemate.stage = Stage(MOVEIN, {})

        /* call for help */
        this.housemates.forEach(function(h) {
          messages.push(Message(h.number, welcomeHelpMessage(newHousemate.housemate)))          
        })
      }

      callback(messages)
      break;
    case MOVEIN:
      console.log(sender.name  + " volunteered to help.")
      newHousemate.stage = Stage(MOVEIN_CONFIRM, {})

      callback([Message(newHousemate.housemate.number, helpOfferMessage(sender))])
      break;
    case MOVEIN_CONFIRM:
      var cleanReply = newHousemateReply.trim().toLowerCase()

      var messages = []
      switch (cleanReply) {
        case "yes":
          // ASS: it's always pizza
          var proposition = "pizza"
          // ASS: it's always those days
          var days = ["Wednesday", "Friday"]
          messages.push(Message(newHousemate.housemate.number, pizzaOfferMessage(newHousemate.housemate, proposition, days)))

          newHousemate.stage = Stage(PIZZANIGHT_QUERY, {
            offeredDays: days,
            proposition: proposition
          })

          break;
        case "no":
          messages.push(Message(newHousemate.housemate.number, moveInCancelReply(newHousemate.housemate)))
          break;
      }
      callback(messages)

      break;
    case PIZZANIGHT_QUERY:

      var cleanReply = newHousemateReply.trim().toLowerCase()
      var chosenDay = newHousemate.stage.data.offeredDays.find(function(d) {return d.trim().toLowerCase() === cleanReply})
      if (!chosenDay) {
        console.log("he fucked it up chose weird day. " + cleanReply)
      }

      var proposition = newHousemate.stage.data.proposition

      var messages = []
      this.housemates.forEach(function(h) {
          messages.push(Message(h.number, pizzaAnnounceMessage(newHousemate.housemate, proposition, chosenDay)))          
      })

      newHousemate.stage = Stage(PIZZANIGHT_ANNOUNCE, {
        joining: [], // list of people joining
        proposition: newHousemate.stage.data.proposition
      })

      callback(messages)
      break;

    case PIZZANIGHT_ANNOUNCE:
      console.log(sender.name + " is joining the party!")

      var joining = newHousemate.stage.data.joining 
      joining.push(sender)

      if (joining.length >= PIZZA_GROUP_SIZE) {
        // we got em
        var messages = []

        messages.push(Message(newHousemate.housemate.number, newGuyPizzaFinalMsg(newHousemate.housemate, joining, newHousemate.stage.data.proposition)))

        var all = joining.concat(newHousemate.housemate) 
        all.forEach(function(h) {
            var FINAL_MESSAGE_DELAY = 20
            messages.push(Message(h.number, exactPizzaMsg(), FINAL_MESSAGE_DELAY))          
        })

        callback(messages)
      } else {
        console.log("not done yet..")
        callback([])
      }
      break;
  }
}


/*
 housemate -> [Message]
*/
Messenger.prototype.onNewHousemate = function(housemate, callback) {

  /* ASS only 1 roommmate at any given time */
	this.newHousemate = {
		housemate: housemate,
		stage: Stage(GREETING, {greetCount: 0})
	}

  var out = this.housemates.map(function(h) {
    return Message(h.number, newGuyMessage(housemate))
  })
  setImmediate(function() {callback(out)})
}

/*
== TYPES ==
*/


function Stage(name, data) {
	return {
		name: name,
    data: data
	}
}


/*
 has an optional delay in seconds
*/
function Message(number, text, delay) { return {number: number, text: text, delay: delay} }

/*
social media is {"linkedin": "http://..."}
*/
function Housemate(name, bio, number) {
	return {
		name: name,
		bio: bio,
		number: number
	}
}

/*
== MESSAGE TEMPLATES ==
*/

function newGuyMessage(housemate) {
  return housemate.name + " has moved in. " + housemate.bio + " reply with a welcome message."
}

function newGuyReply(sender, reply) {
  return sender + " sent you a message: " + reply
}

function welcomeHelpMessage(housemate) {
  return "Would anyone like to help welcome " +  housemate.name + "  on the day he moves in at " + housemate.arrivalDate + "?"
}

function helpOfferMessage(housemate) {
  return "Housemate " + housemate.name + " will help you move in on that day. Ph: " + housemate.number + ". Feel free to text him. Reply Yes to confirm."
}

function pizzaOfferMessage(housemate, proposition, days) {
  return "Hey we want to throw a welcome " + proposition + " night with you. Are you free " + niceList(days, " or ") + " night?"
}

function moveInCancelReply(housemate) {
  return "Ok, " + housemate.name + " we'll get in touch to figure out another move in date."
}

function pizzaAnnounceMessage(housemate, proposition, day, groupSize) {
  return "We’re throwing free " + proposition + " for " + groupSize + " people who reply yes on " + day +  " night. Reply yes if you want in. First come first serve. ;)"
}

function newGuyPizzaFinalMsg(housemate, joining, proposition) {
  // ASS: it's the negev

  var joiningNames = joining.map(function (joining) {return joining.name})
  return "The following housemates will be welcoming you: " + niceList(joiningNames, " and ") + " :) Look forward to an epic night of " + proposition + ". Welcome to the Negev."
}

function exactPizzaMsg() {
  return "Alright folks, you’re on for an epic night. Show up to the negev 6th street lobby at 8pm. You’ll leave by uber at 8:15pm. Be there or be square. - Danny Haber" 
}
 

function niceList(a, endWord) {
  var len = a.length
  return a.slice(0, len - 1).join(", ") + endWord + a[len - 1] 
}

function normalizeHousemates(housemates) {
  return housemates.map(function(h) {

    // TODO: pretiffy BIO
    var bio = ""

    if (h.profile) {
      for (var k in h.profile) {
        bio += k + ": " + h.profile[k] + "\n"
      }
    }
    return Housemate(h.name, bio, h.phone)
  })
  .filter(function(h) {return h.number !== ""})
}

exports.Messenger = Messenger

exports.normalizeHousemates = normalizeHousemates


/* sample message
{"ToCountry":"US","ToState":"CA","SmsMessageSid":"SMcc1493ec10fc6c88ebdf46b7df1df1fd","NumMedia":"0","ToCity":"CORTE MADERA","FromZip":"94925","SmsSid":"SMcc1493ec10fc6c88ebdf46b7df1df1fd","FromState":"CA","SmsStatus":"received","FromCity":"CORTE MADERA","Body":" Fight high","FromCountry":"US","To":"+14159658674","ToZip":"94957","NumSegments":"1","MessageSid":"SMcc1493ec10fc6c88ebdf46b7df1df1fd","AccountSid":"AC6274de57e84d693b5fe89ff0851f459f","From":"+14154136926","ApiVersion":"2010-04-01"}
 */
