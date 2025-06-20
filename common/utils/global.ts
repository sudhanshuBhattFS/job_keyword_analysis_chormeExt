export function getExtensionShadowRoot(): ShadowRoot | null {
    const host = document.querySelector("#job-keyword-analysis");
    return host instanceof HTMLElement ? host.shadowRoot : null;
}

export function showError(container: HTMLElement, msg: string): void {
    container.innerHTML = `<div class="alert alert-danger mb-2">${msg}</div>`;
}
