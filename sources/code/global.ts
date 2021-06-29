/*
 * Global.ts – non-Electron depending misc. vars, objects, functions etc.
 */

import { readFileSync, PathLike } from "fs";

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */

export function wLog (msg:string):void {
	console.log("%c[WebCord]",'color: #69A9C1',msg);
}

export type Person = string & {
	name: string,
	email?: string,
	url?: string
}

export interface PackageJsonProperties {
	/** NodeJS-friendly application name. */
	name: string,
	/** Application author. */
	author: Person,
	/** Array of application code contributors. */
	contributors: Array<Person>,
	/** Application homepage (`Readme.md` file). */
	homepage: string,
	/** Application repository. */
	repository: {
		/** Repository type (e.g. `git`). */
		type: string,
		/** Repository URL (e.g `git+https://example.com`) */
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

function getPackageJsonProperties():PackageJsonProperties {
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

/**
 * A funtion that parses the non-standard JSON file with comments
 * to regular JavaScript object – currently `JSON.parse()` function
 * should treat comments as syntax errors, as they are not a part
 * of JSON standard.
 * 
 * @param file Path to file.
 * @param encoding File encoding, ex. 'utf-8'.
 * @returns Parsed JavaScript object.
 * 
 * @example
 * 
 * // Read standard JSON file and save its content as string:
 * 
 * const myRegularJson = readFileSync('/path/to/file.json').toString();
 * 
 * // Read 'JSON with comments' file and save its content as string:
 * 
 * const myJsonWithComments = readFileSync('/path/to/fileWithComments.json').toString();
 * 
 * // Parse both JSON files:
 * 
 * JSON.parse(myRegularJson) // returns object
 * JSON.parse(myJsonWithComments) // syntax error!
 * jsonParseWithComments(myJsonWithComments) // returns object
 * jsonParseWithComments(myRegularJson) // returns object
 * 
 */

export const jsonParseWithComments = (file:PathLike, encoding?: BufferEncoding): Record<string,unknown> => {

	/* Do not parse JSON files (*.json) as JsonWithComments files (*.jsonc). */
	let isJson = false;
	if(typeof(file)==='string' && file.match('/^.*.json$')!==null)
		isJson = true

	const data = readFileSync(file).toString(encoding).split('\n');
	const dataJson: string[] = [];

	const commentRules = [
		/\/\/.*/,            // C like comments: `// example`
		/\/\*.*\*\//g,       // C++ like comments: `/* example */`
		/\/\*.*/,            // Start of multiline comments: `/* example`
		/.*\*\/$/,           // End of multiline comments: `example */`
	]
	let inComment = false;

	for (const line of data) {
		let newLine: string = line;		

		for (const rule in commentRules) if(!isJson) {
			if(line.match(commentRules[rule]) && rule === '2') inComment = true;
			if(line.match(commentRules[rule]) && rule === '3') inComment = false;
			newLine = line.replace(commentRules[rule],'');
		}
		
		if(!inComment) dataJson.push(newLine);
	}

	const jsonStringified = dataJson.join('\n');
	return JSON.parse(jsonStringified);
}