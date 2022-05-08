/* csp.ts – Content Security Policy generation */

import { AppConfig } from './config';
const t = (new AppConfig()).get().csp.thirdparty;

/* === Default + script === */

let csp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.discordapp.com/animations/";

if (t.hcaptcha)
    csp += " https://*.hcaptcha.com https://hcaptcha.com";

if (t.paypal)
    csp += " https://www.paypalobjects.com https://checkout.paypal.com";

if (t.spotify)
    csp += " https://open.scdn.co";

if (t.reddit)
    csp += " https://www.redditstatic.com";

if (t.twitter)
    csp += " https://abs.twimg.com/web-video-player/";

if (t.twitch)
    csp += " https://static.twitchcdn.net/assets/";

if (t.vimeo)
    csp += " https://f.vimeocdn.com/p/";

/* === Worker scripts === */

csp += "; worker-src 'self'";

if (t.twitch)
    csp += " blob: https://player.twitch.tv";

/* === Style === */

csp += "; style-src 'self' 'unsafe-inline' https://cdn.discordapp.com";

if (t.hcaptcha)
    csp += " https://*.hcaptcha.com https://hcaptcha.com";

if (t.reddit)
    csp += " https://www.redditstatic.com";

if (t.twitch)
    csp += " https://static.twitchcdn.net/assets/";

if (t.vimeo)
    csp += " https://f.vimeocdn.com/p/";

/* === Images === */

csp += "; img-src 'self' blob: data: https://*.discordapp.net https://*.discordapp.com https://*.discord.com";

if (t.spotify)
    csp += " https://open.scdn.co";

if (t.youtube)
    csp += " https://i.ytimg.com https://*.youtube.com";

if (t.gif) {
    csp += " https://i.imgur.com https://*.gfycat.com https://media.tenor.co";
    csp += " https://media.tenor.com https://c.tenor.com https://*.giphy.com";
}
if (t.paypal)
    csp += " https://checkout.paypal.com";

if (t.hcaptcha)
    csp += " https://*.hcaptcha.com https://hcaptcha.com";

if (t.reddit)
    csp += " https://www.redditstatic.com";

if (t.twitter)
    csp += " https://pbs.twimg.com/ext_tw_video_thumb/";

if (t.twitch)
    csp += " https://static-cdn.jtvnw.net/jtv_user_pictures/";

if (t.vimeo)
    csp += " https://i.vimeocdn.com"

/* === Connect === */

csp += "; connect-src 'self' https://status.discordapp.com https://status.discord.com";
csp += " https://discordapp.com https://discord.com https://cdn.discordapp.com";
csp += " https://media.discordapp.net https://router.discordapp.net wss://*.discord.gg";
csp += " https://best.discord.media https://latency.discord.media wss://*.discord.media";

if (t.hcaptcha) 
    csp += " https://*.hcaptcha.com https://hcaptcha.com";

if (t.spotify)
    csp += " wss://dealer.spotify.com https://api.spotify.com";

if (t.twitch) 
    csp += " https://api.twitch.tv/v5/channels/";

if (t.algolia)
    csp += " https://*.algolianet.com https://*.algolia.net";

if (t.youtube)
    csp += " https://*.googlevideo.com";

if (t.reddit)
    csp += " https://v.redd.it";

if (t.twitter)
    csp += " https://api.twitter.com/1.1/guest/activate.json https://api.twitter.com/1.1/videos/tweet/config/ https://video.twimg.com/ext_tw_video/";

if (t.twitch)
    csp += " https://gql.twitch.tv/gql https://spade.twitch.tv/track https://static.twitchcdn.net/assets/ https://usher.ttvnw.net/api/channel/hls/ https://*.hls.ttvnw.net/v1/playlist/ https://*.hls.ttvnw.net/v1/segment/";

if (t.vimeo)
    csp += " https://fresnel.vimeocdn.com/add/ https://24vod-adaptive.akamaized.net/";

/* === Media === */

csp += "; media-src 'self' blob: https://*.discordapp.net https://*.discord.com https://*.discordapp.com";

if (t.gif) {
    csp += " https://*.gfycat.com https://*.giphy.com https://i.imgur.com";
    csp += " https://media.tenor.co https://media.tenor.com https://c.tenor.com";
}
if (t.streamable)
    csp += " https://streamable.com";

if (t.youtube)
    csp += " https://*.youtube.com";

if (t.twitter)
    csp += " https://twitter.com/i/videos/tweet/";

if (t.reddit)
    csp += " https://v.redd.it";

if (t.vimeo)
    csp += " https://vod-progressive.akamaized.net";

/* === Frame === */

csp += "; frame-src https://discordapp.com/domain-migration discord:";
csp += " https://*.discordsays.com https://*.watchanimeattheoffice.com";

if (t.hcaptcha)
    csp += " https://*.hcaptcha.com https://hcaptcha.com";

if (t.paypal)
    csp += " https://checkout.paypal.com";

if (t.vimeo)
    csp += " https://player.vimeo.com";

if (t.youtube)
    csp += " https://www.youtube.com/embed/";

if (t.soundcloud)
    csp += " https://w.soundcloud.com/player/";

if (t.audius)
    csp += " https://audius.co/embed/";

if (t.spotify)
    csp += " https://open.spotify.com/embed/";

if (t.reddit)
    csp += " https://www.redditmedia.com/mediaembed/";

if (t.twitter)
    csp += " https://twitter.com/i/videos/tweet/";

if (t.twitch)
    csp += " https://player.twitch.tv";

/* === Child === */

if (t.paypal)
    csp += "; child-src 'self' https://checkout.paypal.com"; // PayPal
/**
 * Content Security Policy header.
 * 
 * Contains a whitelist of the websites that WebCord is allowed to connect.
 * By defaults, all Discord and thirdparty websites declared there are
 * allowed to connect.
 * 
 * This can be configured in settings.
 */
export const discordContentSecurityPolicy = csp;