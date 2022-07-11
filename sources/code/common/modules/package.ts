/*
 * global/package.ts – Scripts, types and typeguards for `package.json` file.
 */

import { resolve } from "path";
import { parse } from "semver";
import { readFileSync, existsSync } from "fs";
import spdxParse from "spdx-expression-parse";

interface PersonObject {
	name: string,
	email?: string,
	url?: string;
}

export type PersonAny = string & PersonObject
export type PersonLike = string | PersonObject

export interface PackageJsonProperties {
	/** Node.js-friendly application name. */
	name: string,
    /** Node package description. */
    description: string,
	/** Node package version, must be parsable by `semver`. */
	version: string,
	/** Node package author. */
	author?: PersonLike,
    /** Application license. */
    license: string,
	/** Array of application code contributors. */
	contributors?: Array<PersonLike>,
	/** Application homepage (`Readme.md` file). */
	homepage?: string,
	/** Application repository. */
	repository: string & {
		/** Repository type (e.g. `git`). */
		type: string,
		/** Repository URL (e.g `git+https://example.com`) */
		url: string;
	};
    /** Application dependencies. */
    dependencies?: Record<string, string>,
    /** Application development dependencies. */
    devDependencies?: Record<string, string>
}

/**
 * Name says it well. A `RegExp` that *magically* splits string to Person values.
 */
const personMagic = /^((?:.*?(?=\s*(?:<[^ ]*>|\([^ ]*\)))|.*?))(?: <([^ ]*)>)? *(?:\((.*)\))?$/;

export class Person {
  /** Person name (can be either a nickname or full name). */
  public readonly name:string;
  /** Valid email of the person, e.g. <person@example.com>. */
  public readonly email?:string|undefined;
  /** An URL to the person's webpage, e.g. <https://example.com/person>. */
  public readonly url?:string|undefined;
  public toString():string {
    return (this.name !== "[Anonymous]" ? this.name : "")+
      (this.email ? " <" + this.email + ">" : "")+
      (this.url   ? " (" + this.url   + ")" : "");
  }
  constructor(value:PersonLike) {
    if((value as PersonObject) instanceof Object) {
      this.name  = (value as PersonObject).name;
      this.email = (value as PersonObject).email;
      this.url   = (value as PersonObject).url;
    } else {
      const match = (value as string).match(personMagic);
      this.name  = (match?.[1] ?? "[Anonymous]").trimEnd();
      this.email = match?.[2] ??   undefined;
      this.url   = match?.[3] ??   undefined;
    }
  }
}

/**
 * A class to read and validate any `package.json` file.
 * 
 * To avoid leakage of some properties (like `scripts`) to the malicious code,
 * this class is not able to return any value from the `package.json`.
 */
