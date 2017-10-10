var bodyParser = require('body-parser');
var express = require('express');
var fs = require('fs');
var csv = require('fast-csv');

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var file = "./bank_branches.csv";

var stream = fs.createReadStream(file);
var dbData = {};
var csvStream = csv()
    .on("data", function(data){
         dbData[data[0]] = {
         	"ifsc"     :data[0],
         	"bank_id"  :data[1],
         	"branch"   :data[2],
         	"address"  :data[3],
         	"city"     :data[4],
         	"district" :data[5],
         	"state"    :data[6],
         	"bank_name":data[7],
         }
    })
    .on("end", function(){
        console.log("Number of records=",Object.keys(dbData).length);
		console.log("first obj->",dbData["ABHY0065001"]);
    });
 
stream.pipe(csvStream);

app.get('/', (req, res) => {
	fs.readFile('readme.txt', 'utf8', function(err, data) {
	if (err) throw err;
	return res.status(200).send(data);
	});
})

app.get('/branchifsc', (req,res) => {
	var ifsc = req.query.ifsc;
	if(!ifsc)
		return res.status(400).send("ifsc code not provided");

	if(dbData.hasOwnProperty(ifsc))
		return res.status(200).send(dbData[ifsc])
	else{
		return res.status(400).send("the provided ifsc code does not exist.");
	}

})

app.get('/branchesnameandcity', (req,res) => {
	var bank_name = req.query.bank_name;
	var city = req.query.city;

	if(!bank_name || ! city)
		return res.status(400).send("bank_name or city not provided");

	var banks = [];
	for(var ifsc in dbData){
		if(dbData[ifsc].bank_name == bank_name && dbData[ifsc].city == city){
			banks.push(dbData[ifsc]);
		}
	}
	res.status(200).send(banks);
})

app.listen(process.env.PORT || 3000);

console.log("the app is running on",process.env.PORT || 3000);

module.exports = app;