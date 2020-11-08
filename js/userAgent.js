// Checks the platform and generates the proper User Agent:
const { app } = require('electron')

module.exports = function(chromeVersion){
	if (process.platform == 'darwin') {
		var fakeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
	} else if (process.platform == 'win32') {
		var fakeUserAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
	} else {
		/* Don't lie we're using ARM (or x86) CPU – maybe then Discord will understand
		then how popular it is on Raspberries and Linux ARM ;) */
		if (process.arch == 'arm64') {
			var cpuArch = "aarch64"
		} else if (process.arch == 'arm') {
			var cpuArch = "armv7"
		} else if (process.arch == 'ia32') {
			var cpuArch = "x86"
		} else {
			var cpuArch = "x86_64"
		}
		var fakeUserAgent = `Mozilla/5.0 (X11; Linux ${cpuArch}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
	}
	return fakeUserAgent
}
