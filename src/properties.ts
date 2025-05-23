import { Font, AnyProperty } from "./types";
import { HexAlphaColorPicker } from "vanilla-colorful/hex-alpha-color-picker.js";

const propertiesElem = document.getElementById("properties") as HTMLDivElement;
const propertiesContentsElem = document.getElementById(
    "properties-content"
) as HTMLDivElement;
const draggerElem = document.getElementById(
    "properties-scale"
) as HTMLDivElement;
const propertiesInfoElem = document.getElementById(
    "properties-info"
) as HTMLElement;

draggerElem.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = propertiesElem.offsetWidth;
    draggerElem.setPointerCapture(e.pointerId);

    const onPointerMove = (e: PointerEvent) => {
        const newWidth = startWidth + (startX - e.clientX);
        propertiesElem.style.width = `${newWidth}px`;
    };

    const onPointerUp = () => {
        draggerElem.releasePointerCapture(e.pointerId);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
});

const fonts: Record<string, Font> = {
    inherit: {
        name: "inherit",
        family: ["inherit"],
    },
    monospace: {
        name: "monospace",
        family: ["monospace"],
    },
    serif: {
        name: "serif",
        family: ["serif"],
    },
    "sans-serif": {
        name: "sans-serif",
        family: ["sans-serif"],
    },
    cursive: {
        name: "cursive",
        family: ["cursive"],
    },
    fantasy: {
        name: "fantasy",
        family: ["fantasy"],
    },
    "system-ui": {
        name: "system-ui",
        family: ["system-ui"],
    },
    Roboto: {
        name: "Roboto",
        family: ['"Roboto", sans-serif'],
    },
    Inter: {
        name: "Inter",
        family: ['"Inter", sans-serif'],
    },
};

const changesStyle = (name: string, postfix?: string) => {
    return {
        change: (value: string | number, element: HTMLElement) => {
            const style = element.style;
            console.log('change', name, value);
            if (typeof value === "number") {
                value = value.toString();
            }
            style.setProperty(name, value + (postfix ?? ""));
        },
        reset: (element: HTMLElement) => {
            const style = element.style;
            style.removeProperty(name);
        },
    };
};
const changesAttr = (name: string) => {
    return {
        value(element: HTMLElement) {
            const attr = element.getAttribute(name);
            if (attr) {
                return attr;
            }
            return "";
        },
        change: (value: string, element: HTMLElement) => {
            element.setAttribute(name, value);
        },
        reset: (element: HTMLElement) => {
            const attr = element.getAttribute(name);
            if (attr) {
                element.removeAttribute(name);
            }
        },
    };
};

const rgb2hex = (rgb: string) => {
    console.log(rgb);
    // Convert RGB to HEX or RGBA
    if (rgb.startsWith("rgba")) {
        const rgbaValues = rgb.match(/\d+/g);
        if (!rgbaValues) return null;
        const r = parseInt(rgbaValues[0]);
        const g = parseInt(rgbaValues[1]);
        const b = parseInt(rgbaValues[2]);
        const a = parseFloat(rgbaValues[3]);
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)}${Math.round(a * 255)
            .toString(16)
            .padStart(2, "0")}`;
    } else if (rgb.startsWith("rgb")) {
        const rgbValues = rgb.match(/\d+/g);
        if (!rgbValues) return null;
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
        return `#${((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)}`;
    }
    return null;
};

const baseprops: Record<string, AnyProperty> = {
    "background-color": {
        type: "color",
        name: "Background Color",
        value(element: HTMLElement) {
            const backgroundColor =
                window.getComputedStyle(element).backgroundColor;
            return rgb2hex(backgroundColor) ?? '#000';
        },
        ...changesStyle("background-color"),
    },
    color: {
        type: "color",
        name: "Text Color",
        value(element: HTMLElement) {
            const color = window.getComputedStyle(element).color;
            return rgb2hex(color) ?? "#000";
        },
        ...changesStyle("color"),
    },
    "font-size": {
        type: "number",
        name: "Font Size",
        value(element: HTMLElement) {
            const fontSize = window.getComputedStyle(element).fontSize;
            console.log(fontSize);
            const fontSizeValue = parseFloat(fontSize);
            const fontSizeUnit = fontSize.replace(fontSizeValue.toString(), "");
            if (fontSizeUnit === "px") {
                return fontSizeValue;
            } else if (fontSizeUnit === "em") {
                return fontSizeValue * 16; // Assuming base font size of 16px
            } else if (fontSizeUnit === "rem") {
                return fontSizeValue * 16; // Assuming base font size of 16px
            }
            return 16; // Default to 16px if unit is not recognized
        },
        ...changesStyle("font-size", "px"),
    },
    "font-family": {
        type: "font",
        name: "Font",
        value(element: HTMLElement) {
            const font = window.getComputedStyle(element).fontFamily;
            for (const [key, value] of Object.entries(fonts)) {
                if (font.includes(value.family[0])) {
                    return key;
                }
            }
            return "inherit";
        },
        change(value, element) {
            const font = fonts[value];
            element.style.fontFamily = font.family.join(", ");
        },
        reset(element) {
            element.style.fontFamily = "inherit";
        },
        options: [
            "inherit",
            "monospace",
            "serif",
            "sans-serif",
            "cursive",
            "fantasy",
            "system-ui",
            "Roboto",
            "Inter",
        ],
    },
};

