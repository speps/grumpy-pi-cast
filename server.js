var tcpServer;

function onAcceptCallback(tcpConnection, socketInfo) {
  var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
  console.log(socketInfo);
  tcpConnection.addDataReceivedListener(function(data) {
    var lines = data.split(/[\n\r]+/);
    for (var i=0; i<lines.length; i++) {
      var line=lines[i];
      if (line.length>0) {
        var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] "+line;
        console.log(info)
      }
      var match = /GET (\/[A-Za-z0-9]*)/.exec(line);
      console.log(match);
      // if ()
      //   var cmd=line.split(/\s+/);
      //   try {
      //     tcpConnection.sendMessage(Commands.run(cmd[0], cmd.slice(1)));
      //   } catch (ex) {
      //     tcpConnection.sendMessage(ex);
      //   }
      // }
    }
    tcpConnection.close()
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
