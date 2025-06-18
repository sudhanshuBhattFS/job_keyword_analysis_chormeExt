export interface tabData {
    name: string;
    description: string;
    location: string;
    title: string;
}
export interface SelectorGroup {
    selector: string[];
}

export type JobPortalConfig = {
    jobPortal: string;
    validUrlPatterns: string[];
    selectors: {
        title: SelectorGroup;
        companyName: SelectorGroup;
        location: SelectorGroup;
        url: SelectorGroup;
        [key: string]: SelectorGroup; // for flexibility
    };
};

export interface KeywordMatchResult {
    whitelistCount: number;
    blacklistCount: number;
    matchedWhitelist: string[];
    matchedBlacklist: string[];
}
