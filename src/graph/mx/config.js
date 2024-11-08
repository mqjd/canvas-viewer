export default {
  mxBasePath: window.mxBasePath + "mxgraph",
  uiTheme: "kennedy",
  mxLoadStylesheets: undefined,
  mxResourceExtension: undefined,
  mxLanguage: "zh",
  mxForceIncludes: false,
  mxLoadResources: false,
  urlParams: {},
  STENCIL_PATH: window.mxBasePath + "mxgraph/stencils",
  STYLE_PATH: window.mxBasePath + "mxgraph/styles",
  RESOURCE_BASE: window.mxBasePath + "mxgraph/resources/dia",
  DOM_PURIFY_CONFIG: window.DOM_PURIFY_CONFIG || {
    ADD_TAGS: ["use"],
    FORBID_TAGS: ["form"],
    ALLOWED_URI_REGEXP: /^((?!javascript:).)*$/i,
    ADD_ATTR: ["target", "content"],
  },
};
