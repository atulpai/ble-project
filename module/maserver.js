
// The centralized bluetooth control system
// that is implemented in JavaScript
var noble = require('noble');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
// Used an default kalman filter
var KalmanFilter = require('kalmanjs').default;
// The R value and Q value are chosen by field experiment
var kf = new KalmanFilter({R:0.1, Q:6});

var lastTime = 0;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/view1DLine.html');
});
var index = 0;
var sock;
io.on('connection', function(socket){
  sock = socket;

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

/*
 * Fire up noble
 */
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

/*
 * If noble discovered something
 */
noble.on('discover', function(peripheral) { 
  var rss = peripheral.rssi;
  var localName = peripheral.advertisement.localName;
  var now = Date.now();
  if (    localName != null && 
          localName.indexOf("Adafruit") >= 0 &&  // lock our device
          now - lastTime > 100) {   // We have this weird issue that will have two readings
                                    // that are extremely similar but different signal 
                                    // strength. This might be the result of bluetooth
                                    // Multipath
    lastTime = now;
    index++;
	var kfrssi = kf.filter(rss);
    console.log('\n');
  	console.log('Time Stamp: ' + now + ', Index: ' + index);
    console.log('Device Name: ' + localName);
    console.log('\tRSSI: ' + rss);
    console.log('\tKalman Filter :' + kfrssi);
    console.log('\tEst. Distance by Kalman: ' + polyBestFit(kfrssi));
    if (sock != null && localName.indexOf('Adafruit') > -1) {
      sock.emit('chat message', {
          'time': Date.now(), 'rss': rss, 'dist': polyBestFit(rss), 'kal': kfrssi
      });
    }
  }
});

/*
 * This is the best fit line by the data we gathered
 * from the field experiment done in the CSE Lab 003
 * We have tried other function such as a log equation
 * convert bluetooth rssi to distance, and an hard
 * coded bluetooth distance equation by internet
 * conventional knowledge. However, those methods
 * described above do not fit the needs of our usage
 * The field experiment shows that our bestfit line
 * works the best comparing to all three
 */
function polyBestFit (x) {
   return  30.854656974102966
        +  1.5537710131758378 * Math.pow(x,1)
        +  0.020558836892321734* Math.pow(x,2);
}
