import jQuery from "jquery";
import { MessageBridge } from "./messageBridge";
var $JQ = jQuery.noConflict();

export function handleAddWhitelist($: Function) {
  handleBadgeAddition(
    $,
    "#whitelist-input",
    "#whitelist-badges",
    "bg-success",
    "whitelist"
  );
}

export function handleAddBlacklist($: Function) {
  handleBadgeAddition(
    $,
    "#blacklist-input",
    "#blacklist-badges",
    "bg-danger",
    "blacklist"
  );
}

export function handleBadgeRemove(target: HTMLElement) {
  const badge = target.closest(".badge");
  const value = badge?.textContent?.trim();
  const isWhitelist = badge?.classList.contains("bg-success");
  const isBlacklist = badge?.classList.contains("bg-danger");

  if (value) {
    if (isWhitelist) {
      MessageBridge.sendToServiceWorker(
        { type: "removeWhiteLabelValue", data: { value } },
        true
      );
    } else if (isBlacklist) {
      MessageBridge.sendToServiceWorker(
        { type: "removeBlackLabelValue", data: { value } },
        true
      );
    }
  }

  badge?.remove();
}

async function handleBadgeAddition(
  $: Function,
  inputSelector: string,
  containerSelector: string,
  badgeClass: string,
  listType: "whitelist" | "blacklist"
) {
  const input = $(inputSelector);
  const container = $(containerSelector);
  const val = input.val().trim();

  if (!val) return;

  const badge = $JQ(`
    <span class="badge ${badgeClass} p-2 d-flex align-items-center">
      ${val}
      <button type="button" class="btn-close btn-close-white btn-sm ms-2" aria-label="Remove"></button>
    </span>
  `);

  container.append(badge);
  input.val("");

  const messageType =
    listType === "whitelist" ? "storeWhiteLabelValue" : "storeBlackLabelValue";

  try {
    await MessageBridge.sendToServiceWorker(
      { type: messageType, data: { value: val } },
      true
    );
  } catch (err) {
    console.error(`Failed to store ${listType} value in service worker:`, err);
  }
}
