export interface Font {
    name: string;
    family: string[];
}
export interface Property<T> {
    type: string;
    name: string;
    value: T | ((element: HTMLElement) => T);
    change: (value: T, element: HTMLElement) => void;
    reset: (element: HTMLElement) => void;
}
export interface SelectProperty<T, Type extends string = "select">
    extends Property<T> {
    type: Type;
    options: T[];
}
export interface ColorProperty extends Property<string> {
    type: "color";
}
export interface NumberProperty extends Property<number> {
    type: "number";
}
export interface TextProperty extends Property<string> {
    type: "text";
}
export type FontProperty = SelectProperty<string, "font">;
export type AnyProperty =
    | SelectProperty<any>
    | ColorProperty
    | NumberProperty
    | TextProperty
    | FontProperty;

export enum PageScript {
    JQuery = "jquery", // jQuery
    JS = "js",
}
export interface Theme {
    scheme: "dark" | "light" | "auto";
    accentColor: string;
}
export interface Config {
    scriptType: PageScript;
    title: string;
    theme?: Theme;
}
export interface PageRecord {
    type: "element";
    tag: string;
    attributes?: Record<string, string>;
    children?: PageRecords[]; // nested elements
    style?: Record<string, string>;
    id: string; // unique id for each element (for finding it later)
    props?: Record<string, any>; // properties for the element
}

export interface TextRecord {
    type: "text";
    content: string;
}

type PageRecords = PageRecord | TextRecord;

export interface Page {
    contents: PageRecords[];
    script: string;
    style: Record<string, string>;
};
