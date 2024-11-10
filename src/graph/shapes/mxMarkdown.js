import markdownit from "markdown-it";
import replaceLink from "./replaceLink";
const markdownRender = markdownit({
  html: true, // Enable HTML tags in source
  xhtmlOut: false, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  langPrefix: "language-", // CSS language prefix for fenced blocks
  linkify: true, // autoconvert URL-like texts to links
  typographer: true, // Enable smartypants and other sweet transforms
  sourceMap: true, // Enable source map
}).use(replaceLink);

import mx from "../mx";
export const useMxMarkdown = () => {
  const { mxUtils, mxText, mxRectangleShape, mxCellRenderer, mxCellEditor } =
    mx;
  function mxMarkdown() {
    mxRectangleShape.apply(this, arguments);
  }
  mxUtils.extend(mxMarkdown, mxRectangleShape);

  mxCellRenderer.registerShape("mxMarkdown", mxMarkdown);

  function mxMarkdownText() {
    mxText.apply(this, arguments);
  }
  mxUtils.extend(mxMarkdownText, mxText);
  mxMarkdownText.prototype.isMarkdown = false;

  mxMarkdownText.prototype.initMarkdown = function (state) {
    this.isMarkdown = true;
    this.markdown = this.value;
    this.shapeState = state;
  };

  mxMarkdownText.prototype.paint = function (c, update) {
    if (this.isMarkdown) {
      this.markdown = this.value;
      this.value = "";
    }
    mxText.prototype.paint.apply(this, arguments);

    if (this.isMarkdown) {
      var g = this.node;
      var fo = g.firstChild;

      if (fo.nodeName === "title") {
        fo = fo.nextSibling;
      }

      var div = fo.firstChild;
      var box = div.firstChild;
      var text = box.firstChild;
      var md = text.firstChild;
      const scale = this.shapeState.view.scale;
      text.style.width = this.shapeState.width / scale + "px";
      text.style.height = this.shapeState.height / scale + "px";
      text.style.padding = "5px";
      text.style.top = "-5px";
      text.setAttribute("class", "markdown-body");
      md.style.width = "100%";
      md.innerHTML = markdownRender.render(this.markdown);
    }
  };

  mxCellRenderer.prototype.defaultTextShape = mxMarkdownText;

  let createTextShape = mxCellRenderer.prototype.createTextShape;
  mxCellRenderer.prototype.createTextShape = function (state) {
    const text = createTextShape.apply(this, arguments);
    if (state.shape instanceof mxMarkdown) {
      text.initMarkdown(state);
    }
    return text;
  };

  let resize = mxCellEditor.prototype.resize;
  mxCellEditor.prototype.resize = function () {
    resize.apply(this, arguments);
    var state = this.graph.getView().getState(this.editingCell);
    if (state && state.shape instanceof mxMarkdown) {
      this.textarea.style.overflow = "auto";
      this.textarea.style.padding = "5px";
      const scale = state.view.scale;
      this.textarea.style.height = state.height / scale + "px";
      this.textarea.style.width = state.width / scale + "px";
    }
  };

  const extractMarkdownText = function (elems) {
    var blocks = [
      "BLOCKQUOTE",
      "DIV",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "OL",
      "P",
      "PRE",
      "TABLE",
      "UL",
    ];
    var ret = [];

    function doExtract(elts) {
      // Single break should be ignored
      if (
        elts.length == 1 &&
        (elts[0].nodeName == "BR" || elts[0].innerHTML == "\n")
      ) {
        return;
      }

      for (var i = 0; i < elts.length; i++) {
        var elem = elts[i];

        // DIV with a br or linefeed forces a linefeed
        if (
          elem.nodeName == "BR" ||
          elem.innerHTML == "\n" ||
          ((elts.length == 1 || i == 0) &&
            elem.nodeName == "DIV" &&
            elem.innerHTML.toLowerCase() == "<br>")
        ) {
          ret.push("\n");
        } else {
          if (elem.nodeType === 3 || elem.nodeType === 4) {
            if (elem.nodeValue.length > 0) {
              ret.push(elem.nodeValue);
            }
          } else if (elem.nodeType !== 8 && elem.childNodes.length > 0) {
            doExtract(elem.childNodes);
          }

          if (
            i < elts.length - 1 &&
            mxUtils.indexOf(blocks, elts[i + 1].nodeName) >= 0
          ) {
            ret.push("\n");
          }
        }
      }
    }

    doExtract(elems);

    return ret.join("");
  };

  const mxCellEditorGetCurrentValue = mxCellEditor.prototype.getCurrentValue;
  mxCellEditor.prototype.getCurrentValue = function (state) {
    if (state.shape instanceof mxMarkdown) {
      return extractMarkdownText(this.textarea.childNodes);
    } else {
      return mxCellEditorGetCurrentValue.apply(this, arguments);
    }
  };
};