export class PackageJSON<T extends Array<keyof PackageJsonProperties>> {
  readonly data;
  private isEmail(email: string|undefined|null): boolean {
    return /^[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*@[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*\.[a-z]+$/
      .test(email??"");
  }
  private isPersonObject(variable: unknown): variable is PersonObject {
    // Variable is an Object, which has 'name' key and optionally 'email' and 'url' keys.
    if (variable instanceof Object) {
      if (typeof (variable as PersonAny).name !== "string")
        return false;
    
      if ((variable as PersonAny).email !== undefined && typeof (variable as PersonAny).email !== "string")
        return false;
    
      // Validate Emails if present
      else if(typeof (variable as PersonAny).email === "string" && !this.isEmail((variable as PersonAny).email))
        return false;
    
      if ((variable as PersonAny).url !== undefined && typeof (variable as PersonAny).url !== "string")
        return false;
    } else {
      return false;
    }
    return true;
  }
  /**
   * A TypeGuard to check whenever a property is in `package.json` person
   * field format.
   */
  private isPerson(variable: unknown): variable is PersonAny {
    // Check #1: Variable might be PersonObject:
    if(this.isPersonObject(variable)) return true;
    
    // Check #2: When Person is string, it shall be in `name <email> [url]` format.
    if (typeof variable === "string"){
      const match = variable.match(personMagic);
      return (
        (match !== null && match[1] !== undefined)
      ) && (
        match[2] !== undefined ? this.isEmail(match[2]) : true
      );
    }
    return false;
  }
  /** A function used to return the details about the `package.json` wrong configuration. */
  private checkPackageJsonComplete(object: unknown): string {
    // Check 1: `package.json` is a JSON object.
    if(!(object instanceof Object))
      return "'object' is actually not an object (but '"+typeof object+"')!";
    else for(const key in object)
      if(typeof key !== "string")
        return "'object' keys are not of the type 'string'.";

    // Check 2: 'contributors' is array of 'Person'
    if ((object as PackageJsonProperties).contributors instanceof Object)
      for (const key of (object as Record<string, Array<unknown>>)["contributors"]??[])
        if (!this.isPerson(key)) return "Contributors field is of invalid type.";
    
    // Check 3: 'author' is 'Person' when definied
    if((object as PackageJsonProperties).author !== undefined)
      if (!this.isPerson((object as PackageJsonProperties).author))
        return "Author field is of invalid type.";
    
    // Check 4: 'name', 'description' and 'license' are strings.
    for (const stringKey of ["name", "description", "license"])
      if (typeof ((object as { [key: string]: string; })[stringKey]) !== "string")
        return "'"+stringKey+"' is not assignable to type 'string'.";
        
    // Check 5: 'repository' is either string or object
    if (typeof (object as PackageJsonProperties).repository !== "string" && typeof (object as PackageJsonProperties).repository !== "object")
      return "Repository field is neither of type 'string' nor 'object'.";
    
    // Check 6: As object, 'repository' has 'type' and 'url' keys of type 'string'
    for (const stringKey of ["type", "url"]) {
      const repository = (object as PackageJsonProperties).repository;
      if (typeof (repository) === "object" && typeof ((repository as { [key: string]: string; })[stringKey]) !== "string")
        return "Repository object does not contain a '"+stringKey+"' property.";
    }
    
    // Check 7: `name` field is correct package name.
    if((object as PackageJsonProperties).name.match(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/) === null)
      return "'"+(object as PackageJsonProperties).name+"' is not a valid Node.js package name.";
    
    // Check 8: `version` is a `semver`-parsable string
    if(typeof (object as PackageJsonProperties).version === "string") {
      if (parse((object as PackageJsonProperties).version) === null)
        return "Version "+(object as PackageJsonProperties).version+" can't be parsed to 'semver'.";
    } else {
      return "Version property is not assignable to type 'string'!";
    }

    // Check 9: `devDependencies` or `dependencies` are either `undefinied` or `Record<string,string>`:
    for(const key of ["dependencies", "devDependencies"]) {
      const testValue = (object as Record<string,unknown|undefined>)[key];
      if (!/undefined|object/.test(typeof testValue))
        return "Property '"+key+"' is of invalid type!";
      else if(testValue instanceof Object) {
        for(const key in testValue)
          if(typeof key !== "string") {
            const key2string:unknown = (key as Record<string,unknown>)?.toString();
            let keyString:string;
            if(typeof key2string === "string")
              keyString = key2string;
            else
              keyString = "[unknown]";
            return "Package name '"+keyString+"' is not a valid 'string'.";
          } else if (typeof (testValue as Record<string, unknown>)[key] !== "string")
            return "Version of the package '"+key+"' is not of type 'string'.";
      }
    }

    // Check 10: `license` is a valid string:
    if(!/^UNLICEN[SC]ED|SEE LICEN[CS]E IN .+$/.test((object as PackageJsonProperties).license))
      try {
        spdxParse((object as PackageJsonProperties).license);
      } catch {
        return "License field is in wrong format.";
      }


    // Check 11: `homepage` is either `undefinied` or `string`
    if((object as PackageJsonProperties).homepage !== undefined && typeof (object as PackageJsonProperties).homepage !== "string")
      return "Homepage property is neither 'string' nor 'undefinied'.";
    // All checks passed!
    return "";
  }
  private findProjectPackageJson() {
    let cwd = __dirname;
    while(!existsSync(resolve(cwd, "package.json")) && cwd !== "/") {
      cwd = resolve(cwd, "../");
    }
    return resolve(cwd, "package.json");
  }
  /**
   * A typeguard that verifies if the `package.json` is in the correct format.
   * 
   * **Warning**: These checks includes even the syntax of some strings like
   * for the `[Person].email` or the `name` top-level property.
   */
  public isPackageJsonComplete(object: unknown): object is PackageJsonProperties {
    return (this.checkPackageJsonComplete(object) === "");
  }
  constructor(keys: T, packageJsonFile?: string) {
    const file = packageJsonFile ?? this.findProjectPackageJson();
    const packageJSON: unknown = JSON.parse(readFileSync(file).toString());
    if (!this.isPackageJsonComplete(packageJSON))
      throw new TypeError("While parsing `package.json`: "+this.checkPackageJsonComplete(packageJSON));
    const newObj: Partial<Pick<PackageJsonProperties, T[number]>> = {};
    for (const key of Array.from(new Set(keys)))
      (newObj as Record<string,unknown>)[key] = packageJSON[key];
    this.data = newObj as Pick<PackageJsonProperties, T[number]>;
  }
}

const packageJson = new PackageJSON(["homepage", "name", "repository", "author", "contributors"]);
export default packageJson;