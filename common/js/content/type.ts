export interface tabData {
  name: string;
  description: string;
  location: string;
  title: string;
}
export type Selector = { selector: string; waitFor: boolean };

export type JobPortalConfig = {
  jobPortal: string;
  validUrlPatterns: string[]; // Will convert these to RegExp inside the function
  selectors: {
    url: Selector[];
    title: Selector[];
    companyName: Selector[];
    location: Selector[];
  };
};

export interface KeywordMatchResult {
  whitelistCount: number;
  blacklistCount: number;
  matchedWhitelist: string[];
  matchedBlacklist: string[];
}
