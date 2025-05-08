import "./styles.scss";
import "./properties";

// Import all of Bootstrap's JS
import "bootstrap";
import {
    Config,
    PageScript,
    Page,
    Theme,
    PageRecord,
    TextRecord,
} from "./types";

const webpage = document.getElementById("webpage") as HTMLDivElement;

export let config: Config = {
    scriptType: PageScript.JS,
    title: "My Webpage",
};

let page: DocumentFragment = document.createDocumentFragment();
export let pageJson: Page = {
    contents: [
        {
            type: "element",
            tag: "h1",
            attributes: {
                class: "text-center",
            },
            children: [
                {
                    type: "text",
                    content: "Hello World!",
                },
            ],
            id: "title",
        },
    ],
    script: "",
    style: {},
};
let pageScript: string = "";
let pageStyle: Record<string, string> = {};

function makeThemeScript(theme: Theme) {
    if (theme.scheme === "auto") {
        if (config.scriptType === PageScript.JQuery) {
            return `
(function() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const setTheme = (isDark) => {
        $('html').attr('data-theme', isDark ? 'dark' : 'light');
    };
    setTheme(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => {
        setTheme(e.matches);
    });
})();`;
        }
        return `
(function() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const setTheme = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
    setTheme(mediaQuery.matches);
    mediaQuery.addEventListener('change', (e) => {
        setTheme(e.matches);
    });
})();`;
    } else {
        return "";
    }
}

function makePageFromJson(json: Page): DocumentFragment {
    function renderElement(
        element: PageRecord | TextRecord
    ): HTMLElement | Text {
        if (element.type === "text") {
            return document.createTextNode(element.content);
        }
        const el = document.createElement(element.tag);
        if (element.attributes) {
            Object.entries(element.attributes).forEach(([key, value]) => {
                el.setAttribute(key, value);
            });
        }
        if (element.style) {
            Object.entries(element.style).forEach(([key, value]) => {
                el.style.setProperty(key, value);
            });
        }
        if (element.children) {
            const childFragment = document.createDocumentFragment();
            element.children.forEach((child) => {
                const childEl = renderElement(child);
                childFragment.appendChild(childEl);
            });
            el.appendChild(childFragment);
        }
        el.setAttribute("data-id", element.id);
        return el;
    }
    const fragment = document.createDocumentFragment();
    json.contents.forEach((item) => {
        const el = renderElement(item);
        fragment.appendChild(el);
    });
    return fragment;
}

function makeID() {
    /*const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }*/
    const id = crypto.randomUUID();
    return id;
}

function renderFinalPage() {
    let generatedScript = "";
    if (config.scriptType === PageScript.JQuery) {
        generatedScript = `$(function() {
            ${makeThemeScript(config.theme!)}
            ${pageScript}
        });`;
    } else if (config.scriptType === PageScript.JS) {
        generatedScript = `
(function() {
    function runPage(){
        ${makeThemeScript(config.theme!)}
        ${pageScript}
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runPage);
    } else {
        runPage();
    }
})();`;
    }
    const format = `
    <!DOCTYPE html>
    <html lang="en" class="bg-light text-black">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
        ${
            config.scriptType === PageScript.JQuery
                ? `
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
        `
                : ""
        }
        <script>
        ${generatedScript}
        </script>
        <style>
        :root {
            ${Object.entries(pageStyle)
                .map(([key, value]) => `--${key}: ${value};`)
                .join("\n")}
        }
        </style>
    </head>
    <body>
    </body>
    </html>
    `;
    const parser = new DOMParser();
    const doc = parser.parseFromString(format, "text/html");
    const body = doc.body;
    body.appendChild(page);
    return doc;
}
function renderPage() {
    page = makePageFromJson(pageJson);
    webpage.innerHTML = "";
    webpage.appendChild(page);
    if (config.theme) {
        const theme = config.theme;
        if (theme.scheme !== "auto") {
            webpage.setAttribute("data-bs-theme", theme.scheme);
        } else {
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                webpage.setAttribute("data-bs-theme", "dark");
            } else {
                webpage.setAttribute("data-bs-theme", "light");
            }
        }
        if (theme.accentColor) {
            webpage.style.setProperty("--accent-color", theme.accentColor);
        }
    }
}

function onConfig() {
    const mode = document.querySelector('input[name="mode"]:checked')?.id;
    const theme = document.querySelector('input[name="theme"]:checked')?.id;
    //const accentColor = (document.getElementById('accent-color') as HTMLInputElement).value;
    webpage.dataset.inspect = (mode === "mode-inspect").toString();
    webpage.contentEditable = (mode === "mode-edit").toString();
    webpage.dataset.grab = (mode === "mode-move").toString();
    webpage.dispatchEvent(new Event("mode-change", { bubbles: true }));
    if (!config.theme) {
        config.theme = {
            scheme: "auto",
            accentColor: "#007bff",
        };
    }
    config.theme!.scheme =
        theme === "theme-auto"
            ? "auto"
            : theme === "theme-dark"
            ? "dark"
            : "light";
    //config.theme!.accentColor = accentColor;
    renderPage();
}

