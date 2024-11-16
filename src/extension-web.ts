// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener("open_link", (event: any) => {
  const e = event.detail.event;
  const file = e.target.getAttribute("href");
  if (file.endsWith(".canvas")) {
    vscode.postMessage({
      command: "open_link",
      data: {
        file: e.target.getAttribute("href"),
        newTab: e.ctrlKey || e.metaKey,
      },
    });
  }
});

window.addEventListener("message", (event) => {
  const { command, data } = event.data;

  switch (command) {
    case "init":
      // @ts-ignore
      window.initGraph(document.querySelector("#app")!, data);
      break;
  }
});

window.onload = function () {
  vscode.postMessage({
    command: "ready",
  });
};
