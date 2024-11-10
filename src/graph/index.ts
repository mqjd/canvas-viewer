import mx, { initFindWindow, useHierarchicalLayout } from "./graph";

mx.mxClient.link("stylesheet", mx.mxClient.basePath + "/css/editor.css");

export const initGraph = (el: HTMLElement, cells: any) => {
  const { Editor, EditorUi, mxResources } = mx;
  mxResources.loadDefaultBundle = false;
  mx.mxResources.add(mx.mxClient.basePath + "/resources/dia", "zh");
  const editorUi = new EditorUi(new Editor(), el);
  initFindWindow(editorUi);
  useHierarchicalLayout(editorUi);
  const graph = editorUi.editor.graph;
  editorUi.setPageVisible(false);
  // @ts-ignore
  window.editor = editorUi;
  // @ts-ignore
  window.graph = editorUi.editor.graph;
  graph.addCells(cells);

  editorUi.fitDiagramToWindow();
};

export * from "./graph";
