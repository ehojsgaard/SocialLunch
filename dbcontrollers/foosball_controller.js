var mongoose = require('mongoose');
var PlayerDB  = mongoose.model('Player');
var LunchGroupDB  = mongoose.model('LunchGroup');

//GET - Return all players in the DB
exports.findAllPlayers = function(req, res) {
    PlayerDB.find(function(err, players) {
    if(err) res.send(500, err.message);

    console.log('GET /players')
        res.status(200).jsonp(players);
    });
};

function _findAllTodayPlayers(resultFunction) {
  var fromDate = new Date();
  var today = new Date();
  var subtractNumber = 0;
  
  if(today.getDay == 0){
	  subtractNumber = 2;
  } else if(today.getDay == 1){
	  subtractNumber = 3;
  } else if(today.getDay == 2){
	  subtractNumber = 4;
  } else if(today.getDay == 3){
	  subtractNumber = 5;
  } else if(today.getDay == 4){
	  subtractNumber = 6;
  } else if(today.getDay == 5){
	  subtractNumber = 7;
  } else if(today.getDay == 6){
	  subtractNumber = 1;
  }
  
  fromDate.setDate(today.getDate() - subtractNumber);
  fromDate.setHours(14,0,0,0);
  return PlayerDB.find({subscribedTo: {$gt: fromDate}}, resultFunction);
}

function _findAllTodayMatches(resultFunction) {
  var fromDate = new Date();
  var today = new Date();
  var subtractNumber = 0;
  
  if(today.getDay == 0){
	  subtractNumber = 2;
  } else if(today.getDay == 1){
	  subtractNumber = 3;
  } else if(today.getDay == 2){
	  subtractNumber = 4;
  } else if(today.getDay == 3){
	  subtractNumber = 5;
  } else if(today.getDay == 4){
	  subtractNumber = 6;
  } else if(today.getDay == 5){
	  subtractNumber = 7;
  } else if(today.getDay == 6){
	  subtractNumber = 1;
  }
  
  fromDate.setDate(today.getDate() - subtractNumber);
  fromDate.setHours(15,0,0,0);
  return LunchGroupDB.find({matchDate: {$gt: fromDate, $lt:today}}).populate('participants').exec(resultFunction);
}

exports.findAllTodayPlayers = function(req, res) {
  _findAllTodayPlayers((err, players) => {
    if(err) res.send(500, err.message);

    console.log('GET /players')
        res.status(200).jsonp(players);
  });
};

exports.findAllTodayMatches = function(req, res) {
  _findAllTodayMatches((err, matches) => {
    console.log("Result: " + matches);
    if(err) res.send(500, err.message);

    console.log('GET /matches')
        res.status(200).jsonp(matches);
  });
};

exports.addPlayer = function(req, res) {
    console.log('POST');
    console.log(req.body);
    _findAllTodayPlayers((err, players) => {
      if(req.body.name !== null && req.body.name.trim() !== '') {
        if(players.length < 30) {
          var existantPlayer = players.filter((player) => player.name.toUpperCase() === req.body.name.toUpperCase());
          if(existantPlayer == null || existantPlayer.length == 0) {
            var addedPlayer = new PlayerDB({
                name:    req.body.name,
                points:  req.body.points !== null && req.body.points ? req.body.points : 1000,
                subscribedTo:  new Date()
            });

            addedPlayer.save(function(err, addedPlayer) {
                if(err) return res.status(500).send( err.message);
            res.status(200).jsonp(addedPlayer);
            });
          } else {
            return res.status(500).send( 'Person already exists');
          }
        }else {
          return res.status(500).send( 'No more persons this week');
        }
      } else {
        return res.status(500).send( 'Name cannot be empty');
      }
    });
};

exports.deletePlayer = function(req, res) {
    console.log('DELETE');
    console.log(req.body);

    PlayerDB.findById(req.body._id, function (err, foundPlayer) {
      if(err) return res.status(500).send( err.message);

      foundPlayer.remove();
      res.status(200).jsonp(foundPlayer);
    });

};

exports.generateMatches = function() {
  _findAllTodayPlayers((err, players) => {
    var tables = ['1st Table', '2nd Table', '3rd Table', '4th Table', '5th Table'];
    var numParticipants = players.length;
	/*
	var numGroups = 0;
	var personsPerTable = 0;
	
	for (var k=1; k<=5; k++){
		if((numParticipants/k)<=6){
			numGroups = k;
			console.log(numGroups);
			personsPerTable = (numParticipants/k);
			console.log(personsPerTable);
			break;
		}	
	}
	
	//var personsPerTable = 6;
*/
	var numGroups = Math.ceil(numParticipants/6);	
	var lunchGroups = new Array(numGroups);
	for(var i=0; i<numGroups; i++) {
		lunchGroups[i] = [];
	}
	
	console.log("Size of lunchGroups " + lunchGroups.length);
	
	for(var i=0; i<numParticipants; i++) {
		var playerPos = Math.floor(Math.random() * players.length);
		var player = players[playerPos];
		lunchGroups[i%numGroups].push(player);		
		players.splice(playerPos, 1);
		console.log(player.name);
		console.log("New iteration");
	}	
	for(var i=0; i<numGroups; i++){
		var addedLunchGroup = new LunchGroupDB({
        table:    		tables[i],
        participants:   lunchGroups[i],
        matchDate: 		new Date()
      });

      addedLunchGroup.save(function(err, addedLunchGroup) {
          console.log("Lunch group saved");
      });
	}
})};