import { marked } from "marked";
import { sanitize } from "dompurify";
import { basename, relative, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { pathToFileURL, fileURLToPath } from "url";
import { trustedProtocolRegExp } from "../../common/global";
import * as _hljsmodule from "highlight.js";

const htmlFileUrl = document.URL;

// Workaround for highlight's wrong export type (there shouldn't be default as "root").
const { highlight } = (_hljsmodule as unknown as _hljsmodule.HLJSApi);

// Code highlighting:

marked.setOptions({
  highlight: (code, lang) => {
    if (lang==="") return;
    const language = (() => {
      if (lang==="jsonc") return "json"; // highlight does not support JSONC as JSON alias
      return lang;
    })();
    return highlight(code, {language: language}).value;
  }
});

const menu = document.createElement("img");
menu.src = "../../icons/symbols/menu.svg";
menu.id = "menu-hamburger";

const menuHeader = document.createElement("p");

/** 
 * Handles URL clicks – it will open websites in default browser and load
 * markdown files instead of trying it to open.
 */
function getId(url:string): string | void {
  if (url.split("#").length > 1)
    return url.split("#")[1];
}

function loadMarkdown(mdBody: HTMLElement, mdFile: string) {
  mdBody.innerHTML = sanitize(marked.parse(readFileSync(mdFile).toString()));
}

function setBody(mdBody: HTMLElement, mdHeader: HTMLElement, mdFile: string, mdArticle: HTMLElement) {
  loadMarkdown(mdBody, mdFile);
  handleUrls(mdBody, mdArticle, mdHeader, mdFile);
  fixImages(mdBody);
}

function handleUrls(container:HTMLElement, article:HTMLElement, header:HTMLElement, mdPrevious: string):void {
  for(const link of container.getElementsByTagName("a")){
    link.onclick = () => {
      window.history.replaceState("", "", pathToFileURL(mdPrevious));
      // Handle links with the whitelisted protocols
      if(new URL(link.href).protocol.match(trustedProtocolRegExp)) {
        open(link.href);
        // Handle in-document links
      } else if (link.href.startsWith(document.URL.replace(/#.*/, "")+"#")) {
        const id = getId(link.href);
        if (id) {
          const element = document.getElementById(id);
          if(element) element.scrollIntoView({behavior: "smooth"});
        }
        // Handle markdown links and 'LICENSE' files.
      } else if(link.href.match(/^file:\/\/.+(\.md|LICENSE)(#[a-z0-9-]+)?$/)) {
        const mdFile = fileURLToPath(link.href);
        const id = getId(link.href);
        const oldHeader = menuHeader.innerHTML;
        menuHeader.innerText = basename(mdFile);
        document.body.removeChild(article);
        if(existsSync(mdFile)){
          loadMarkdown(container,mdFile);
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
          loadMarkdown(container,mdFile);
          mdPrevious = mdFile;
          console.log(relFile);
        }
        window.scroll(0,0);
        handleUrls(container, article, header, mdPrevious);
        fixImages(container);
        document.body.appendChild(article);
        if (id) {
          const element = document.getElementById(id);
          if (element) element.scrollIntoView();
        }
      }
      window.history.pushState("", "", htmlFileUrl);
      return false;
    };
  }
}

function fixImages(container:HTMLElement) {
  // Fix logo URL in Readme files.
  const logo = container.querySelector<HTMLImageElement>('a[href="https://github.com/SpacingBat3/WebCord"] > picture > img');
  const logoPicture = logo?.parentNode ?? null;
  const logoAnchor = logoPicture?.parentElement ?? null;
  if(logo===null||logoPicture===null||logoAnchor===null) return;
  (logoPicture as HTMLPictureElement).remove();
  if(logo.src.match("/sources/assets/web"))
    logo.src=logo.src.replace("/sources/assets/web","");
  else
    logo.src=logo.src.replace("/sources/assets","");
  const newLogo = logo.cloneNode();
  logoAnchor.appendChild(newLogo);
    
  // Remove badges (they require an internet connection).
  for(const image of container.getElementsByTagName("img"))
    if(image.src.startsWith("https:") && image?.parentElement?.parentElement?.tagName === "P") {
      image.parentElement.parentElement.remove();
      break;
    }
}

document.addEventListener("readystatechange", () => {
  if(document.readyState === "interactive")
    import("electron/renderer")
      .then(electron => electron.ipcRenderer)
      .then(ipc => ipc.invoke("documentation-load"))
      .then((readmeFile:string) => {
        const mdHeader = document.createElement("header");
        const mdArticle = document.createElement("article");
        const mdBody = document.createElement("div");
        mdArticle.appendChild(mdBody);
        mdHeader.id = "markdown-header";
        mdBody.id = "markdown-body";
        menuHeader.innerText = basename(readmeFile);
        mdHeader.appendChild(menu);
        mdHeader.appendChild(menuHeader);
        setBody(mdBody, mdHeader, readmeFile, mdArticle);
        mdBody.getElementsByTagName("sub")[0]?.parentElement?.remove();
        document.body.appendChild(mdHeader);
        document.body.appendChild(mdArticle);
        menu.onclick = () => {
          let scrollOptions:ScrollIntoViewOptions|undefined;
          if(!menuHeader.innerText.includes("Readme.md")) {
            window.scroll(0,0);
            menuHeader.innerText = basename(readmeFile);
            setBody(mdBody, mdHeader, readmeFile, mdArticle);
            mdBody.getElementsByTagName("sub")[0]?.parentElement?.remove();
          } else {
            scrollOptions = {behavior:"smooth"};
          }
          let docsId = "documentation";
          if(navigator.language === "pl")
            docsId = "dokumentacja-w-większości-jeszcze-nie-przetłumaczona";
            
          const docsHeader = document.getElementById(docsId);
          if(docsHeader) docsHeader.scrollIntoView(scrollOptions);
        }
        ;
      })
      .finally(() => {
        void import("electron/renderer")
          .then(electron => electron.ipcRenderer)
          .then(ipc => ipc.send("documentation-show"));
      })
      .catch(error => {
        if(error instanceof Error)
          throw error;
        else if(typeof error === "string")
          throw new Error(error);
        else
          console.error(error);
      });
});