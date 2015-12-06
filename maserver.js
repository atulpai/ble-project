var noble = require('noble');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var KalmanFilter = require('kalmanjs').default;
var kf = new KalmanFilter({R:0.01, Q:5});
var lastTime = 0;
var timeInterval = 5 * 1000; // 5 seconds minutes 
 
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
	if (localName != null && now - lastTime > 100) {
    lastTime = now;
    index++;
  	console.log('time stamp: ' + now + 'index: ' + index);
    console.log('localname: ' + localName + ' rssi: ' + rss + ' estimated dist: ' + calculateDistance(rss));
    ma.push(now, rss);
    console.log('kal :' + kf.filter(rss));
    console.log('ma :' + ma.movingAverage());
    if (sock != null && localName.indexOf('Adafruit') > -1) {
      sock.emit('chat message', {'time': Date.now(), 'rss': rss, 'dist': calculateDistance(rss), 'kal': kf.filter(rss)});
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
