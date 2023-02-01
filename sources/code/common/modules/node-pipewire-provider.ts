// eslint-disable-next-line
// @ts-ignore - will also ignore
import type PipewireModule from "node-pipewire";

type NullOrT<T> = T extends any ? null : T;
type TypoOfPipewireModule = NullOrT<typeof PipewireModule>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const pw: TypoOfPipewireModule = (() => { try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-return
  return require("node-pipewire") as unknown as TypoOfPipewireModule;
} catch(e) {
  console.log(e);
  return null;
}})();
