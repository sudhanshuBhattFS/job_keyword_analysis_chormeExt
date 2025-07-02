import { KeywordMatchResult } from "../type";

/* ---------- small helpers reused by both functions ---------- */
const prepare = (
    selector: string | string[],
    whitelist: string[],
    blacklist: string[]
) => {
    const selectors = Array.isArray(selector) ? selector : [selector];
    const elements: HTMLElement[] = [];
    selectors.forEach((sel) =>
        document
            .querySelectorAll<HTMLElement>(sel)
            .forEach((el) => elements.push(el))
    );

    const createRegex = (words: string[]): RegExp | null =>
        words.length
            ? new RegExp(
                  `\\b(${words
                      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                      .join("|")})\\b`,
                  "gi"
              )
            : null;

    return {
        elements,
        whitelistRegex: createRegex(whitelist),
        blacklistRegex: createRegex(blacklist),
    };
};

/* ---------- 1. highlight only ---------- */
export function highlightKeywords(
    selector: string | string[],
    whitelist: string[],
    blacklist: string[]
): void {
    const { elements, whitelistRegex, blacklistRegex } = prepare(
        selector,
        whitelist,
        blacklist
    );

    // unwrap previous highlights
    elements.forEach((el) =>
        el
            .querySelectorAll('span[data-highlight-id="keyword-highlight"]')
            .forEach((span) => {
                const p = span.parentNode;
                if (!p) return;
                while (span.firstChild) p.insertBefore(span.firstChild, span);
                p.removeChild(span);
            })
    );

    // walk & replace
    elements.forEach((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const texts: Text[] = [];
        while (walker.nextNode()) texts.push(walker.currentNode as Text);

        texts.forEach((t) => {
            const parent = t.parentElement;
            if (!parent) return;

            let html = t.textContent ?? "";
            if (whitelistRegex)
                html = html.replace(
                    whitelistRegex,
                    (m) =>
                        `<span data-highlight-id="keyword-highlight" style="background:#2e7d32;color:#fff;font-weight:600;padding:2px 4px;border-radius:4px;">${m}</span>`
                );
            if (blacklistRegex)
                html = html.replace(
                    blacklistRegex,
                    (m) =>
                        `<span data-highlight-id="keyword-highlight" style="background:#c62828;color:#fff;font-weight:600;padding:2px 4px;border-radius:4px;">${m}</span>`
                );

            if (html !== t.textContent) {
                const temp = document.createElement("span");
                temp.innerHTML = html;
                parent.replaceChild(temp, t);
            }
        });
    });
}

/* ---------- 2. count & return matches only ---------- */
export function getKeywordMatches(
    selector: string | string[],
    whitelist: string[],
    blacklist: string[]
): KeywordMatchResult {
    const { elements, whitelistRegex, blacklistRegex } = prepare(
        selector,
        whitelist,
        blacklist
    );

    const white = new Set<string>();
    const black = new Set<string>();

    elements.forEach((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const txt = (walker.currentNode as Text).textContent ?? "";
            (txt.match(whitelistRegex ?? /$^/) || []).forEach((w) =>
                white.add(w.toLowerCase())
            );
            (txt.match(blacklistRegex ?? /$^/) || []).forEach((w) =>
                black.add(w.toLowerCase())
            );
        }
    });

    return {
        whitelistCount: white.size,
        blacklistCount: black.size,
        matchedWhitelist: Array.from(white),
        matchedBlacklist: Array.from(black),
    };
}

/* ---------- OPTIONAL: keep the old name to avoid any breakage ---------- */
export function highlightAndCountKeywords(
    selector: string | string[],
    whitelist: string[],
    blacklist: string[]
): KeywordMatchResult {
    const result = getKeywordMatches(selector, whitelist, blacklist);
    highlightKeywords(selector, whitelist, blacklist);
    return result;
}