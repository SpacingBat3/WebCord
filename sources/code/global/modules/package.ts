/*
 * global/package.ts – Scripts, types and typeguards for `package.json` file.
 */

import { resolve } from "path";
import { parse } from "semver";
import { readFileSync } from "fs";
/** RegExp to filter `Person` string. */


interface PersonObject {
	/** Person name (can be either a nickname or full name). */
	name: string,
	/** Valid email of the person, e.g. `person@example.com`. */
	email?: string,
	/** An URL to the person's webpage, e.g. `https://example.com/person` */
	url?: string;
}

export type Person = string & PersonObject

export interface ContributorObject {
	/** Non-standart property to define the contribution type (default: `other`). */
	type?: 'translator' | 'developer' | 'icon-designer'
}

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

/**
 * A class to  object containing some properties of `package.json` file.
 * 
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this object has limited number of properties.
 */
export class PackageJSON<T extends Array<keyof PackageJsonProperties>> {
    readonly data;
    private isEmail(email: string|undefined): boolean {
        return (email?.match(/^[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*@[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*\.[a-z]+$/) !== null)
    }
    public isPersonObject(variable: unknown): variable is PersonObject {
        // Variable is an Object, which has 'name' key and optionally 'email' and 'url' keys.
        if (variable instanceof Object) {
            if (typeof (variable as Person).name !== 'string')
                return false;
    
            if ((variable as Person).email !== undefined && typeof (variable as Person).email !== 'string')
                return false
    
            // Validate Emails if present
            else if(typeof (variable as Person).email === 'string' && !this.isEmail((variable as Person).email))
                return false
    
            if ((variable as Person).url !== undefined && typeof (variable as Person).url !== 'string')
                return false;
        } else {
            return false;
        }
        return true;
    }
    /**
     * 
     * @param person A person field from `package.json` (`author`, `contributors` etc.)
     * @returns Parsed 
     */
    public Person2Object(person: Person):PersonObject|null {
        //Check if it isn't an object already.
        if(this.isPersonObject(person))
            return person;
        // In other case, try to parse the string.
        const match = (person as "string").match(/((?:.*?(?=(?:<[^ ]*>|\([^ ]*\)))|.*))(<[^ ]*>)? *(\(.*\))?/)
        if(match === null || match[1] === null || match[1] === "") return null;
        return {
            name: match[1],
            email: match[2] ?? undefined,
            url: match[3] ?? undefined
        }
    }
    /**
     * A TypeGuard to check whenever a property is in `package.json` person
     * field format.
     */
    public isPerson(variable: unknown): variable is Person {
        // Check #1: Variable might be PersonObject:
        if(this.isPersonObject(variable)) return true;
    
        // Check #2: When Person is string, it shall be in `name <email> [url]` format.
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
                this.isEmail(variable.replace(/.*<(.*)>.*/,'$2'))
            )
        }
        return false
    }
    /** A function used to return the details about the `package.json` wrong configuration. */
    public checkPackageJsonComplete(object: unknown): string {
        // Check #1: 'contributors' is array of 'Person'
        if (typeof (object as PackageJsonProperties).contributors === "object")
            for (const key of (object as Record<string, Array<unknown>>).contributors)
                if (!this.isPerson(key)) return "Contributors field is of invalid type.";
    
        // Check #2: 'author' is 'Person'
        if (!this.isPerson((object as PackageJsonProperties).author))
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
     * A typeguard that verifies if the `package.json` is in the correct format.
     * 
     * **Warning**: These checks includes even the syntax of some strings like
     * for the `[Person].email` or the `name` top-level property.
     */
    public isPackageJsonComplete(object: unknown): object is PackageJsonProperties {
        return (this.checkPackageJsonComplete(object) === "")
    }
    constructor(keys: T) {
        const packageJSON: unknown = JSON.parse(readFileSync(resolve(__dirname, "../../../../package.json")).toString());
        if (!this.isPackageJsonComplete(packageJSON))
            throw new TypeError(this.checkPackageJsonComplete("While parsing `package.json`: "+packageJSON));
        const newObj = ({} as Pick<PackageJsonProperties, T[number]>)
        for (const key of Array.from(new Set(keys)))
            (newObj as Record<string,unknown>)[key] = packageJSON[key]
        this.data = newObj;
    }
}

const packageJson = new PackageJSON(["homepage", "name", "repository", "author"]);
export default packageJson;