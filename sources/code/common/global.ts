/*
 * Global.ts – non-Electron depending globally-used module declarations
 */

import { existsSync } from "fs";
import { getAppPath } from "./modules/electron";
import { resolve } from "path";

/**
 * Outputs a fancy log message in the (DevTools) console.
 * 
 * @param msg Message to log in the console.
 */

export function wLog(msg: string): void {
	console.log("%c[WebCord]", 'color: #69A9C1', msg);
}

export function isJsonSyntaxCorrect(string: string) {
	try {
		JSON.parse(string);
	} catch {
		return false;
	}
	return true;
}

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

export interface HTMLRadioCustom extends HTMLForms {
	value: 'custom';
	validator: (data:string) => boolean;
}

export interface HTMLChecklistOption extends HTMLOption {
	type: 'checkbox';
	forms: HTMLChecklistForms[];
}

export interface HTMLRadioOption extends HTMLOption {
	type: 'radio';
	id: string;
	forms: (HTMLRadioForms|HTMLRadioCustom)[];
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

/**
 * Allowed protocol list.
 * 
 * For security reasons, `shell.openExternal()` should not be used for every
 * link protocol handling, as this may allow potential attackers to compromise
 * host or even execute arbitary commands.
 * 
 * This way, we can also force the usage of the secure links variants where
 * applicable and block *insecure* and unencrypted protocols.
 * 
 * See:
 * https://www.electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content
 */
export const trustedProtocolRegExp = /^(https:|mailto:|tel:|sms:)$/;

/** Known Discord instances, including the official ones. */
export const knownInstancesList = [
	["Discord", new URL("https://discord.com/app")],
	["Fosscord", new URL("https://dev.fosscord.com/app")]
] as const

export interface buildInfo {
	type: 'release' | 'devel',
	commit?: string | undefined;
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

export function getAppIcon(sizes:number[]) {
	const defaultPath = resolve(getAppPath(), "sources/assets/icons/app.png")
	if(existsSync(defaultPath))
		return defaultPath;
	for (const size of sizes)
		if(existsSync("/usr/share/icons/hicolor/"+size.toString()+"x"+size.toString()+"/apps/webcord.png"))
			return "/usr/share/icons/hicolor/"+size.toString()+"x"+size.toString()+"/apps/webcord.png";
	return "";
}

export type SessionLatest = Electron.Session & {
	/**
	 * A method that is unsupported within your Electron version, but valid
	 * for Electron releases supporting WebHID API, which are versions from
	 * range `>=14.1.0 && <15.0.0 || >=15.1.0`.
	 */
	setDevicePermissionHandler: (handler: (()=>boolean)|null)=>void;
}


/**
 * A sanitizer configuration that allows only for tags that modifies the code
 * formatting.
 */
 export const sanitizeConfig = {
    // Allow tags that modifies text style and/or has a semantic meaning.
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'kbd', 'strong', 'code', 'small'],
    // Block every attribute
    ALLOWED_ATTR: []
}