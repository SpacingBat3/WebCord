import { wLog } from "../../global";
import preloadCapturer from "../capturer";
import preloadCosmetic from "../cosmetic";

preloadCapturer();
preloadCosmetic();

wLog("Everything has been preloaded successfully!");