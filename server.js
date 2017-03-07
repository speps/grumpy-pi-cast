var tcpServer;

function sendImages(conn) {
  window.getVideoImage(function(buf) {
    console.log(buf.byteLength);
    conn.sendMessage("--myboundary\r\n");
    conn.sendHTTP(0, buf, {"Content-Type": "image/jpeg"});
  });
  setTimeout(sendImages,100,conn)  
}

function onAcceptCallback(tcpConnection, socketInfo) {
  var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
  console.log(socketInfo);
  tcpConnection.addDataReceivedListener(function(data) {
    var lines = data.split(/[\n\r]+/);
    for (var i=0; i<lines.length; i++) {
      var line=lines[i];
      var match = /GET (\/[A-Za-z0-9]*)/.exec(line);
      if (match) {
        if (match[1] == "/") {
          var buf = new TextEncoder("utf-8").encode("hello world!").buffer;
          tcpConnection.sendHTTP(200, buf, {"Content-Type": "text/html"});
          tcpConnection.close();
        }
        if (match[1] == "/video") {
          tcpConnection.sendHTTP(200, null, {"Content-Type": "multipart/x-mixed-replace;boundary=myboundary"});
          sendImages(tcpConnection);
        }
      } else {
        tcpConnection.close();
      }
    }
  });
};

function startServer(addr, port) {
  if (tcpServer) {
    tcpServer.disconnect();
  }
  tcpServer = new TcpServer(addr, port);
  tcpServer.listen(onAcceptCallback);
}


function stopServer() {
  if (tcpServer) {
    tcpServer.disconnect();
    tcpServer=null;
  }
}

function getServerState() {
  if (tcpServer) {
    return {isConnected: tcpServer.isConnected(),
      addr: tcpServer.addr,
      port: tcpServer.port};
  } else {
    return {isConnected: false};
  }
}
