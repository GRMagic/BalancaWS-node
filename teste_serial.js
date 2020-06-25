var SerialPort = require('serialport');

//let velocidades = [300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400];
let velocidades = [ 2400 ];
let dataBits = [ 8 ];
let stop = [ 1 ];
let parity = [ 'none']

function testar(porta, baud, data, stop, parity){
	let port = new SerialPort(porta, {
		autoOpen: true, 
		baudRate: baud,
		dataBits: data,
		parity: parity,
		stopBits: stop,
		flowControl: false
	});
	let txt = "";
	port.on('data', function(data) {
		//console.log(data);
	  txt += data;
	});
	console.log("Testando...", "porta:", porta, "baud:", baud, "data:", data, "stop:", stop, "parity:", parity);
	setTimeout(function(){
		console.log(txt);
		console.log("\n");
		port.close();
	},5000);
}

var temp = 0;
for (let v = 0; v < velocidades.length; v++){
	for (let d = 0; d < dataBits.length; d++){
		for (let s = 0; s < stop.length; s++){
			for (let p = 0; p < parity.length; p++){
				setTimeout(() => {
					testar("/dev/ttyUSB0", velocidades[v], dataBits[d], stop[s], parity[p]);
				}, 5500 * temp);
				temp ++;
			}
		}
	}
}
