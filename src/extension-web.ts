import { initGraph, mxGraphModel, mxCell, mxGeometry } from "./graph";

const defaultStyle =
  "shape=mxMarkdown;html=1;align=left;verticalAlign=top;whiteSpace=wrap;rounded=0;spacing=0;dropTarget=0;";

const jsonToCell = (json: any) => {
  const { x, y, width, height, text, id } = json;
  const cell = new mxCell(
    text,
    new mxGeometry(x, y, +width, +height),
    defaultStyle
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

window.addEventListener("message", (event) => {
  const { command, data } = event.data;

  switch (command) {
    case "init":
      initGraph(document.querySelector("#app")!, jsonToCells(JSON.parse(data)));
      break;
  }
});
