/*
 * Global.ts – non-Electron depending globally-used module declarations
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */

export function wLog(msg: string): void {
	console.log("%c[WebCord]", 'color: #69A9C1', msg);
}

export type Person = string & {
	name: string,
	email?: string,
	url?: string;
};

export interface PackageJsonProperties {
	/** Node.js-friendly application name. */
	name: string,
	/** Application author. */
	author: Person,
	/** Array of application code contributors. */
	contributors?: Array<Person>,
	/** Application homepage (`Readme.md` file). */
	homepage: string,
	/** Application repository. */
	repository: string & {
		/** Repository type (e.g. `git`). */
		type: string,
		/** Repository URL (e.g `git+https://example.com`) */
		url: string;
	};
}

function isPerson(variable: unknown): variable is Person {
	// Check #1: Variable is either string or object.
	if (typeof (variable) !== 'string' && typeof (variable) !== 'object')
		return false;

	// Check #2: When variable is object, it has 'name' key and optionally 'email' and 'url' keys.
	if (typeof (variable) === 'object') {
		if (typeof ((variable as Person).name) !== 'string')
			return false;

		if ((variable as Person).email !== undefined && typeof ((variable as Person).email) !== 'string')
			return false;

		if ((variable as Person).url !== undefined && typeof ((variable as Person).url) !== 'string')
			return false;
	}

	return true;
}

function isPackageJsonComplete(object: unknown): object is PackageJsonProperties {
	// Check #1: 'contributors' is array of 'Person'
	if (typeof (object as PackageJsonProperties).contributors === "object")
		for (const key of (object as Record<string, Array<unknown>>).contributors)
			if (!isPerson(key)) return false;

	// Check #2: 'author' is 'Person'
	if (!isPerson((object as PackageJsonProperties).author))
		return false;

	// Check #3: 'name' and 'homepage' are strings.
	for (const stringKey of ['name', 'homepage'])
		if (typeof ((object as { [key: string]: string; })[stringKey]) !== 'string')
			return false;

	// Check #4: 'repository' is either string or object
	if (typeof (object as PackageJsonProperties).repository !== "string" && typeof (object as PackageJsonProperties).repository !== "object")
		return false;

	// Check #5: As object, 'repository' has 'type' and 'url' keys of type 'string'
	for (const stringKey of ['type', 'url']) {
		const repository = (object as PackageJsonProperties).repository;
		if (typeof (repository) === "object" && typeof ((repository as { [key: string]: string; })[stringKey]) !== "string")
			return false;
	}

	return true;
}

/**
 *
 * Function used to aquire some properties from `package.json`.
 *
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this function has limited number of properties that cannot be exceeded.
 */

function getPackageJsonProperties(): PackageJsonProperties {
	const packageJSON: Record<string, unknown> = JSON.parse(readFileSync(resolve(__dirname, "../../package.json")).toString());
	if (!isPackageJsonComplete(packageJSON))
		throw new TypeError("File 'package.json' does not contain all required properties or/and some of them are of invalid type!");
	return {
		name: packageJSON.name,
		author: packageJSON.author,
		contributors: packageJSON.contributors,
		homepage: packageJSON.homepage,
		repository: packageJSON.repository
	};
}

/**
 * An object containing some properties of `package.json` file.
 * 
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this object has limited number of properties.
 */

export const packageJson = getPackageJsonProperties();

/**
 * Configuration format that can be used to generate a configuration interface
 * for WebCord's settings manager.
 */

export interface HTMLSettingsGroup {
    title: string;
    options: {
            name: string;
            description: string;
            checklists: {
                label: string;
                id: string;
                isChecked: boolean;
            }[]
    }[]
}

/** SHA1 hashes of Discord favicons (in RAW bitmap format). */
export const discordFavicons = {
	/** Default favicon (without *blue dot* indicator). */
    default: '25522cef7e234ab001bbbc85c7a3f477b996e20b',
	/** Favicon indicating unread messages (not pings!). */
    unread:  '225ffd129fbe59058e0a8fddc1324def40724591'
};

/**
 * A generic TypeGuard, used to deeply check if `object` has same type as another
 * object (useful when one of the objects has known type that is non-primitive).
 */
 export function objectsAreSameType<X,Y>(object1:X, object2:Y):object1 is X&Y {

	// False when parameters are not objects.
	if(!(object1 instanceof Object && object2 instanceof Object)) return false;
	
	// True when parameters are exactly same objects.
	if(JSON.stringify(object1) === JSON.stringify(object2)) return true;
	
	// Assume objects are itterable (even if that's a lie).
	const obj1 = (object1 as Record<string,unknown>), obj2 = (object2 as Record<string,unknown>);
	
	// Check if keys are the same in both of the objects at current tree level.
	const keyArray1:string[] = [], keyArray2:string[] = [];
    for (const key1 in obj1) keyArray1.push(key1);
    for (const key2 in obj2) keyArray2.push(key2);
	if (keyArray1.sort().toString() !== keyArray2.sort().toString()) return false;

	// If so, compare every single property type of these two objects.
	for (const key of keyArray1) {

		// Check again if object has the property.
		if(Object.prototype.hasOwnProperty.call(obj1,key)&&Object.prototype.hasOwnProperty.call(obj2,key))
			
			// When properties are non-nullish and objects, start this test for the next tree level.
			if(obj1[key] && obj2[key] && typeof(obj1[key]) === 'object' && typeof(obj2[key]) === 'object') {
				const test = objectsAreSameType(obj1[key], obj2[key])
				if(!test) return false;
			} else if ((typeof(obj1[key]) !== typeof(obj2[key]))) {
				return false;
			}
	}
	// If still executes, it means that passed all tests
	return true;
}

/** Resolves the path to either a JSON file or JSONC.
 * 
 * @param fileNoExtension Path to file, except without the extension.
 */
 export function jsonOrJsonc(fileNoExtension: string): string {
	if (existsSync(fileNoExtension + '.jsonc'))
		return fileNoExtension + '.jsonc';
	else
		return fileNoExtension + '.json';
}