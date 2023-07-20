/*
 * global/package.ts – Scripts, types and type guards for `package.json` file.
 */

import { resolve } from "path";
import { valid, validRange } from "semver";
import { readFileSync, existsSync } from "fs";

interface PersonObject {
  name: string;
  email?: string;
  url?: string;
}

type PersonLike = string | PersonObject;

interface PackageJsonProperties {
  /** Node.js-friendly application name. */
  name: string;
  /** Node package description. */
  description: string;
  /** Node package version, must be parsable by `semver`. */
  version: string;
  /** Node package author. */
  author?: PersonLike;
  /** Application license. */
  license: string;
  /** Array of application code contributors. */
  contributors?: PersonLike[];
  /** Application homepage (`Readme.md` file). */
  homepage?: string;
  /** Application repository. */
  repository: string | {
    /** Repository type (e.g. `git`). */
    type: string;
    /** Repository URL (e.g `git+https://example.com`) */
    url: string;
  };
  /** Application dependencies. */
  dependencies?: Record<string, string>;
  /** Application development dependencies. */
  devDependencies?: Record<string, string>;
}

const moduleRegexp = {
  /**
   * Name says it well. A `RegExp` that *magically* splits string to Person values.
   */
  personMagic: /^((?:.*?(?=\s*(?:<[^ ]*>|\([^ ]*\)))|.*?))(?: <([^ ]*)>)? *(?:\((.*)\))?$/,
};

export class Person {
  /** Person name (can be either a nickname or full name). */
  public readonly name:string;
  /** Valid email of the person, e.g. <person@example.com>. */
  public readonly email?:string|undefined;
  /** An URL to the person's webpage, e.g. <https://example.com/person>. */
  public readonly url?:string|undefined;
  public toString():string {
    return (this.name !== "[Anonymous]" ? this.name : "")+
      (this.email !== undefined ? " <" + this.email + ">" : "")+
      (this.url !== undefined   ? " (" + this.url   + ")" : "");
  }
  public static isPersonObject(variable: unknown): variable is PersonObject {
    // Variable is an Object, which has 'name' key and optionally 'email' and 'url' keys.
    if (variable instanceof Object) {
      if (typeof (variable as PersonObject).name !== "string")
        return false;
    
      if ((variable as PersonObject).email !== undefined &&
          typeof (variable as PersonObject).email !== "string")
        return false;
    
      if ((variable as PersonObject).url !== undefined &&
          typeof (variable as PersonObject).url !== "string")
        return false;
    } else {
      return false;
    }
    return true;
  }
  /**
   * A type guard to check whenever a property is in `package.json` person
   * field format.
   */
  public static isPerson(variable: unknown): variable is PersonLike {
    // Check #1: Variable might be PersonObject:
    if(this.isPersonObject(variable)) return true;
    
    // Check #2: When Person is string, it shall be in `name <email> [url]` format.
    if (typeof variable === "string"){
      const match = moduleRegexp.personMagic.exec(variable);
      return match?.[1] !== undefined;
    }
    return false;
  }
  constructor(value:PersonLike) {
    if((value as PersonObject) instanceof Object) {
      this.name  = (value as PersonObject).name;
      this.email = (value as PersonObject).email;
      this.url   = (value as PersonObject).url;
    } else {
      const match = moduleRegexp.personMagic.exec((value as string));
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
export class PackageJSON<T extends (keyof PackageJsonProperties)[]> {
  public readonly data;
  
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
      for (const key of (object as Record<string, unknown[]>)["contributors"]??[])
        if (!Person.isPerson(key)) return "Contributors field is of invalid type.";
    
    // Check 3: 'author' is 'Person' when defined
    if((object as PackageJsonProperties).author !== undefined)
      if (!Person.isPerson((object as PackageJsonProperties).author))
        return `Author field '${JSON.stringify((object as PackageJsonProperties|null|undefined)?.author)}' is of invalid type.`;
    
    // Check 4: 'name', 'description' and 'license' are strings.
    for (const stringKey of ["name", "description", "license"])
      if (typeof ((object as Record<string,string>)[stringKey]) !== "string")
        return "'"+stringKey+"' is not assignable to type 'string'.";
        
    // Check 5: 'repository' is either string or object
    if (typeof (object as PackageJsonProperties).repository !== "string" && typeof (object as PackageJsonProperties).repository !== "object")
      return "Repository field is neither of type 'string' nor 'object'.";
    
    // Check 6: As object, 'repository' has 'type' and 'url' keys of type 'string'
    for (const stringKey of ["type", "url"] as const) {
      const repository = (object as PackageJsonProperties).repository;
      if (typeof (repository) === "object" && typeof ((repository)[stringKey]) !== "string")
        return "Repository object does not contain a '"+stringKey+"' property.";
    }
    
    // Check 7: `name` field is correct package name.
    if((/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.exec((object as PackageJsonProperties).name)) === null)
      return "'"+(object as PackageJsonProperties).name+"' is not a valid Node.js package name.";
    
    // Check 8: `version` is a `semver`-parsable string
    if(typeof (object as PackageJsonProperties).version === "string") {
      if (valid((object as PackageJsonProperties).version) === null)
        return "Version "+(object as PackageJsonProperties).version+" can't be parsed to 'semver'.";
    } else {
      return "Version property is not assignable to type 'string'!";
    }

    // Check 9: `devDependencies` or `dependencies` are either `undefined` or `Record<string,string>`:
    for(const key of ["dependencies", "devDependencies"] as const) {
      const testValue = (object as PackageJsonProperties)[key];
      if (!/undefined|object/.test(typeof testValue))
        return "Property '"+key+"' is of invalid type!";
      else if(testValue instanceof Object) {
        for(const [key,value] of Object.entries(testValue))
          if(typeof key !== "string")
            return "Package name '"+JSON.stringify(key)+"' is not a valid 'string'.";
          else if (typeof value !== "string")
            return "Version of the package '"+key+"' is not of type 'string'.";
          else if (validRange(value) === null && value !== "latest" &&
              !/^[a-z]*:?[^/:]+\/[^/:]+/.test(value)) {
            return "Version '"+value+"' of the package '"+key+"' is not of the valid format.";
          }
      }
    }

    // Check 10: `homepage` is either `undefined` or `string`
    if((object as PackageJsonProperties).homepage !== undefined && typeof (object as PackageJsonProperties).homepage !== "string")
      return "Homepage property is neither 'string' nor 'undefined'.";

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
   * A type guard that verifies if the `package.json` is in the correct format.
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
      (newObj as Record<string,unknown>)[key] = Object.freeze(packageJSON[key]);
    this.data = Object.freeze(newObj as Pick<PackageJsonProperties, T[number]>);
  }
}

const packageJson = new PackageJSON(["homepage", "name", "repository", "author", "contributors"]);
export default packageJson;