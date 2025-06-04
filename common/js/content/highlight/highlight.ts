export interface KeywordMatchCount {
  whitelistCount: number;
  blacklistCount: number;
}

export function highlightAndCountKeywords(
  selector: string,
  whitelist: string[],
  blacklist: string[]
): KeywordMatchCount {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  console.log("check_elemetns", elements);

  let whitelistCount = 0;
  let blacklistCount = 0;

  const createRegex = (words: string[]): RegExp => {
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

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      const originalText = textNode.textContent ?? "";

      // Skip if no match
      if (
        !whitelistRegex.test(originalText) &&
        !blacklistRegex.test(originalText)
      )
        return;

      // Reset regex state for global matching
      whitelistRegex.lastIndex = 0;
      blacklistRegex.lastIndex = 0;

      whitelistCount += (originalText.match(whitelistRegex) || []).length;
      blacklistCount += (originalText.match(blacklistRegex) || []).length;

      const replaced = originalText
        .replace(
          whitelistRegex,
          (match) => `
      <span style="
        background-color: #e6ffec;
        color: #065f46;
        font-weight: 600;
        padding: 2px 4px;
        border-radius: 4px;
      ">${match}</span>`
        )
        .replace(
          blacklistRegex,
          (match) => `
      <span style="
        background-color: #ffe6e6;
        color: #7f1d1d;
        font-weight: 600;
        padding: 2px 4px;
        border-radius: 4px;
      ">${match}</span>`
        );

      const temp = document.createElement("span");
      temp.innerHTML = replaced;

      parent?.replaceChild(temp, textNode);
    });
  });

  return { whitelistCount, blacklistCount };
}
