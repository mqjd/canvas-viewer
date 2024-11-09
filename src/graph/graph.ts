import mx from "./mx";
import type { MxGraph } from "./mx/mxgraph";

import { useShapes } from "./shapes";
import { useLayouts, useHierarchicalLayout } from "./lauouts";
import { useWindows, initFindWindow } from "./windows";

useShapes();
useWindows();
useLayouts();

declare type Ge = MxGraph & {
  mxPopupMenu: any;
  mxWorkflowFormat: any;
  mxGraphFormat: any;
  mxFormatEvent: any;
  FindWindow: any;
};
export default mx as Ge;

export { initFindWindow, useHierarchicalLayout };

export * from "./mx";
