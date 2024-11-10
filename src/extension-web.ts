import { initGraph, mxCell, mxGeometry } from "./graph";

const defaultStyle =
  "shape=mxMarkdown;html=1;align=left;verticalAlign=top;whiteSpace=wrap;rounded=0;spacing=0;dropTarget=0;";

const themes: {
  [key: string]: string;
} = {
  "1": "fillColor=#e57373;strokeColor=#c62828;strokeWidth=3;opacity=50;", // red
  "2": "fillColor=#ffb74d;strokeColor=#ef6c00;strokeWidth=3;opacity=50;", // orange
  "3": "fillColor=#fff176;strokeColor=#f9a825;strokeWidth=3;opacity=50;", // yellow
  "4": "fillColor=#81c784;strokeColor=#2e7d32;strokeWidth=3;opacity=50;", // green
  "5": "fillColor=#4dd0e1;strokeColor=#00838f;strokeWidth=3;opacity=50;", // cyan
  "6": "fillColor=#ba68c8;strokeColor=#6a1b9a;strokeWidth=3;opacity=50;", // purple
};

const jsonToCell = (json: any) => {
  const { x, y, width, height, text, id, color } = json;
  const themeKey = color as string;
  const cell = new mxCell(
    text,
    new mxGeometry(x, y, +width, +height),
    defaultStyle + (themes[themeKey] || "")
  );
  cell.vertex = true;
  cell.id = id;
  return cell;
};

const jsonToEdge = (json: any, cellMap: any) => {
  const { label, fromNode, toNode, id } = json;
  const edge = new mxCell(label, new mxGeometry());
  edge.setId(id);
  edge.setEdge(true);
  edge.geometry.relative = true;
  edge.source = cellMap[fromNode];
  edge.target = cellMap[toNode];
  return edge;
};

const jsonToCells = (json: any) => {
  const root = new mxCell();
  root.id = "root";
  const defaultParent = new mxCell();
  defaultParent.id = "default";
  root.insert(defaultParent);

  const { nodes, edges } = json;
  const cells = nodes.map(jsonToCell);
  const cellMap = Object.fromEntries(cells.map((v: any) => [v.id, v]));

  return cells.concat(
    edges.map((edge: any) => {
      return jsonToEdge(edge, cellMap);
    })
  );
};

// @ts-ignore
const vscode = acquireVsCodeApi();
window.addEventListener("open_link", (event: any) => {
  const e = event.detail.event;
  vscode.postMessage({
    command: "open_link",
    data: {
      file: e.target.getAttribute("href"),
      newTab: e.ctrlKey || e.metaKey,
    },
  });
});

window.addEventListener("message", (event) => {
  const { command, data } = event.data;

  switch (command) {
    case "init":
      initGraph(document.querySelector("#app")!, jsonToCells(JSON.parse(data)));
      break;
  }
});

window.onload = function () {
  vscode.postMessage({
    command: "ready",
  });
};
