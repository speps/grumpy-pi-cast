chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    innerBounds: {
      width: 1024,
      height: 600
    },
    resizable: false
  });
});
