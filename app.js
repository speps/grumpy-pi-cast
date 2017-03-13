
window.getVideoImage = function(callback) {
    var webview = document.getElementById('webview');
    if (webview) {
        webview.captureVisibleRegion({format: "jpeg", quality: 95}, function(dataUrl) {
            var byteString = atob(dataUrl.split(',')[1]);
              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                  ia[i] = byteString.charCodeAt(i);
              }
              callback(ab);
        });
        return true;
    } else {
      return false;
    }
}

function updateServer() {
  if (getServerState().isConnected) {
    document.getElementById('server').innerHTML = "Stop";
    document.getElementById("host").disabled = true;
    document.getElementById("port").disabled = true;
    setTimeout(updateServer,500);
  } else {
    document.getElementById('server').innerHTML = "Run";
    document.getElementById("host").disabled = false;
    document.getElementById("port").disabled = false;
  }
}

document.getElementById('server').addEventListener('click', function(e) {
  var host = document.getElementById("host").value;
  var port = document.getElementById("port").value;
  if (getServerState().isConnected) {
    stopServer();
  } else {
    startServer(host, parseInt(port));
    setTimeout(updateServer, 1000);
  }
});

document.getElementById('open').addEventListener('click', function(e) {
  var width = parseInt(document.getElementById("width").value);
  var height = parseInt(document.getElementById("height").value);
  var webview = document.getElementById('webview');
  if (webview) {
    webview.src = document.getElementById("url").value;
  }
});

console.log(window.devicePixelRatio);