import { ipcRenderer as ipc } from "electron/renderer";
import { basename, relative, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";

import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { sanitize } from "dompurify";
import hljs from "highlight.js";

import { protocols } from "../../common/global";

// Broken modules wrongly interpreted with Node16.

import {
  gfmHeadingId
  //@ts-expect-error due to TS14790
} from "marked-gfm-heading-id";

const htmlFileUrl = document.URL;

// Code highlighting and GFM heading IDs:

marked.use(
  //@ts-expect-error due to TS2379
  markedHighlight({
    highlight: (code,language) => hljs.getLanguage(language) ?
      hljs.highlight(code,{ language } ).value :
      code
  }),
  gfmHeadingId()
);

const menu = document.createElement("img");
menu.src = "../../icons/symbols/menu.svg";
menu.id = "menu-hamburger";

const menuHeader = document.createElement("p");

/**
 * Handles URL clicks – it will open websites in default browser and load
 * markdown files instead of trying it to open.
 */
function getId(url:string) {
  if (url.split("#").length > 1)
    return url.split("#")[1];
  return;
}

async function loadMarkdown(mdBody: HTMLElement, mdFile: string) {
  mdBody.innerHTML = sanitize(await marked.parse(readFileSync(mdFile).toString(), {async:true}));
}

function fixImages(container:HTMLElement) {
  // Fix logo URL in Readme files.
  const logo = container.querySelector<HTMLImageElement>('a[href="https://github.com/SpacingBat3/WebCord"] > picture > img');
  const logoPicture = logo?.parentNode ?? null;
  const logoAnchor = logoPicture?.parentElement ?? null;
  if(logo===null||logoPicture===null||logoAnchor===null) return;
  (logoPicture as HTMLPictureElement).remove();
  if(/\/sources\/assets\/web/.exec(logo.src))
    logo.src=logo.src.replace("/sources/assets/web","");
  else
    logo.src=logo.src.replace("/sources/assets","");
  const newLogo = logo.cloneNode();
  logoAnchor.appendChild(newLogo);

  // Remove badges (they require an internet connection).
  for(const image of container.getElementsByTagName("img"))
    if(image.src.startsWith("https:") && image.parentElement?.parentElement?.tagName === "P") {
      image.parentElement.parentElement.remove();
      break;
    }
}

function handleUrls(container:HTMLElement, article:HTMLElement, header:HTMLElement, mdPrevious: string):void {
  for(const link of container.getElementsByTagName("a")){
    link.onclick = () => {
      window.history.replaceState("", "", pathToFileURL(mdPrevious));
      // Handle links with the whitelisted protocols
      if(protocols.secure.includes(new URL(link.href).protocol)) {
        open(link.href);
        // Handle in-document links
      } else if (link.href.startsWith(document.URL.replace(/#.*/, "")+"#")) {
        const id = getId(link.href);
        if (id !== undefined) {
          const element = document.getElementById(id);
          if(element) element.scrollIntoView({behavior: "smooth"});
        }
        // Handle markdown links and 'LICENSE' files.
      } else if(/^file:\/\/.+(\.md|LICENSE)(#[a-z0-9-]+)?$/.exec(link.href)) {
        const mdFile = fileURLToPath(link.href);
        const id = getId(link.href);
        const oldHeader = menuHeader.innerHTML;
        menuHeader.innerText = basename(mdFile);
        document.body.removeChild(article);
        let promise:Promise<void>;
        if(existsSync(mdFile)){
          promise = loadMarkdown(container,mdFile);
          mdPrevious = mdFile;
        } else {
          // Fix for HTML links ('<a>' elements) that are unhandled by marked.
          const relFile = relative(document.URL, link.href);
          const mdFile = resolve(mdPrevious, relFile);
          if(!existsSync(mdFile)) {
            // Failsafe: revert all changes done so far...
            console.error("File '"+mdFile+"' does not exists!");
            document.body.appendChild(article);
            window.history.pushState("", "", htmlFileUrl);
            menuHeader.innerHTML = oldHeader;
            return false;
          }
          promise = loadMarkdown(container,mdFile);
          mdPrevious = mdFile;
          console.log(relFile);
        }
        window.scroll(0,0);
        void promise
          .then(() => handleUrls(container, article, header, mdPrevious))
          .then(() => fixImages(container));
        document.body.appendChild(article);
        if (id !== undefined) {
          const element = document.getElementById(id);
          if (element) element.scrollIntoView();
        }
      }
      window.history.pushState("", "", htmlFileUrl);
      return false;
    };
  }
}

async function setBody(mdBody: HTMLElement, mdHeader: HTMLElement, mdFile: string, mdArticle: HTMLElement) {
  await loadMarkdown(mdBody, mdFile);
  handleUrls(mdBody, mdArticle, mdHeader, mdFile);
  fixImages(mdBody);
}

document.addEventListener("readystatechange", () => {
  if(document.readyState === "interactive")
    ipc.invoke("documentation-load")
      .then(async (readmeFile:string) => {
        const mdHeader = document.createElement("header");
        const mdArticle = document.createElement("article");
        const mdBody = document.createElement("div");
        mdArticle.appendChild(mdBody);
        mdHeader.id = "markdown-header";
        mdBody.id = "markdown-body";
        menuHeader.innerText = basename(readmeFile);
        mdHeader.appendChild(menu);
        mdHeader.appendChild(menuHeader);
        await setBody(mdBody, mdHeader, readmeFile, mdArticle);
        mdBody.getElementsByTagName("sub")[0]?.parentElement?.remove();
        document.body.appendChild(mdHeader);
        document.body.appendChild(mdArticle);
        menu.onclick = () => {
          let scrollOptions:ScrollIntoViewOptions|undefined;
          let promise:Promise<void> = Promise.resolve();
          if(!menuHeader.innerText.includes("Readme.md")) {
            window.scroll(0,0);
            menuHeader.innerText = basename(readmeFile);
            promise = setBody(mdBody, mdHeader, readmeFile, mdArticle)
              .then(() => mdBody.getElementsByTagName("sub")[0]?.parentElement?.remove());
          } else {
            scrollOptions = {behavior:"smooth"};
          }
          let docsId = "documentation";
          if(navigator.language === "pl")
            docsId = "dokumentacja-w-większości-jeszcze-nie-przetłumaczona";
          void promise.then(() => {
            const docsHeader = document.getElementById(docsId);
            if(docsHeader) docsHeader.scrollIntoView(scrollOptions);
          });
        }
        ;
      })
      .finally(() => {
        ipc.send("documentation-show");
      })
      .catch((error:unknown) => {
        if(error instanceof Error)
          throw error;
        else if(typeof error === "string")
          throw new Error(error);
        else
          console.error(error);
      });
});