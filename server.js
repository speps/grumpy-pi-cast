var tcpServer;

function s2ab(str, callback) {
  var bb = new Blob([str]);
  var f = new FileReader();
  f.onload = function(e) {
      callback(e.target.result);
  };
  f.readAsArrayBuffer(bb);
}

function sendImages(conn,first) {
  if (first) {
    var header = "HTTP/1.1 200 OK\r\nContent-Type: multipart/x-mixed-replace;boundary=--BOUNDARY\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n\r\n";
    s2ab(header, function(buf) {
      conn.sendBuffer(buf);
    });
  }
  window.getVideoImage(function(img) {
    console.log(img.byteLength);
    if (img.byteLength > 0) {
      var header = "--BOUNDARY\r\nContent-Type: image/jpeg\r\nContent-Length: " + img.byteLength + "\r\n\r\n";
      s2ab(header, function(headerbuf) {
        var buf = new Uint8Array(headerbuf.byteLength + img.byteLength);
        buf.set(new Uint8Array(headerbuf), 0);
        buf.set(new Uint8Array(img), headerbuf.byteLength);
        conn.sendBuffer(buf.buffer);
      });
    }
  });
  setTimeout(sendImages,100,conn,false)
}

function onAcceptCallback(tcpConnection, socketInfo) {
  var info="["+socketInfo.peerAddress+":"+socketInfo.peerPort+"] Connection accepted!";
  console.log(socketInfo);
  tcpConnection.addDataReceivedListener(function(data) {
    var lines = data.split(/[\n\r]+/);
    var request = lines[0];
    var match = /GET (\/[A-Za-z0-9]*)/.exec(request);
    if (match) {
      if (match[1] == "/") {
        var buf = new TextEncoder("utf-8").encode("hello world!").buffer;
        tcpConnection.sendHTTP(200, buf, {"Content-Type": "text/html"});
        tcpConnection.close();
      }
      if (match[1] == "/video") {
        sendImages(tcpConnection, true);
      }
    } else {
      tcpConnection.close();
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
