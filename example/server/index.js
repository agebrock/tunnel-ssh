var net = require('net');

var serverA = net.createServer(function(socket) {
    socket.on('data',function(data){
        console.log(data.toString());
    })
    socket.write('Echo server\r\n');
}).listen(8000, '127.0.0.1');

var serverB = net.createServer(function(socket) {
    socket.on('data',function(data){
        console.log(data.toString());
    })
    socket.write('Echo server\r\n');
}).listen(8001, '127.0.0.1');


var serverC = net.createServer(function(socket) {
    socket.on('data',function(data){
        console.log(data.toString());
    })
    socket.write('Echo server\r\n');
}).listen(8002, '127.0.0.1');
