import jQuery from "jquery";
var $JQ = jQuery.noConflict();

export function handleAddWhitelist($: Function) {
  handleBadgeAddition($, "#whitelist-input", "#whitelist-badges", "bg-success");
}

export function handleAddBlacklist($: Function) {
  handleBadgeAddition($, "#blacklist-input", "#blacklist-badges", "bg-danger");
}

export function handleBadgeRemove(target: HTMLElement) {
  target.closest(".badge")?.remove();
}

function handleBadgeAddition(
  $: Function,
  inputSelector: string,
  containerSelector: string,
  badgeClass: string
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
}
