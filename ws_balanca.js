var http = require('http');
var url = require('url');
var SerialPort = require('serialport');

let config = require('./config.json')

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  let q = url.parse(req.url, true).query;
  let balanca = config.balancas.find(b => b.nome == q.balanca);
  console.log(q.balanca);
  if(balanca == undefined){
    console.error("A balança '" + q.balanca + "' não foi encontrada!");
    res.end();
	return;
  }
  switch(balanca.conexao.tipo){
  case "SERIAL":
        let port = new SerialPort(balanca.conexao.porta, {
        autoOpen: false,
	  baudRate: balanca.conexao.baudRate,
	  dataBits: balanca.conexao.dataBits,
	  parity: balanca.conexao.parity,
	  stopBits: balanca.conexao.stopBits,
	  flowControl: balanca.conexao.flowControl
	});
	port.open(function (err) {
          setTimeout(() => {
	    if (err) {
		console.error('Erro abrindo a porta: ', err.message);
		res.end();
	    }else{
                port.flush();
		port.on('close', function(){ res.end(); });
		let asskicker = setTimeout(() => {
                  port.close();
                  console.error("serial timeout")
                }, balanca.conexao.timeout);
		let txt = "";
		port.on('data', function(data) {
		  txt += data.toString("ascii");
                  console.log(data, txt);
		  if(txt.length >= balanca.tratamento.buffer){
			let pattern = new RegExp(balanca.tratamento.regExp, "");
			let resultado = pattern.exec(txt);
			if (resultado == null){
                          if(txt.length > balanca.tratamento.limite){
			    console.error("A balança " + balanca.nome + " não respondeu adequadamente.");
			    console.error(txt);
                            console.error(pattern);
                            clearTimeout(asskicker);
                            port.close();
                          }
			}else{
			  let retorno = {
				bruto: Number(resultado.groups["bruto"]),
				tara: Number(resultado.groups["tara"]),
				liquido: Number(resultado.groups["liquido"]) * balanca.tratamento.multiplicador,
				estavel: balanca.tratamento.estavel == resultado.groups["estavel"]
			  }
			  res.write(JSON.stringify(retorno));
                          clearTimeout(asskicker);
                          port.close();
			}
		  }
		});
	    }
          },100);
	});
  break;
  default:
	console.error("Tipo de conexão não implementada!");
	res.end();
  }
}).listen(config.ws.porta);
