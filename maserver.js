var noble = require('noble');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var KalmanFilter = require('kalmanjs').default;
var kf = new KalmanFilter({R:0.1, Q:6});
var lastTime = 0;
var timeInterval = 5 * 10 * 1000; // 5 seconds minutes 
 
var MA = require('moving-average');
var ma = MA(timeInterval);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/view.html');
});
var index = 0;
var sock;
io.on('connection', function(socket){
  sock = socket;

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
	console.log('started scanning');
    noble.startScanning([], true, function(error) {
      if (error) {
        console.log('error ', error);
      };
    });
  } else {
    console.log('stopped scanning. current state: ', state);
    process.exit();
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) { 
	//console.log(peripheral);
  //var macAddress = peripheral.uuid;
  var rss = peripheral.rssi;
	//var localname = 'joe';
  var localName = peripheral.advertisement.localName;
  var now = Date.now();
	if (localname != null && localname.indexOf("B7E9") > 0){
    kf.filter(rss);
  } else if (localName != null && now - lastTime > 100) {
    lastTime = now;
    index++;
	var kfrssi = kf.filter(rss);
  	console.log('time stamp: ' + now + ' index: ' + index);
    console.log('localname: ' + localName + ' rssi: ' + rss + ' estimated log distance equation: ' + polyBestFit(kfrssi));
    ma.push(now, rss);
    console.log('kal :' + kfrssi);
    console.log('ma :' + ma.movingAverage());
    if (sock != null && localName.indexOf('Adafruit') > -1) {
      sock.emit('chat message', {'time': Date.now(), 'rss': rss, 'dist': polyBestFit(rss), 'kal': kfrssi});
    }
  }
  //console.log('found device: ', macAdress, ' ', localName, ' ', rss);   
});

function calculateDistance(rssi) {
  
  var txPower = -61; //hard coded power value. Usually ranges between -59 to -65
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
}

// calculate rssi using this function: RSSI=−10nlog10(d/d0)+A0
//d describes the distance between the transceiver and recipient, 
// n the signal propagation exponent for indoor = 2
// A0 a referenced RSSI value at d0. (-59)
// Usually d0 is 11 inches
function calculateDistanceLogFunction(rssi) {
  if (rssi == 0) {
    return -1.0; 
  }

  var a0 = -59; 

  //(10 ^ (RSSI - AO / -10n)) * 11 = d 

  return (11) * Math.pow(10, (rssi - a0 / -20));
  /*var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }*/
}


function polyBestFit (x) {
   return  30.854656974102966
        +  1.5537710131758378 * Math.pow(x,1)
        +  0.020558836892321734* Math.pow(x,2);
}
