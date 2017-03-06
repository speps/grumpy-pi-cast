var imgHeader = function(img) {
	var str = "--myboundary\r\n" +
            "Content-Type:image/jpeg\r\n" +
            "Content-Length:" + img.byteLength + "\r\n\r\n";
	return new TextEncoder('utf-8').encode(str).buffer;
}
    self.setHeader('content-type','multipart/x-mixed-replace;boundary=myboundary')

function Server(options) {
	options = options || {};
	this.host = options.host || '';
	this.port = options.port || '';
}


