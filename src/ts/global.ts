/*
 * Global.ts – non-Electron depending misc. vars, objects, functions etc.
 */

export function wLog (msg:string):void {
	console.log("%c[WebCord]",'color: #69A9C1',msg);
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const packageJson = require("../../package.json");