const specificprops: Record<string, Record<string, AnyProperty>> = {
    img: {
        "border-radius": {
            type: "number",
            name: "Border Radius",
            value(element: HTMLElement) {
                const borderRadius = window.getComputedStyle(
                    element
                ).borderRadius;
                const borderRadiusValue = parseFloat(borderRadius);
                const borderRadiusUnit = borderRadius.replace(
                    borderRadiusValue.toString(),
                    ""
                );
                if (borderRadiusUnit === "px") {
                    return borderRadiusValue;
                } else if (borderRadiusUnit === "em") {
                    return borderRadiusValue * 16; // Assuming base font size of 16px
                } else if (borderRadiusUnit === "rem") {
                    return borderRadiusValue * 16; // Assuming base font size of 16px
                }
                return 0; // Default to 0px if unit is not recognized
            },
            ...changesStyle("border-radius", "px"),
        },
        src: {
            type: "text",
            name: "Image Source",
            ...changesAttr("src"),
        },
        alt: {
            type: "text",
            name: "Image Alt",
            ...changesAttr("alt"),
        },
    },
};

function getProperties(element: HTMLElement): Record<string, AnyProperty> {
    const tagName = element.tagName.toLowerCase();
    const props = { ...baseprops };
    if (tagName in specificprops) {
        Object.assign(props, specificprops[tagName]);
    }
    return props;
}

function renderProps(element: HTMLElement) {
    propertiesContentsElem.innerHTML = "";
    const props = getProperties(element);
    propertiesInfoElem.textContent = `<${element.tagName.toLowerCase()}> ${element.dataset.id}`;
    for (const [name, prop] of Object.entries(props)) {
        const propElem = document.createElement("div");
        propElem.className = "property mb-3";
        const label = document.createElement("label");
        label.textContent = prop.name;
        propElem.appendChild(label);

        const inputContainer = document.createElement("div");
        inputContainer.className =
            "d-flex align-items-stretch flex-row justify-content-between";


        const resetButton = document.createElement("button");
        resetButton.className = "btn btn-danger ms-2";
        resetButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>';
        resetButton.addEventListener("click", () => {
            prop.reset(element);
            if (input instanceof HTMLInputElement) {
                if (typeof prop.value === "string") {
                    input.value = prop.value;
                } else {
                    input.value = prop.value(element).toString();
                }
            } else if (input instanceof HTMLSelectElement) {
                if (typeof prop.value === "string") {
                    input.value = prop.value;
                } else {
                    input.value = prop.value(element);
                }
    
            } else if (input instanceof HexAlphaColorPicker) {
                if (typeof prop.value === "string") {
                    input.color = prop.value;
                } else {
                    input.color = prop.value(element);
                }
            }
            webpageElem.dispatchEvent(new Event("input", { bubbles: true }));
        });

        inputContainer.appendChild(resetButton);
        
        let input:
            | HexAlphaColorPicker
            | HTMLInputElement
            | HTMLSelectElement
            | null;
        if (prop.type === "color") {
            input = new HexAlphaColorPicker();
            if (typeof prop.value === "string") {
                input.color = prop.value;
            } else {
                input.color = prop.value(element);
            }
        } else if (prop.type === "number") {
            input = document.createElement("input");
            input.className = "form-control";
            input.type = "number";
            if (typeof prop.value === "number") {
                input.value = prop.value.toString();
            } else {
                input.value = prop.value(element).toString();
            }
        } else if (prop.type === "text") {
            input = document.createElement("input");
            input.className = "form-control";
            input.type = "text";
            if (typeof prop.value === "string") {
                input.value = prop.value;
            } else {
                input.value = prop.value(element);
            }
        } else if (prop.type === "font") {
            input = document.createElement("select");
            input.className = "form-select";
            for (const option of prop.options) {
                const optElem = document.createElement("option");
                optElem.value = option;
                optElem.textContent = fonts[option].name;
                optElem.style.fontFamily = fonts[option].family.join(", ");
                input.appendChild(optElem);
            }
            if (typeof prop.value === "string") {
                input.value = prop.value;
            } else {
                input.value = prop.value(element);
            }
        } else if (prop.type === "select") {
            input = document.createElement("select");
            input.className = "form-select";
            for (const option of prop.options) {
                const optElem = document.createElement("option");
                optElem.value = option;
                optElem.textContent = option;
                input.appendChild(optElem);
            }
            input.value = prop.value;
        } else {
            input = null;
        }

        if (input) {
            input.id = name + element.dataset.id;
            inputContainer.prepend(input);
            propElem.appendChild(inputContainer);
            if (input instanceof HexAlphaColorPicker) {
                input.addEventListener("color-changed", () => {
                    prop.change(input!.color, element);
                    webpageElem.dispatchEvent(
                        new Event("input", { bubbles: true })
                    );
                });
            } else {
                input.addEventListener("change", () => {
                    prop.change(input!.value, element);
                    webpageElem.dispatchEvent(
                        new Event("input", { bubbles: true })
                    );
                });
            }
        }
        propertiesContentsElem.appendChild(propElem);
    }
}

let selectedElement: HTMLElement | null = null;

function onSelect(element: HTMLElement) {
    if (selectedElement) {
        selectedElement.removeAttribute("data-selected");
    }
    selectedElement = element;
    element.setAttribute("data-selected", "true");
    renderProps(element);
}

const webpageElem = document.getElementById("webpage") as HTMLDivElement;

webpageElem.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (webpageElem.dataset.inspect === "true") {
        if (target !== webpageElem && target !== propertiesElem) {
            onSelect(target);
        } else {
            if (selectedElement) {
                selectedElement.removeAttribute("data-selected");
                propertiesContentsElem.innerHTML = "";
            }
        }
    }
});
webpageElem.addEventListener("mode-change", (e) => {
    if (webpageElem.dataset.inspect !== "true") {
        if (selectedElement) {
            selectedElement.removeAttribute("data-selected");
            propertiesContentsElem.innerHTML = "";
        }
    }
});
