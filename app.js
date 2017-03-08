/*
Copyright 2014 Intel Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Dongseong Hwang (dongseong.hwang@intel.com)
*/

/**
 * Grabs the desktop capture feed from the browser, requesting
 * desktop capture. Requires the permissions
 * for desktop capture to be set in the manifest.
 *
 * @see https://developer.chrome.com/apps/desktopCapture
 */
var desktop_sharing = false;
var local_stream = null;

window.getVideoImage = function(callback) {
    var canvas = document.getElementById('canvas');
    if (canvas) {
        if (local_stream == null) return false;
        canvas.toBlob(function(blob) {
            var fileReader = new FileReader();
            fileReader.onload = function(ev) {
                callback(ev.target.result);
            };
            fileReader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.95);
    }
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
    }
    return true;
}

function draw(v,c,w,h) {
    if (local_stream == null) return;
    c.drawImage(v,0,0,w,h);
    setTimeout(draw,100,v,c,w,h);
}

function toggle() {
    if (!desktop_sharing) {
        chrome.desktopCapture.chooseDesktopMedia(["window"], onAccessApproved);
    } else {
        desktop_sharing = false;

        if (local_stream)
            local_stream.getTracks().forEach(function (track) { track.stop(); });
        local_stream = null;

        document.querySelector('#toggle').innerHTML = "Enable Capture";
        console.log('Desktop sharing stopped...');
    }
}

function onAccessApproved(desktop_id) {
    if (!desktop_id) {
        console.log('Desktop Capture access rejected.');
        return;
    }
    desktop_sharing = true;
    document.querySelector('#toggle').innerHTML = "Disable Capture";
    console.log("Desktop sharing started.. desktop_id:" + desktop_id);
    var width = window.openedWindow.innerBounds.width;
    var height = window.openedWindow.innerBounds.height;

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: width,
                maxWidth: width,
                minHeight: height,
                maxHeight: height
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        local_stream = stream;

        var video = document.createElement('video');
        video.autoplay = true;
        video.width = width;
        video.height = height;
        video.src = URL.createObjectURL(stream);

        var canvas = document.getElementById('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        draw(video,context,canvas.width,canvas.height);

        stream.onended = function() {
            if (desktop_sharing) {
                toggle();
            }
        };
    }

    function getUserMediaError(e) {
      console.log('getUserMediaError: ' + JSON.stringify(e, null, '---'));
    }
}

/**
 * Click handler to init the desktop capture grab
 */
document.querySelector('#toggle').addEventListener('click', function(e) {
    toggle();
});

document.querySelector('#open').addEventListener('click', function(e) {
  var width = parseInt(document.getElementById("width").value);
  var height = parseInt(document.getElementById("height").value);
  var webview = document.getElementById('webview');
  if (webview) {
    webview.src = document.getElementById("url").value;
    return;
  }
  if (window.openedWindow) {
    window.openedWindow.close();
    window.openedWindow = null;
  }
  chrome.app.window.create('frame.html', {
    innerBounds: {
      width: width,
      height: height,
    },
    resizable: false
  }, function(w) {
    window.openedWindow = w;
    w.onClosed.addListener(function() {
        if (desktop_sharing) {
            toggle();
        }
    });
    w.contentWindow.addEventListener("DOMContentLoaded", function() {
      var doc=w.contentWindow.document;
      var el=doc.querySelector("webview");
      el.src=document.getElementById("url").value;
    });
  });
});

startServer("192.168.0.1", 8887)
