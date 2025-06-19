import jQuery from "jquery";
import { MessageBridge } from "./messageBridge";

const $JQ = jQuery.noConflict();

// ---------- Public Badge Handlers ----------

export function handleAddWhitelist(
    $: ($selector: string) => JQuery<HTMLElement>
) {
    handleBadgeAddition(
        $,
        "#whitelist-input",
        "#whitelist-badges",
        "bg-success",
        "whitelist"
    );
}

export function handleAddBlacklist(
    $: ($selector: string) => JQuery<HTMLElement>
) {
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
    const value = badge?.childNodes[0]?.textContent?.trim();

    if (!value) return;

    const isWhitelist = badge?.classList.contains("bg-success");
    const isBlacklist = badge?.classList.contains("bg-danger");

    const messageType = isWhitelist
        ? "removeWhiteLabelValue"
        : isBlacklist
        ? "removeBlackLabelValue"
        : null;

    if (messageType) {
        MessageBridge.sendToServiceWorker(
            { type: messageType, data: { value } },
            true
        );
        // NotificationManager.show("info", `Removed ${value}`);
    }

    badge?.remove();
}

// ---------- Internal Badge Addition Logic ----------

async function handleBadgeAddition(
    $: ($selector: string) => JQuery<HTMLElement>,
    inputSelector: string,
    containerSelector: string,
    badgeClass: string,
    listType: "whitelist" | "blacklist"
): Promise<void> {
    const input = $(inputSelector);
    const container = $(containerSelector);
    const rawVal = input.val();

    const val = typeof rawVal === "string" ? rawVal.trim() : "";

    if (!val) {
        // NotificationManager.show("info", "Please enter a keyword.");
        return;
    }

    // Prevent duplicate
    const existing = container.find(`.badge:contains(${val})`);
    if (existing.length > 0) {
        // NotificationManager.show("info", `"${val}" already exists.`);
        input.val("");
        return;
    }

    const badge = $JQ(`
    <span class="badge ${badgeClass} d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-medium">
        <span>${val}</span>
        <button
            type="button"
            class="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center"
            style="width: 22px; height: 22px; padding: 0; font-size: 14px; line-height: 1;"
            aria-label="Remove"
        >
            ×
        </button>
    </span>
`);

    container.append(badge);
    input.val("");

    // Store in storage
    const messageType =
        listType === "whitelist"
            ? "storeWhiteLabelValue"
            : "storeBlackLabelValue";

    try {
        await MessageBridge.sendToServiceWorker(
            { type: messageType, data: { value: val } },
            true
        );
        // NotificationManager.show("success", `Added "${val}" to ${listType}`);
    } catch (err) {
        console.error(`Failed to store ${listType} value:`, err);
        // NotificationManager.show("error", `Failed to add "${val}"`);
        badge.remove();
    }
}
