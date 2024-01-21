/**
 * Removes tracking from known URIs.
 */
export default function removeTrackingFromURIs(url:URL|string) {
  const urlObj:URL = typeof url === "string" ? new URL(url) : url;
  switch(urlObj.hostname) {
    case "cdn.discordapp.com":
      for(const el of [...urlObj.searchParams])
        urlObj.searchParams.delete(el[0],el[1]);
      break;
  }
  return urlObj;
}