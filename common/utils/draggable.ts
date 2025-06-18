const activeListeners = new WeakMap<HTMLElement, () => void>();

export function dragElement(ele: HTMLElement): void {
    // Prevent double-binding
    if (activeListeners.has(ele)) {
        const cleanup = activeListeners.get(ele);
        cleanup?.();
    }

    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;

    const header = document.getElementById(
        ele.id + "job-keyword-analysis-popup"
    );
    const dragTarget = header || ele;

    const dragMouseDown = (e: MouseEvent): void => {
        const target = e.target as HTMLElement;
        const ignoredTags = [
            "INPUT",
            "TEXTAREA",
            "SELECT",
            "LABEL",
            "BUTTON",
            "I",
        ];

        if (!ignoredTags.includes(target.tagName)) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.addEventListener("mouseup", closeDragElement);
            document.addEventListener("mousemove", elementDrag);
        } else {
            target.focus();
        }
    };

    const elementDrag = (e: MouseEvent): void => {
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        const newTop = ele.offsetTop - pos2;
        const newLeft = ele.offsetLeft - pos1;

        // Constrain within viewport bounds
        const maxTop = window.innerHeight - ele.offsetHeight;
        const maxLeft = window.innerWidth - ele.offsetWidth;

        ele.style.top = Math.min(Math.max(0, newTop), maxTop) + "px";
        ele.style.left = Math.min(Math.max(0, newLeft), maxLeft) + "px";
    };

    const closeDragElement = (): void => {
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
    };

    dragTarget.onmousedown = dragMouseDown;

    // Ensure the element is absolutely positioned if not already
    if (
        !["absolute", "fixed"].includes(window.getComputedStyle(ele).position)
    ) {
        ele.style.position = "absolute";
    }

    // Set default cursor for better UX
    dragTarget.style.cursor = "move";

    // Store cleanup function to avoid duplicate listeners
    activeListeners.set(ele, () => {
        dragTarget.onmousedown = null;
        document.removeEventListener("mouseup", closeDragElement);
        document.removeEventListener("mousemove", elementDrag);
    });
}
