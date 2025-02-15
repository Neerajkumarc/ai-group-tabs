import { FilterRuleItem } from "./types";

export function setStorage<V = any>(key: string, value: V) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(true);
      }
    });
  });
}

export function getStorage<V = any>(key: string): Promise<V | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key]);
      }
    });
  });
}

export function matchesRule(url: URL, rule: FilterRuleItem) {
  const { type, rule: value } = rule;
  if (!value) {
    return false;
  }
  const host = url.host;
  switch (type) {
    case "DOMAIN":
      // Exact match; example.com should match example.com
      return host === value;
    case "DOMAIN-SUFFIX":
      // Suffix matching; example.com should match www.example.com
      return host.endsWith("." + value) || host === value;
    case "DOMAIN-KEYWORD":
      // Keyword matching; example should match www.example.com
      return host.includes(value);
    case "REGEX":
      // Regular expression matching; https?://mail.google.com/* should match https://mail.google.com/mail/u/0/#inbox
      return new RegExp(value).test(url.href);
    default:
      // If the rule type is unknown, return false.
      return false;
  }
}

export function getRootDomain(url: URL) {
  const host = url.host;
  const parts = host.split(".");
  if (parts.length <= 2) {
    return host;
  }
  return parts.slice(1).join(".");
}
