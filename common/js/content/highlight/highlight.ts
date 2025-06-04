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
  console.log("check_elements", elements);

  let whitelistCount = 0;
  let blacklistCount = 0;

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

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentElement;
      const originalText = textNode.textContent ?? "";

      const whiteMatches = whitelistRegex?.test(originalText) ?? false;
      const blackMatches = blacklistRegex?.test(originalText) ?? false;

      if (!whiteMatches && !blackMatches) return;

      // Reset regex state
      whitelistRegex?.lastIndex && (whitelistRegex.lastIndex = 0);
      blacklistRegex?.lastIndex && (blacklistRegex.lastIndex = 0);

      whitelistCount += (originalText.match(whitelistRegex ?? /$^/) || [])
        .length;
      blacklistCount += (originalText.match(blacklistRegex ?? /$^/) || [])
        .length;

      let replaced = originalText;
      if (whitelistRegex) {
        replaced = replaced.replace(
          whitelistRegex,
          (match) => `<span style="
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
          (match) => `<span style="
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
      parent?.replaceChild(temp, textNode);
    });
  });

  return { whitelistCount, blacklistCount };
}
