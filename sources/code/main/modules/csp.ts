import { AppConfig, cspTP } from "./config";

const cspKeys = [
  "default-src",
  "script-src",
  "worker-src",
  "connect-src",
  "style-src",
  "img-src",
  "font-src",
  "media-src",
  "frame-src",
  "child-src"
] as const;

const cspKeysRegExp = new RegExp("(?<="+cspKeys.join("|")+")\\s+");

type cspObject = Partial<Record<(typeof cspKeys)[number],string>>;

/**
 * A class used to manipulate and build Content Security Policy from objects
 * and strings with the specific structure.
 */
class CSPBuilder {
  #value!: cspObject;
  /**
   * Converts CSP-like string to builder-compilant object.
   */
  #string2object(value: string):cspObject {
    return Object.fromEntries(value
      .split(/;\s+/)
      .map(element => element.split(cspKeysRegExp,2) as [string|undefined, string|undefined])
      .filter((element => element[0] !== undefined && element[1] !== undefined &&
        cspKeys.includes(element[0] as (typeof cspKeys)[number])) as
        (v:[string|undefined,string|undefined]) => v is [typeof cspKeys[number],string]
      )
    );
  }
  /**
   * Generates final Content Security Policy string, which can be used directly
   * in HTTP headers.
   */
  public build() {
    return Object.entries(this.value)
      .map(entry => entry.join(" "))
      .join("; ");
  }
  public set value(value: string|cspObject) {
    if(value instanceof Object && Object
      .keys(value)
      .map(key => cspKeys.includes(key as typeof cspKeys[number]))
      .reduce((prev,cur) => prev && cur, true)
    )
      this.#value = value;
    else if(typeof value === "string")
      this.#value = this.#string2object(value);
    else
      throw new TypeError("Value of type other than 'cspObject' or 'string' cannot be assigned to the class.");
  }
  public get value():cspObject {
    return this.#value;
  }
  /**
   * Merges two or more builders into one.
   * 
   * @param builders Any `CSPBuilder` which should be merged with another ones.
   * 
   * @returns Computed `CSPBuilder` with merged object values from the `builders`.
   */
  public static merge(...builders:CSPBuilder[]):CSPBuilder {
    if(builders.find(builder => !(builder instanceof CSPBuilder)) !== undefined)
      throw new TypeError("One of the argument is not a 'CSPBuilder' class!");
    switch(builders.length) {
      case 1: return (builders as [CSPBuilder])[0];
      default: return new CSPBuilder(builders
        .map(builder => builder.value)
        .filter(value => Object.keys(value).length !== 0)
        .reduce((prev,cur,index) => {
          if(index === 0) return cur;
          (Object.keys(cur) as (keyof cspObject)[]).forEach(key => {
            const policy = cur[key];
            if(policy === undefined)
              return;
            if(prev[key] !== undefined)
              prev[key] += " " + policy;
            else
              prev[key] = policy;
          },{});
          return prev;
        })
      );
    }
  }
  constructor(value: string|cspObject = {}) {
    this.value = value;
  }
}

