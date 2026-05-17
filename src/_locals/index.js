import * as file from '#utils/file';

export const locales = {
    en : load('en'),
    ko : load('ko')
}

export let MESSAGES = locales.en;

function load(lang) {
    const path = file.find(`./src/_locals/${lang}.json`);
    return path ? file.json(path) : {};
}

export function getLanguage() {
    return MESSAGES || locales.en;
}

export function setLanguage(lang = 'en') {
    const languages = {
        en: locales.en,
        eng: locales.en,
        english: locales.en,

        ko: locales.ko,
        kor: locales.ko,
        korean: locales.ko
    };

    MESSAGES = languages[
        String(lang).trim().toLowerCase()
    ] ?? locales.en;
}