function onModify() {
    // convert the page to JSON
    const elements = webpage.childNodes;
    function findwithid(id: string) {
        // find the element with the same id in the pageJson
        return pageJson.contents.filter((item) => {
            if (item.type === "element") {
                return item.id === id;
            }
            return false;
        });
    }
    elements.forEach((el) => {
        if (
            el.nodeType !== Node.ELEMENT_NODE &&
            el.nodeType !== Node.TEXT_NODE
        ) {
            return;
        }
        if (el.nodeType === Node.TEXT_NODE) {
            const textNode = el as Text;
            const parent = textNode.parentElement;

            if (parent) {
                const parentId = parent.getAttribute("data-id");
                if (parentId) {
                    const parentElements = findwithid(parentId);
                    if (
                        parentElements.length > 0 &&
                        parentElements[0].type === "element"
                    ) {
                        const parentElement = parentElements[0];

                        // Find or create the children array if it doesn't exist
                        if (!parentElement.children) {
                            parentElement.children = [];
                        }

                        // Look for an existing text node or create a new one
                        const textContent = textNode.textContent || "";
                        const textNodeIndex = parentElement.children.findIndex(
                            (child) =>
                                child.type === "text" &&
                                child.content === textContent
                        );

                        if (textNodeIndex >= 0) {
                            // Update existing text node
                            (
                                parentElement.children[
                                    textNodeIndex
                                ] as TextRecord
                            ).content = textContent;
                        } else {
                            // Add new text node
                            parentElement.children.push({
                                type: "text",
                                content: textContent,
                            });
                        }
                    }
                }
            }
            return;
        }
        const element = el as HTMLElement;
        const tag = element.tagName.toLowerCase();
        const content = element.textContent;
        const attributes: Record<string, string> = {};
        const style: Record<string, string> = {};
        let id = element.getAttribute("data-id") ?? makeID();
        const oldid = id;
        if (
            findwithid(id).length > 1 ||
            webpage.querySelectorAll(`[data-id="${id}"]`).length > 1
        ) {
            console.warn("Duplicate IDs found!");
            id = makeID();
        }
        element.setAttribute("data-id", id);
        Array.from(element.attributes).forEach((attr) => {
            if (attr.name !== "data-id") {
                attributes[attr.name] = attr.value;
            }
        });
        Array.from(element.style).forEach((styleName) => {
            style[styleName] = element.style.getPropertyValue(styleName);
        });
        const existingRecord = findwithid(oldid);
        if (existingRecord.length > 1) {
            console.error("Duplicate IDs found!");
        } else if (existingRecord.length > 0) {
            Object.assign(existingRecord[0], {
                tag,
                content,
                attributes,
                style,
                id,
            });
        } else {
            pageJson.contents.push({
                type: "element",
                tag,
                attributes,
                style,
                id,
            });
        }
    });
}

function startMove(e: MouseEvent) {
    if (webpage.dataset.grab === "true") {
        const target = e.target as HTMLElement;
        if (
            target.tagName.toLowerCase() !== "html" &&
            target.tagName.toLowerCase() !== "body" &&
            webpage.contains(target)
        ) {
            const rect = target.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            function move(e: MouseEvent) {
                target.style.position = "absolute";
                target.style.left = `${e.clientX - offsetX}px`;
                target.style.top = `${e.clientY - offsetY}px`;
            }
            function stopMove() {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", stopMove);
            }
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stopMove);
        }
    }
}

webpage.addEventListener("input", onModify);

function loaded() {
    onConfig();
    document.querySelectorAll('input[name="mode"]').forEach((el) => {
        el.addEventListener("change", () => {
            onConfig();
        });
    });
    document.querySelectorAll('input[name="theme"]').forEach((el) => {
        el.addEventListener("change", () => {
            onConfig();
            renderPage();
        });
    });
}
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loaded);
} else {
    loaded();
}

const elements = document.querySelectorAll(
    '.element.btn'
) as NodeListOf<HTMLElement>;
elements.forEach((el) => {
    el.addEventListener("click", (e) => {
        if (el.dataset.tag) {
            const tag = el.dataset.tag;
            const newElement = document.createElement(tag);
            newElement.setAttribute("data-id", makeID());
            if (el.dataset.class) {
                newElement.classList.add(el.dataset.class);
            }
            if (el.dataset.attributes) {
                const attributes = JSON.parse(el.dataset.attributes);
                Object.entries(attributes).forEach(([key, value]) => {
                    newElement.setAttribute(key, value as string);
                });
            }
            webpage.appendChild(newElement);
            webpage.dispatchEvent(new Event("input", { bubbles: true }));
        }
    });
});