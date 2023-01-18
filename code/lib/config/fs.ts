import { readFile, writeFile } from "node:fs/promises";
import { readFileSync, writeFileSync, type PathOrFileDescriptor } from "node:fs";

//import { typeMerge } from "#esm:/lib/base";

const enum BlockMode {
  Async,
  Sync
}

abstract class Config<T extends Record<string,unknown>> {
  readonly #writeMethod: typeof writeFile | typeof writeFileSync;
  readonly #readMethod: typeof readFile | typeof readFileSync;
  readonly #path: PathOrFileDescriptor;
  abstract isConfig: (value:unknown) => value is T;
  constructor(file: PathOrFileDescriptor, blockMode: BlockMode) {
    this.#path = file;
    switch(blockMode) {
      case BlockMode.Async:
        this.#writeMethod = writeFile;
        this.#readMethod = readFile;
        break;
      case BlockMode.Sync:
        this.#writeMethod = writeFileSync;
        this.#readMethod = readFileSync;
        break;
      default:
        throw new Error(`Unknown mode: '${blockMode}'.`, {cause: "(param) mode !== (enum) FSMode"});
    }
  }
}