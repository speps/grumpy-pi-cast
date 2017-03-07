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
    if (local_stream == null) {
        var context = canvas.getContext('2d');
        context.fillStyle = 'red';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    canvas.toBlob(function(blob) {
        var fileReader = new FileReader();
        fileReader.onload = function(ev) {
            callback(ev.target.result);
        };
        fileReader.readAsArrayBuffer(blob);
    }, 'image/jpeg', 0.95);
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

    navigator.webkitGetUserMedia({
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: desktop_id,
                minWidth: 640,
                maxWidth: 640,
                minHeight: 480,
                maxHeight: 480
            }
        }
    }, gotStream, getUserMediaError);

    function gotStream(stream) {
        local_stream = stream;

        var video = document.createElement('video');
        video.autoplay = true;
        video.width = 640;
        video.height = 480;
        video.src = URL.createObjectURL(stream);

        var canvas = document.getElementById('canvas');
        canvas.width = 640;
        canvas.height = 480;
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
  var frame = chrome.app.window.create('frame.html', {
    innerBounds: {
      width: 640,
      height: 480
    },
    resizable: false
  }, function(w) {
    w.contentWindow.addEventListener("DOMContentLoaded", function() {
      var doc=w.contentWindow.document;
      var el=doc.querySelector("webview");
      el.src="http://speps.fr";
    });
  });
});

startServer("127.0.0.1", 8887)
