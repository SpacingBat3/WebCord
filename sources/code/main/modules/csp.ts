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

export default class CSP {
  private values: {
        object: cspObject,
        string: string
    };
  private string2object(value: string) {
    const raw = value.split(/;\s+/);
    const record: cspObject = {};
    for(const element of raw) {
      const [rule, value] = element.split(cspKeysRegExp);
      if(rule === undefined || value === undefined) return;
      if(cspKeys.includes(rule as keyof typeof record))
        record[rule as keyof typeof record] = value;
    }
    return record;
  }
  private object2string(object: cspObject) {
    return Object.entries(object)
      .map(entry => entry.join(" "))
      .join("; ");
  }
  public toObject() {
    return this.values.object;
  }
  public toString() {
    return this.values.string;
  }
  public static merge(...policies:CSP[]):CSP {
    let partial: cspObject = {};
    for(const policy of policies) {
      const policyObject = policy.toObject();
      if(Object.entries(partial).length === 0)
        partial = policyObject;
      else {
        const keys = new Set([...Object.keys(partial), ...Object.keys(policyObject)]) as Set<keyof cspObject>;
        for(const key of keys) if(key in policyObject)
          if(key in partial)
            partial[key] += " "+(policyObject[key] as string);
          else
            partial[key] = policyObject[key];
      }
    }
    return new CSP(partial);
  }
  constructor(value: string|cspObject) {
    if(typeof value !== "string")
      this.values = {
        object: value,
        string: this.object2string(value)
      };
    else
      this.values = {
        object: this.string2object(value) ?? {},
        string: this.object2string(this.string2object(value) ?? {})
      };
  }
}

const csp: {base:CSP}&cspTP<CSP> = {
  base: new CSP({
    "default-src": "'self'",
    "script-src": "'self' 'unsafe-eval' 'unsafe-inline' "+
      "https://cdn.discordapp.com/animations/",
    "worker-src": "'self'",
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
  algolia: new CSP({
    "connect-src": "https://*.algolianet.com https://*.algolia.net"
  }),
  audius: new CSP({ "frame-src": "https://audius.co/embed/" }),
  gif: new CSP ({
    "img-src": "https://i.imgur.com https://*.gfycat.com "+
      "https://media.tenor.co https://media.tenor.com "+
      "https://c.tenor.com https://*.giphy.com",
    "media-src": "https://i.imgur.com https://*.gfycat.com "+
      "https://media.tenor.co https://media.tenor.com "+
      "https://c.tenor.com https://*.giphy.com",
  }),
  googleStorageApi: new CSP({
    "connect-src": "https://discord-attachments-uploads-prd.storage.googleapis.com/"
  }),
  hcaptcha: new CSP({
    "script-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "style-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "img-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "connect-src": "https://*.hcaptcha.com https://hcaptcha.com",
    "frame-src": "https://*.hcaptcha.com https://hcaptcha.com",
  }),
  paypal: new CSP({
    "script-src": "https://www.paypalobjects.com https://checkout.paypal.com",
    "img-src": "https://checkout.paypal.com",
    "frame-src": "https://checkout.paypal.com",
    "child-src": "'self' https://checkout.paypal.com"

  }),
  reddit: new CSP({
    "script-src": "https://www.redditstatic.com",
    "img-src": "https://www.redditstatic.com",
    "connect-src": "https://v.redd.it",
    "media-src": "https://v.redd.it",
    "frame-src": "https://www.redditmedia.com/mediaembed/"
  }),
  soundcloud: new CSP({ "frame-src": "https://w.soundcloud.com/player/" }),
  spotify: new CSP({
    "script-src": "https://open.scdn.co",
    "img-src": "https://open.scdn.co https://i.scdn.co/",
    "connect-src": "wss://dealer.spotify.com https://api.spotify.com",
    "frame-src": "https://open.spotify.com/embed/"
  }),
  streamable: new CSP({ "media-src": "https://streamable.com" }),
  twitch: new CSP({
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
  twitter: new CSP({
    "script-src": "https://abs.twimg.com/web-video-player/",
    "img-src": "https://pbs.twimg.com/ext_tw_video_thumb/",
    "connect-src": "https://api.twitter.com/1.1/guest/activate.json "+
      "https://api.twitter.com/1.1/videos/tweet/config/ "+
      "https://video.twimg.com/ext_tw_video/",
    "media-src": "https://twitter.com/i/videos/tweet/",
    "frame-src": "https://twitter.com/i/videos/tweet/"
  }),
  vimeo: new CSP({
    "script-src": "https://f.vimeocdn.com/p/",
    "style-src": "https://f.vimeocdn.com/p/",
    "img-src": "https://i.vimeocdn.com",
    "connect-src": "https://fresnel.vimeocdn.com/add/ "+
       "https://24vod-adaptive.akamaized.net/",
    "media-src": "https://vod-progressive.akamaized.net",
    "frame-src": "https://player.vimeo.com"
  }),
  youtube: new CSP({
    "img-src": "https://i.ytimg.com https://*.youtube.com",
    "connect-src": "https://*.googlevideo.com",
    "media-src": "https://*.youtube.com",
    "frame-src": "https://www.youtube.com/embed/"
  })
};

let cache: {configValues: string, result:CSP} | undefined;
export function getWebCordCSP(additionalPolicies: CSP[]|[] = []) {
  const config = new AppConfig().get().settings.advanced.cspThirdParty;
    type parties = keyof typeof config;
    type cspFilter = (value:CSP|undefined) => value is CSP;
    if(cache && cache.configValues === Object.values(config).join())
      return cache.result;
    cache = {
      configValues: Object.values(config).join(),
      result: CSP.merge(
        csp.base,
        ...Object.keys(config)
          .map((key) => {
            if(config[key as parties])
              return csp[key as parties];
            else
              return undefined;
          })
          .filter(((value) => value !== undefined) as cspFilter),
        ...additionalPolicies
      )
    };
    return cache.result;
}