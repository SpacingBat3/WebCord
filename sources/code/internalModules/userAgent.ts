/*
 * Fake UserAgent generator (userAgent.js)
 */

/**
 * Generates fake Chrome/Chromium user agent string to use instead Electron ones.
 * 
 * This way, pages indentifies Electron client as regular Chromium browser.
 * 
 * To make it even harder to detect, it even uses current operating system version in
 * the user agent string (via `process.getSystemVersion()` in Electron API).
 * 
 * @param chromeVersion Chome/Chromium version string to use.
 * @returns Fake Chrome/Chromium user agent string.
 * @todo Publish userAgent.ts as separate module for other projects' use.
 */
export function getUserAgent(chromeVersion: string): string {

	let fakeUserAgent, cpuArch;
	const os = process.getSystemVersion().split('.');
	let osVersion: string;

	if (process.platform == 'darwin') { // MacOS
		osVersion = os[0] + '_' + os[1];
		if (os[2] && os[2] != "0") osVersion += '_' + os[2];
		fakeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

	} else if (process.platform == 'win32') { // Windows
		let WOW64: string;
		osVersion = os[0] + '.' + os[1];
		os[0] == "10" ? WOW64 = "Win64; x64" : WOW64 = "WOW64";
		fakeUserAgent = `Mozilla/5.0 (Windows NT ${osVersion}; ${WOW64}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

	} else { // Linux
		if (process.arch == 'arm64') {
			cpuArch = "aarch64";
		} else if (process.arch == 'arm') {
			cpuArch = "armv7";
		} else if (process.arch == 'ia32') {
			cpuArch = "x86";
		} else {
			cpuArch = "x86_64";
		}
		/*
		 * Do not fake arch on Linux
		 */
		fakeUserAgent = `Mozilla/5.0 (X11; Linux ${cpuArch}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
	}
	return fakeUserAgent;
}
