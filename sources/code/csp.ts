/* csp.ts – Content Security Policy generation */

import { configData } from "./mainGlobal";

// Default + script

let csp = "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.discordapp.com/animations/";
if (!configData.csp.thirdparty.hcaptcha) {
    csp += " https://*.hcaptcha.com https://hcaptcha.com"; // hCaptcha
}
if (!configData.csp.thirdparty.paypal) {
    csp += " https://www.paypalobjects.com https://checkout.paypal.com"; // PayPal
}

// Style

csp += "; style-src 'self' 'unsafe-inline' https://cdn.discordapp.com";
if (!configData.csp.thirdparty.hcaptcha) {
    csp += " https://*.hcaptcha.com https://hcaptcha.com"; // hCaptcha
}

// Images

csp += "; img-src 'self' blob: data: https://*.discordapp.net https://*.discordapp.com https://*.discord.com";
if (!configData.csp.thirdparty.spotify) {
    csp += " https://i.scdn.co"; // Spotify
}
if (!configData.csp.thirdparty.youtube) {
    csp += " https://i.ytimg.com https://*.youtube.com"; // YouTube
}
if (!configData.csp.thirdparty.gif) {
    csp += " https://i.imgur.com https://*.gfycat.com https://media.tenor.co"; // GIF
    csp += " https://media.tenor.com https://c.tenor.com https://*.giphy.com"; // Providers
}
if (!configData.csp.thirdparty.paypal) {
    csp += " https://checkout.paypal.com"; // PayPal
}
if (!configData.csp.thirdparty.hcaptcha) {
    csp += " https://*.hcaptcha.com https://hcaptcha.com"; // hCaptcha
}

// Connect

csp += "; connect-src 'self' https://status.discordapp.com https://status.discord.com";
csp += " https://discordapp.com https://discord.com https://cdn.discordapp.com";
csp += " https://media.discordapp.net https://router.discordapp.net wss://*.discord.gg";
csp += " https://best.discord.media https://latency.discord.media wss://*.discord.media";
if (!configData.csp.thirdparty.hcaptcha) {
    csp += " https://*.hcaptcha.com https://hcaptcha.com"; // hCaptcha
}
if (!configData.csp.thirdparty.spotify) {
    csp += " wss://dealer.spotify.com https://api.spotify.com"; // Spotify
}
if (!configData.csp.thirdparty.twitch) {
    csp += " ttps://api.twitch.tv"; // Twitch
}
if (!configData.csp.thirdparty.algolia) {
    csp += " https://*.algolianet.com https://*.algolia.net"; // Algolia
}

// Media

csp += "; media-src 'self' blob: https://*.discordapp.net https://*.discord.com https://*.discordapp.com";
if (!configData.csp.thirdparty.gif) {
    csp += " https://*.gfycat.com https://*.giphy.com https://i.imgur.com"; // GIF providers
    csp += " https://media.tenor.co https://media.tenor.com https://c.tenor.com";
}
if (!configData.csp.thirdparty.streamable) {
    csp += " https://streamable.com"; // Streamable
}
if (!configData.csp.thirdparty.youtube) {
    csp += " https://*.youtube.com"; // YouTube
}
if (!configData.csp.thirdparty.twitter) {
    csp += " https://twitter.com"; // Twitter
}

// Frame

csp += "; frame-src https://discordapp.com/domain-migration discord:";
csp += " https://*.discordsays.com https://*.watchanimeattheoffice.com";
if (!configData.csp.thirdparty.hcaptcha) {
    csp += " https://*.hcaptcha.com https://hcaptcha.com"; // hCaptcha
}
if (!configData.csp.thirdparty.paypal) {
    csp += " https://checkout.paypal.com"; // PayPal
}
if (!configData.csp.thirdparty.vimeo) {
    csp += " https://player.vimeo.com"; // Vimeo
}
if (!configData.csp.thirdparty.youtube) {
    csp += " https://www.youtube.com/embed/"; // YouTube
}
if (!configData.csp.thirdparty.soundcloud) {
    csp += " https://w.soundcloud.com/player/"; // Vimeo
}
if (!configData.csp.thirdparty.audius) {
    csp += " https://audius.co/embed/"; // Vimeo
}
if (!configData.csp.thirdparty.spotify) {
    csp += " https://open.spotify.com/embed/"; // Vimeo
}

// Child
if (!configData.csp.thirdparty.paypal) {
    csp += "; child-src 'self' https://checkout.paypal.com"; // PayPal
}

/**
 * Content Security Policy header.
 * 
 * Contains a whitelist of the websites that WebCord is allowed to connect.
 * By defaults, all Discord and thirdparty websites declared there are
 * allowed to connect.
 * 
 * This can be configured in `Settings → CSP Header → Third party websites`.
 */
export const discordContentSecurityPolicy = csp;