const builders: {base:CSPBuilder}&cspTP<CSPBuilder> = {
  base: new CSPBuilder({
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-eval' 'unsafe-inline' "+
      "https://cdn.discordapp.com/animations/",
    "worker-src": "'self'",
    "font-src": "'self'",
    "style-src": "'self' 'unsafe-inline' https://cdn.discordapp.com",
    "img-src": "'self' blob: data: https://*.discordapp.net "+
      "https://*.discordapp.com https://*.discord.com",
    "connect-src": "'self' https://status.discordapp.com "+
      "https://status.discord.com https://discordapp.com https://discord.com "+
      "https://cdn.discordapp.com https://media.discordapp.net "+
      "https://router.discordapp.net wss://*.discord.gg "+
      "https://best.discord.media https://latency.discord.media "+
      "wss://*.discord.media",
    "media-src": "'self' blob: https://*.discordapp.net https://*.discord.com "+
      "https://*.discordapp.com",
    "frame-src": "https://discordapp.com/domain-migration "+
      "https://*.discordsays.com https://*.watchanimeattheoffice.com",
  }),
  algolia: new CSPBuilder({
    "connect-src": "https://*.algolianet.com https://*.algolia.net"
  }),
  audius: new CSPBuilder({ "frame-src": "https://audius.co/embed/" }),
  gif: new CSPBuilder ({
    "img-src": "https://i.imgur.com https://*.gfycat.com "+
      "https://media.tenor.co https://media.tenor.com "+
      "https://c.tenor.com https://*.giphy.com",
    "media-src": "https://i.imgur.com https://*.gfycat.com "+
      "https://media.tenor.co https://media.tenor.com "+
      "https://c.tenor.com https://*.giphy.com",
  }),
  googleStorageApi: new CSPBuilder({
    "connect-src": "https://discord-attachments-uploads-prd.storage.googleapis.com/"
  }),
  hcaptcha: new CSPBuilder({
    "script-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "style-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "img-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "connect-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "frame-src": "https://*.hcaptcha.com https://hcaptcha.com",
  }),
  paypal: new CSPBuilder({
    "script-src": "https://www.paypalobjects.com https://checkout.paypal.com",
    "img-src": "https://checkout.paypal.com",
    "frame-src": "https://checkout.paypal.com",
    "child-src": "'self' https://checkout.paypal.com"

  }),
  reddit: new CSPBuilder({
    "script-src": "https://www.redditstatic.com",
    "img-src": "https://www.redditstatic.com",
    "connect-src": "https://v.redd.it",
    "media-src": "https://v.redd.it",
    "frame-src": "https://www.redditmedia.com/mediaembed/"
  }),
  soundcloud: new CSPBuilder({ "frame-src": "https://w.soundcloud.com/player/" }),
  spotify: new CSPBuilder({
    "script-src": "https://open.spotifycdn.com/cdn/build/embed/ "+
      "https://open.spotifycdn.com/cdn/build/embed-legacy/",
    "img-src": "https://open.spotifycdn.com/cdn/images/ https://i.scdn.co/image/",
    "style-src": "https://open.spotifycdn.com/cdn/build/embed/ "+
      "https://open.spotifycdn.com/cdn/build/embed-legacy/",
    "connect-src": "wss://dealer.spotify.com https://api.spotify.com "+
      "https://open.spotifycdn.com/cdn/generated-locales/embed/",
    "frame-src": "https://open.spotify.com/embed/",
    "media-src": "https://p.scdn.co/mp3-preview/"
  }),
  streamable: new CSPBuilder({ "media-src": "https://streamable.com" }),
  twitch: new CSPBuilder({
    "script-src": "https://static.twitchcdn.net/assets/",
    "worker-src": "blob: https://player.twitch.tv",
    "style-src": "https://static.twitchcdn.net/assets/",
    "img-src": "https://static-cdn.jtvnw.net/jtv_user_pictures/",
    "connect-src": "https://api.twitch.tv/v5/channels/ "+
      "https://gql.twitch.tv/gql https://spade.twitch.tv/track "+
      "https://static.twitchcdn.net/assets/ "+
      "https://usher.ttvnw.net/api/channel/hls/ "+
      "https://*.hls.ttvnw.net/v1/playlist/ "+
      "https://*.hls.ttvnw.net/v1/segment/",
    "frame-src": "https://player.twitch.tv"
  }),
  twitter: new CSPBuilder({
    "script-src": "https://abs.twimg.com/web-video-player/",
    "img-src": "https://pbs.twimg.com/ext_tw_video_thumb/",
    "connect-src": "https://api.twitter.com/1.1/guest/activate.json "+
      "https://api.twitter.com/1.1/videos/tweet/config/ "+
      "https://video.twimg.com/ext_tw_video/",
    "media-src": "https://twitter.com/i/videos/tweet/",
    "frame-src": "https://twitter.com/i/videos/tweet/"
  }),
  vimeo: new CSPBuilder({
    "script-src": "https://f.vimeocdn.com/p/",
    "style-src": "https://f.vimeocdn.com/p/",
    "img-src": "https://i.vimeocdn.com",
    "connect-src": "https://fresnel.vimeocdn.com/add/ "+
       "https://24vod-adaptive.akamaized.net/",
    "media-src": "https://vod-progressive.akamaized.net",
    "frame-src": "https://player.vimeo.com"
  }),
  youtube: new CSPBuilder({
    "img-src": "https://i.ytimg.com https://*.youtube.com",
    "script-src": "https://www.youtube.com/iframe_api "+
      "https://www.youtube.com/s/player/",
    "connect-src": "https://*.googlevideo.com",
    "media-src": "https://*.youtube.com",
    "frame-src": "https://www.youtube.com/embed/"
  })
};

let cache: Readonly<{configValues: string; result:string}> | undefined;

export function getWebCordCSP(additionalPolicies: CSPBuilder[]|[] = []) {
  const config = new AppConfig().value.settings.advanced.cspThirdParty;
    type parties = keyof typeof config;
    type cspFilter = (value:CSPBuilder|undefined) => value is CSPBuilder;
    if(cache && cache.configValues === Object.values(config).join())
      return cache.result;
    else if(cache)
      console.debug("[CSP] Policy changed! Recalculating cache...");
    else
      console.debug("[CSP] Initializing cache for quicker responses...");
    cache = Object.freeze({
      configValues: Object.values(config).join(),
      result: CSPBuilder.merge(
        builders.base,
        ...Object.keys(config)
          .map((key) => {
            if(config[key as parties])
              return builders[key as parties];
            else
              return undefined;
          })
          .filter(((value) => value instanceof CSPBuilder) as cspFilter),
        ...additionalPolicies
      ).build()
    });
    return cache.result;
}