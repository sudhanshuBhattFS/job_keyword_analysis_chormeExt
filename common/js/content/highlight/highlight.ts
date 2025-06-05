import { KeywordMatchResult } from "../type";

export function highlightAndCountKeywords(
  selector: string | string[],
  whitelist: string[],
  blacklist: string[]
): KeywordMatchResult {
  const selectors = Array.isArray(selector) ? selector : [selector];
  const elements: HTMLElement[] = [];

  selectors.forEach((sel) => {
    document
      .querySelectorAll<HTMLElement>(sel)
      .forEach((el) => elements.push(el));
  });

  const whitelistMatched = new Set<string>();
  const blacklistMatched = new Set<string>();

  // Unwrap existing highlights
  elements.forEach((el) => {
    const oldHighlights = el.querySelectorAll(
      'span[data-highlight-id="keyword-highlight"]'
    );
    oldHighlights.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });
  });

  const createRegex = (words: string[]): RegExp | null => {
    if (!words.length) return null;
    const escapedWords = words.map((w) =>
      w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    return new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
  };

  const whitelistRegex = createRegex(whitelist);
  const blacklistRegex = createRegex(blacklist);

  elements.forEach((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];

    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      if (!parent) return;

      const originalText = textNode.textContent ?? "";
      const whiteMatches = originalText.match(whitelistRegex ?? /$^/) || [];
      const blackMatches = originalText.match(blacklistRegex ?? /$^/) || [];

      whiteMatches.forEach((word) => whitelistMatched.add(word.toLowerCase()));
      blackMatches.forEach((word) => blacklistMatched.add(word.toLowerCase()));

      if (!whiteMatches.length && !blackMatches.length) return;

      let replaced = originalText;

      if (whitelistRegex) {
        replaced = replaced.replace(
          whitelistRegex,
          (match) =>
            `<span data-highlight-id="keyword-highlight" style="
              background-color: green;
              color: white;
              font-weight: 600;
              padding: 2px 4px;
              border-radius: 4px;
            ">${match}</span>`
        );
      }

      if (blacklistRegex) {
        replaced = replaced.replace(
          blacklistRegex,
          (match) =>
            `<span data-highlight-id="keyword-highlight" style="
              background-color: red;
              color: white;
              font-weight: 600;
              padding: 2px 4px;
              border-radius: 4px;
            ">${match}</span>`
        );
      }

      const temp = document.createElement("span");
      temp.innerHTML = replaced;
      parent.replaceChild(temp, textNode);
    });
  });

  return {
    whitelistCount: whitelistMatched.size,
    blacklistCount: blacklistMatched.size,
    matchedWhitelist: [...whitelistMatched],
    matchedBlacklist: [...blacklistMatched],
  };
}
