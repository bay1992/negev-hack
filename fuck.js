var fs = require("fs")
var mes = require("./messenger")

var housemates = mes.normalizeHousemates(JSON.parse(fs.readFileSync("good_roommates.json")))

//console.log(housemates)

var len = housemates.length
var newGuy = housemates[len - 1]

newGuy.arrivalDate = new Date('December 17, 2015 03:24:00')

var current = housemates.slice(0, len - 1)

console.log(newGuy)

var m = new mes.Messenger(housemates)

m.onNewHousemate(newGuy, function(replies) {
	console.log(replies)

	m.onMessage("+14084060962", "Yo winnie wassup!", function(rs) {
		console.log(rs)
    m.onMessage("+14103758414", "WELCOME!!!", function(rs) {
      console.log(rs)
      m.onMessage("+14159927046", "Yes", function(rs) {
        console.log(rs)  
        m.onMessage('+14159105800', "yes", function(rs) {
          console.log(rs)
          m.onMessage('+14159105800', "Friday", function(rs) {
            console.log(rs)

              m.onMessage("+14159927046", "yes", function(rs) {
                console.log(rs)
                console.log("FAFGAG")
                m.onMessage("+13019804834", "yes", function(rs) {
                  console.log(rs)
                  console.log("FAFGAG")
                })
              })

          })
        })
      })
    })
	})
})
