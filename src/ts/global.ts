/*
 * Global.ts – non-Electron depending misc. vars, objects, functions etc.
 */

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */
export function wLog (msg:string):void {
	console.log("%c[WebCord]",'color: #69A9C1',msg);
}

type person = string & {
	name: string,
	email?: string,
	url?: string
}

interface packageJsonProperties {
	name: string,
	author: person,
	contributors: Array<person>,
	homepage: string,
	repository: {
		type: string,
		url: string
	}
}
/**
 *
 * Function used to aquire some properties from `package.json`.
 *
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this function has limited number of properties that cannot be exceeded.
 */
function getPackageJsonProperties():packageJsonProperties {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const packageJSON = require("../../package.json")
	return {
		name: packageJSON.name,
		author: packageJSON.author,
		contributors: packageJSON.contributors,
		homepage: packageJSON.homepage,
		repository: packageJSON.repository
	}
}

/**
 * An object containing some properties of `package.json` file.
 * 
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this object has limited number of properties.
 */
export const packageJson = getPackageJsonProperties();