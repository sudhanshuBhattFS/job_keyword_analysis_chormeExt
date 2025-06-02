export interface SelectorAction {
  type: string;
  parameter: "value" | "ele";
  value: any;
  wait?: number;
  length?: number;
  inContainer?: boolean;
  actionType?: string;
  query?: string;
  valueType?: string;
  option?: boolean;
}
export interface Parameter {
  query: string;
  type: "text" | "value";
  wait: number;
}
export interface Selector {
  wait: number;
  query: string;
  beforeEvents: string[];
  afterEvents: string[];
  parameter?: Parameter;
  action?: SelectorAction[];
  textInclude?: string;
  textNotInclude?: string;
  checkEle?: string;
  errorUi?: string;
}
export interface Field {
  type:
    | "value"
    | "radio"
    | "find"
    | "array"
    | "click"
    | "nextPage"
    | "prevPage"
    | "checkbox";
  selector?: Selector; // for 'value' and 'find'
  addButtonPath?: string; // for 'array'
  deleteButtonPath?: string; // for 'array'
  containerPath?: string; // for 'array'
  selectors?: {
    [fieldName: string]: Field; // nested fields for arrays
  };
  query?: string;
  isLoginPage?: boolean;
  required?: boolean;
  ignoredDomains?: string[];
}
export interface Config {
  jobUrlPatterns: string[];
  globalDelay: number;
  iframe?: string;
  fields: {
    [fieldName: string]: Field;
  }[];

  sitePatterns?: {
    workday: string[];
  };
  portal: string;
  feedbackBtnPatterns: string[];
}

export interface SelectorConfigData {
  status: boolean;
  message: string;
  data: Config;
}

export interface SelectorConfigCache {
  data: {
    [portal: string]: Config;
  };
  cachedAt: number;
}
