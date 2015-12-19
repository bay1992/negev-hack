var fs = require("fs")
var mes = require("./messenger")

var housemates = JSON.parse(fs.readFileSync("roommate_data.json"))

var fixed = JSON.parse(fs.readFileSync("goodNumbers.json"))

console.log(fixed.length)


var numMap = {}
fixed.forEach(function(g) {
	numMap[g.name] = g.number
})

housemates.forEach(function(h) {
	var good = numMap[h.name]
	if (good) {
		h.phone = good
	}
})

console.log(housemates)

fs.writeFileSync("good_roommates.json", JSON.stringify(housemates))