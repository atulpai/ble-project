var noble = require('noble');


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
	if (localName != null) {
	console.log('time stamp: ' + Date.now());
console.log('localname: ' + localName + ' rssi: ' + rss + ' estimated dist: ' + calculateDistance(rss));
}
  //console.log('found device: ', macAdress, ' ', localName, ' ', rss);   
});

function calculateDistance(rssi) {
  
  var txPower = -59; //hard coded power value. Usually ranges between -59 to -65
  
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
