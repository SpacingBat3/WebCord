/*
 * Global.ts – non-Electron depending misc. vars, objects, functions etc.
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


export const packageJson = getPackageJsonProperties();