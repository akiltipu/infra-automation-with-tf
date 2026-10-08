export default function createCopyCodeFunctionality() {
  const cleanups = [];
  document.querySelectorAll(".lesson-content pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;
    const container = document.createElement("div");
    container.className = "div-copy";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy code to clipboard");
    button.setAttribute("aria-live", "polite");
    container.appendChild(button);
    pre.appendChild(container);
    let timeout;
    let active = true;
    const copy = async () => {
      try {
        // Copy the code only, never the button label.
        await navigator.clipboard.writeText(code.textContent);
        if (active) button.textContent = "Copied";
      } catch {
        if (active) button.textContent = "Select code to copy";
      }
      if (!active) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => { button.textContent = "Copy"; }, 2000);
    };
    button.addEventListener("click", copy);
    cleanups.push(() => {
      active = false;
      clearTimeout(timeout);
      button.removeEventListener("click", copy);
      container.remove();
    });
  });
  return () => cleanups.forEach((cleanup) => cleanup());
}
