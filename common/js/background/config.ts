export const config = [
    {
        jobPortal: "LinkedIn",
        validUrlPatterns: [
            "^https:\\/\\/www\\.linkedin\\.com\\/jobs\\/search\\/?\\?",
            "^https:\\/\\/www\\.linkedin\\.com\\/jobs\\/collections\\/recommended\\/?",
        ],
        selectors: {
            jobTitle: {
                selector:
                    "div.t-24.job-details-jobs-unified-top-card__job-title h1.t-24.t-bold.inline a, h1.top-card-layout__title, h1.jobs-unified-top-card__job-title",
            },
            companyName: {
                selector:
                    "div.job-details-jobs-unified-top-card__company-name a, a.topcard__org-name-link, span.jobs-unified-top-card__company-name",
            },
            location: {
                selector:
                    "div.t-black--light.mt2.job-details-jobs-unified-top-card__tertiary-description-container > span > span.tvm__text.tvm__text--low-emphasis:first-child, span.topcard__flavor--bullet, span.jobs-unified-top-card__bullet",
            },
            description: {
                selector: "div.jobs-box__html-content#job-details",
            },
        },
    },
    {
        jobPortal: "Glassdoor",
        validUrlPatterns: ["/^https://www.glassdoor(.[a-z.]+)?/Job/.+.htm.*$/"],
        selectors: {
            jobTitle: {
                selector:
                    'h1[aria-live="polite"][aria-hidden="false"][id^="jd-job-title-"]',
            },
            companyName: {
                selector: 'h4[aria-live="polite"][aria-hidden="false"]',
            },
            location: { selector: "div[data-test='location']" },
            description: {
                selector: 'div[data-brandviews^="PAGE:n=joblisting-serp-page"]',
            },
        },
    },
    {
        jobPortal: "Indeed",
        validUrlPatterns: [
            "^https:\\/\\/[a-z]+\\.indeed\\.com\\/.*\\?[^\\s]*vjk=[^&\\s]+",
            "^https?:\\/\\/([a-z]{2}\\.)?indeed\\.com\\/.*[?&]vjk=[a-zA-Z0-9]+.*[?&]advn=\\d+.*",
            "https:\\/\\/[^\\/]+\\.indeed\\.com\\/viewjob\\?jk(?:=[^&\\s]+)?",
        ],
        selectors: {
            jobTitle: {
                selector: 'h2[data-testid="jobsearch-JobInfoHeader-title"]',
            },
            companyName: {
                selector: 'div[data-testid="inlineHeader-companyName"] a',
            },
            location: {
                selector:
                    'div[data-testid="inlineHeader-companyLocation"] > div',
            },
            description: {
                selector: "div#jobDescriptionText",
            },
        },
    },
    {
        jobPortal: "ZipRecruiter",
        validUrlPatterns: [
            "^https:\\/\\/[^\\/]+\\.ziprecruiter\\.[a-z]+\\/jobs.*",
            "https:\\/\\/www\\.ziprecruiter\\.com\\/jobs-search\\?search(?:=[^&\\s]+)?",
        ],
        selectors: {
            jobTitle: {
                selector: "div.jobDetail-header h1.u-textH2",
            },
            companyName: {
                selector: "div.jobDetail-headerIntro strong",
            },
            location: {
                selector:
                    "div.jobDetail-headerIntro i.fa-map-marker-alt + span",
            },
            description: {
                selector: "div.job-body",
            },
        },
    },
    {
        jobPortal: "dice",
        validUrlPatterns: [
            "/^https:\\/\\/www\\.dice\\.com\\/job-detail\\/.*$/",
        ],
        selectors: {
            jobTitle: {
                selector: 'h1[data-cy="jobTitle"]',
            },
            companyName: {
                selector: 'a[data-cy="companyNameLink"]',
            },
            location: {
                selector: 'div[data-cy="locationDetails"] span[id^="location"]',
            },
            description: {
                selector: 'div[data-testid="jobDescription"]',
            },
        },
    },
];
