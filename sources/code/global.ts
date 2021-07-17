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

export type CommentRuleObject = { rule: RegExp; multiline?: "start" | "end" }

/** Parameters that can be parsed by `readFileSync` function of `fs` module. */
type FsReadFileSyncParams = {
	/** Path to file, same as `path` parameter in `readFileSync` function of `fs` module. */
	path: PathLike;
	/**
	 * Encoding to use for convertion of text file data from Buffer to String.
	 */
	encoding?: BufferEncoding;
}

/**
 * A funtion that parses the non-standard JSON file with comments
 * to regular JavaScript object – currently `JSON.parse()` function
 * should treat comments as syntax errors, as they are not a part
 * of JSON standard.
 * 
 * @param file Object containing `path` to file and optionally its `encoding`.
 * 
 * @param rules Array of `CommentRuleObject` objects that will be included to `commentRules`.
 * 
 * @returns Parsed JavaScript object.
 * 
 * @todo Publish JSONC support as separate module for other projects' use.
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
 * jsonParseWithComments({path:'/path/to/fileWithComments.json'}) // returns object
 * jsonParseWithComments({path:'/path/to/file.json'}) // returns object
 * 
 */

export const jsonParseWithComments = ( file:FsReadFileSyncParams, rules?: CommentRuleObject[] ): Record<string,unknown> => {

	/* Do not parse JSON files (*.json) as JsonWithComments files (*.jsonc). */
	let isJson = false;
	if(typeof(file.path)==='string' && file.path.match('/^.*.json$')!==null)
		isJson = true

	const data = readFileSync(file.path).toString(file.encoding).split('\n');
	const dataJson: string[] = [];

	const commentRules:CommentRuleObject[] = [
		{ rule: /\/\/.*/ },                       // C like comments: `// example`
		{ rule: /\/\*.*\*\//g },                  // C++ like comments: `/* example */`
		{ rule: /\/\*.*/ , multiline: "start" },  // Start of multiline comments: `/* example`
		{ rule: /.*\*\/$/, multiline: "end" },    // End of multiline comments: `example */`
	]
	
	// Allow for additional comment rules
	if(rules) commentRules.concat(rules)

	/** Whenever next line might be in multiline comment */
	let inCommentNext = false;

	for (const line of data) {

		/** Whenever currently tested line might be in multiline comment */
		let inComment:boolean = inCommentNext

		let newLine = line;		

		for (const ruleObject of commentRules) if(!isJson) {
			if(newLine.match(ruleObject.rule) && ruleObject.multiline === 'start') inCommentNext = true;
			if(newLine.match(ruleObject.rule) && ruleObject.multiline === 'end' && inComment === true)
				inComment = inCommentNext = false;
			newLine = newLine.replace(ruleObject.rule,'');
		}
		
		if(!inComment) dataJson.push(newLine);
	}

	const jsonStringified = dataJson.join('\n');
	return JSON.parse(jsonStringified);
}