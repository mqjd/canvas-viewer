import mx from "./mx";
import type { MxGraph } from "./mx/mxgraph";

import { useShapes } from "./shapes";

useShapes();

declare type Ge = MxGraph & {
  mxPopupMenu: any;
  mxWorkflowFormat: any;
  mxGraphFormat: any;
  mxFormatEvent: any;
};
export default mx as Ge;

export * from "./mx";
