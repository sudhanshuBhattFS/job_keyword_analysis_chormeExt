export const config = [
  {
    jobPortal: "LinkedIn",
    validUrlPatterns: ["^https:\\/\\/www\\.linkedin\\.com\\/jobs.*"],
    selectors: {
      jobTitle: {
        selector: [
          "div.t-24.job-details-jobs-unified-top-card__job-title h1.t-24.t-bold.inline a",
          "h1.top-card-layout__title",
          "h1.jobs-unified-top-card__job-title",
        ],
      },
      companyName: {
        selector: [
          "div.job-details-jobs-unified-top-card__company-name a",
          "a.topcard__org-name-link",
          "span.jobs-unified-top-card__company-name",
        ],
      },
      location: {
        selector: [
          "div.t-black--light.mt2.job-details-jobs-unified-top-card__tertiary-description-container > span > span.tvm__text.tvm__text--low-emphasis:first-child",
          "span.topcard__flavor--bullet",
          "span.jobs-unified-top-card__bullet",
        ],
      },
      description: {
        selector: ["div.jobs-search__job-details--container"],
      },
    },
  },
  {
    jobPortal: "Glassdoor",
    validUrlPatterns: [
      "^https:\\/\\/www\\.glassdoor(?:\\.[a-z\\.]+)?\\/Job\\/.+\\.htm.*$",
    ],
    selectors: {
      jobTitle: {
        selector: [
          'h1[aria-live="polite"][aria-hidden="false"][id^="jd-job-title-"]',
        ],
      },
      companyName: {
        selector: ['h4[aria-live="polite"][aria-hidden="false"]'],
      },
      location: {
        selector: ["div[data-test='location']"],
      },
      description: {
        selector: ['div[class^="JobDetails_jobDetailsContainer__"]'],
      },
    },
  },
  {
    jobPortal: "Indeed",
    validUrlPatterns: [
      "^https:\\/\\/[a-z]+\\.indeed\\.com\\/.*[?&](vjk|jk)=[a-zA-Z0-9]+",
    ],
    selectors: {
      jobTitle: {
        selector: [
          'h2[data-testid="jobsearch-JobInfoHeader-title"]',
          'h1[data-testid="jobsearch-JobInfoHeader-title"] > span',
        ],
      },
      companyName: {
        selector: ['div[data-testid="inlineHeader-companyName"] a'],
      },
      location: {
        selector: ['div[data-testid="inlineHeader-companyLocation"] > div'],
      },
      description: {
        selector: ["div#jobsearch-ViewjobPaneWrapper"],
      },
    },
  },
  {
    jobPortal: "ZipRecruiter",
    validUrlPatterns: ["^https:\\/\\/www\\.ziprecruiter\\.[a-z]+\\/jobs.*"],
    selectors: {
      jobTitle: {
        selector: [
          "div.jobDetail-header h1.u-textH2",
          "h1.font-bold.text-primary.text-header-md.md\\:text-header-md-tablet",
        ],
      },
      companyName: {
        selector: [
          "div.jobDetail-headerIntro strong",
          "a.w-fit.gap-8.items-center.group.border-solid.border.rounded-2.border-transparent.flex.text-16.text-link.font-bold",
        ],
      },
      location: {
        selector: [
          "div.jobDetail-headerIntro i.fa-map-marker-alt + span",
          "div.mb-24 > p.text-primary.normal-case.text-body-md",
        ],
      },
      description: {
        selector: [
          'div[data-testid="right-pane"]',
          "div.col-md-9 > div.panel.panel-default.panel-expand > div.panel-body",
        ],
      },
    },
  },
  {
    jobPortal: "dice",
    validUrlPatterns: ["/^https:\\/\\/www\\.dice\\.com\\/job-detail\\/.*$/"],
    selectors: {
      jobTitle: {
        selector: ['h1[data-cy="jobTitle"]'],
      },
      companyName: {
        selector: ['a[data-cy="companyNameLink"]'],
      },
      location: {
        selector: ['div[data-cy="locationDetails"] span[id^="location"]'],
      },
      description: {
        selector: ["article"],
      },
    },
  },
];
