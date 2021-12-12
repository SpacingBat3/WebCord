/*
 * Global.ts – non-Electron depending globally-used module declarations
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "semver";

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */

export function wLog(msg: string): void {
	console.log("%c[WebCord]", 'color: #69A9C1', msg);
}

export type Person = string & {
	/** Person name (can be either a nickname or full name). */
	name: string,
	/** Valid email of the person, e.g. `person@example.com`. */
	email?: string,
	/** An URL to the person's webpage, e.g. `https://example.com/person` */
	url?: string;
};

export interface PackageJsonProperties {
	/** Node.js-friendly application name. */
	name: string,
	/** Application version. */
	version: string,
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

function isEmail(email: string|undefined): boolean {
	return (email?.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*@[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*\.[a-z]+$/) !== null)
}

function isPerson(variable: unknown): variable is Person {
	// Check #1: Variable is either string or object.
	if (typeof variable !== 'string' && typeof variable !== 'object')
		return false;

	// Check #2: When variable is object, it has 'name' key and optionally 'email' and 'url' keys.
	if (typeof variable === 'object') {
		if (typeof (variable as Person).name !== 'string')
			return false;

		if ((variable as Person).email !== undefined && typeof (variable as Person).email !== 'string')
			return false
		// Validate Emails if present
		else if(typeof (variable as Person).email === 'string' && !isEmail((variable as Person).email))
			return false


		if ((variable as Person).url !== undefined && typeof (variable as Person).url !== 'string')
			return false;
	}

	// Check #3: When Person is string, it shall be in `name <email> [url]` format.
	if (typeof variable === 'string'){
		return (
			// Check format.
			variable.split(/\[.*\]|<.*>/).length < 2 ||
			(
				variable.split(/\[.*\]|<.*>/).length == 2 &&
				variable.split(/\[.*\]|<.*>/)[1] === ''
			)
		) && (
			// Validate email if it exists.
			!variable.match(/<.*>/) ||
			isEmail(variable.replace(/.*<(.*)>.*/,'$1'))
		)
	}
	return true;
}

/**
 * A typeguard that verifies if the `package.json` is in the correct format.
 * 
 * **Warning**: These checks includes even the syntax of some strings like
 * for the `[Person].email` or the `name` top-level property.
 */

export function isPackageJsonComplete(object: unknown): object is PackageJsonProperties {
	return (checkPackageJsonComplete(object) === "")
}

export function checkPackageJsonComplete(object: unknown): string {
	// Check #1: 'contributors' is array of 'Person'
	if (typeof (object as PackageJsonProperties).contributors === "object")
		for (const key of (object as Record<string, Array<unknown>>).contributors)
			if (!isPerson(key)) return "Contributors field is of invalid type.";

	// Check #2: 'author' is 'Person'
	if (!isPerson((object as PackageJsonProperties).author))
		return "Author field is of invalid type.";

	// Check #3: 'name' and 'homepage' are strings.
	for (const stringKey of ['name', 'homepage'])
		if (typeof ((object as { [key: string]: string; })[stringKey]) !== 'string')
			return "'"+stringKey+"' is not assignable to type 'string'.";

	// Check #4: 'repository' is either string or object
	if (typeof (object as PackageJsonProperties).repository !== "string" && typeof (object as PackageJsonProperties).repository !== "object")
		return "Repository field is neither of type 'string' nor 'object'.";

	// Check #5: As object, 'repository' has 'type' and 'url' keys of type 'string'
	for (const stringKey of ['type', 'url']) {
		const repository = (object as PackageJsonProperties).repository;
		if (typeof (repository) === "object" && typeof ((repository as { [key: string]: string; })[stringKey]) !== "string")
			return "Repository object does not contain a '"+stringKey+"' property.";
	}

	// Check #6: `name` field is correct package name.
	if((object as PackageJsonProperties).name.match(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/) === null)
		return "'"+(object as PackageJsonProperties).name+"' is not a valid Node.js package name.";

	// Check #7: `version` is a `semver`-parsable string
	if(typeof (object as PackageJsonProperties).version === 'string') {
		if (parse((object as PackageJsonProperties).version) === null)
			return "Version "+(object as PackageJsonProperties).version+" can't be parsed to 'semver'.";
	} else {
		return "Version property is not assignable to type 'string'!"
	}

	// All checks passed!
	return "";
}

/**
 *
 * Function used to aquire some properties from `package.json`.
 *
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this function has limited number of properties that cannot be exceeded.
 */

function getPackageJsonProperties(): Omit<PackageJsonProperties, 'version'> {
	const packageJSON: Record<string, unknown> = JSON.parse(readFileSync(resolve(__dirname, "../../package.json")).toString());
	if (!isPackageJsonComplete(packageJSON))
		throw new TypeError(checkPackageJsonComplete("While parsing `package.json`: "+packageJSON));
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
	/** Title of the settings section. (General, Advanced etc.) */
    title: string;
	/** Array of the settings groups in the section. */
    options: (HTMLChecklistOption|HTMLRadioOption)[]
}

interface HTMLOption {
	/** Name of the specific configuration entry (e.g. Tray icon). */
	name: string;
	/** Long description of the configuration entry (e.g. Controls the tray apperance) */
	description: string;
	/** Whenever this configuration part is visible. */
	hidden?: boolean;
	/** Type of the inputs used in the `forms` property. */
	type: string;
	/** An array of inputs of the same type that are used for the configuration. */
	forms: HTMLForms[];
}

interface HTMLForms {
	/** A label describing the single checkbox. */
	label: string;
	/** Description that will be visible on mouse hover. */
	description?: string;
	/** Whenever forms are selected. */
	isChecked: boolean;
}

export interface HTMLChecklistForms extends HTMLForms {
	/**
	 * An element id used for the indentification of the settings
	 * entries to get / update its values.
	 */
	id: string;
}

export interface HTMLRadioForms extends HTMLForms {
	value: number;
}

export interface HTMLChecklistOption extends HTMLOption {
	type: 'checkbox';
	forms: HTMLChecklistForms[];
}

export interface HTMLRadioOption extends HTMLOption {
	type: 'radio';
	id: string;
	forms: HTMLRadioForms[];
}

/** SHA1 hashes of Discord favicons (in RAW bitmap format). */
export const discordFavicons = {
	/** Default favicon (without *blue dot* indicator). */
    default: '25522cef7e234ab001bbbc85c7a3f477b996e20b'
};

/**
 * A generic TypeGuard, used to deeply check if `object` has same type as another
 * `object` (useful when one of the objects has known type that is non-primitive).
 * 
 * @param object1 An object to check the type of.
 * 
 * @param object2 An object used for the type comparasion.
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
			
			if (Array.isArray(obj1[key])&&Array.isArray(obj2[key])) {
				// Ignore array type checking.
				break;
			} else if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
				// When properties are objects, start this test for the next tree level.
				const test = objectsAreSameType(obj1[key], obj2[key])
				if(!test) return false;
			} else if ((typeof(obj1[key]) !== typeof(obj2[key]))) {
				return false;
			}
	}
	// If that still executes, it means that passed all tests.
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

/**
 * Allowed protocol list.
 * 
 * For security reasons, `shell.openExternal()` should not be used for any type
 * of the link, as this may allow potential attackers to compromise host or even
 * execute arbitary commands.
 * 
 * This way, we can also force the usage of the secure links variants where
 * applicable and block *insecure* and unencrypted protocols.
 * 
 * See:
 * https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content
 */
export const trustedProtocolRegExp = /^(https:|mailto:|tel:|sms:)$/;

/** Known Discord instances, including the official ones. */
export const knownIstancesList:[string,URL][] = [
	["Discord", new URL("https://discord.com/app")],
	["Fosscord", new URL("https://dev.fosscord.com/app")]
]

export interface buildInfo {
	type: 'release' | 'devel',
	commit?: string;
	features?: {
		updateNotifications?: boolean;
	}
}

export function isBuildInfo(object: unknown): object is buildInfo {
	// #1 Element is object.
	if (!(object instanceof Object))
		return false;
	// #2 Object has 'type' property.
	if (!Object.prototype.hasOwnProperty.call(object, 'type')) return false;
	// #3 'type' property contains 'release' and 'devel' strings.
	switch ((object as buildInfo).type) {
		case 'release':
		case 'devel':
			break;
		default:
			return false;
	}
	// #4 If object contains 'commit' property, it should be of type 'string'.
	if (Object.prototype.hasOwnProperty.call(object, 'commit'))
		if (!(typeof (object as buildInfo).commit === 'string'))
			return false;

	/** List of valid properties for the `.features` object. */
	const features = ['updateNotifications']
	// #5 If object contains the 'features' property, it should be an object.
	if (Object.prototype.hasOwnProperty.call(object, 'features'))
		if (!((object as buildInfo).features instanceof Object))
			return false;
		else for(const property of features)
			// #6 `features` properties are of type `boolean`.
			if(Object.prototype.hasOwnProperty.call((object as {features:Record<string, unknown>}).features, property))
				if(typeof (object as {features:Record<string,unknown>}).features[property] !== "boolean")
					return false;

	return true;
}