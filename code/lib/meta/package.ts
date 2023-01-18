/** Wrapper for package.cts, for consitent import between CJS and ESM. */

import packageModule, { PackageJSON, Person } from "#cjs:/lib/meta/package";

export default packageModule.default;

export {
  PackageJSON,
  Person
}