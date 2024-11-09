import mx from "../mx";

export const useFindWindow = () => {
  const { mxResources, mxUtils, mxEvent, mxWindow, mxClient,Editor } = mx;
  var FindWindow = function (ui, x, y, w, h, withReplace) {
    var action = ui.actions.get("findReplace");

    var graph = ui.editor.graph;
    var lastSearch = null;
    var lastFound = null;
    var lastSearchSuccessful = false;
    var allChecked = false;
    var lblMatch = null;
    var lblMatchPos = 0;
    var marker = 1;

    var div = document.createElement("div");
    div.style.userSelect = "none";
    div.style.overflow = "hidden";
    div.style.padding = "10px";
    div.style.height = "100%";

    var txtWidth = withReplace ? "260px" : "200px";
    var searchInput = document.createElement("input");
    searchInput.setAttribute("placeholder", mxResources.get("find"));
    searchInput.setAttribute("type", "text");
    searchInput.style.marginTop = "4px";
    searchInput.style.marginBottom = "6px";
    searchInput.style.width = txtWidth;
    searchInput.style.fontSize = "12px";
    searchInput.style.borderRadius = "4px";
    searchInput.style.padding = "6px";
    div.appendChild(searchInput);
    mxUtils.br(div);

    var replaceInput;

    if (withReplace) {
      replaceInput = document.createElement("input");
      replaceInput.setAttribute("placeholder", mxResources.get("replaceWith"));
      replaceInput.setAttribute("type", "text");
      replaceInput.style.marginTop = "4px";
      replaceInput.style.marginBottom = "6px";
      replaceInput.style.width = txtWidth;
      replaceInput.style.fontSize = "12px";
      replaceInput.style.borderRadius = "4px";
      replaceInput.style.padding = "6px";
      div.appendChild(replaceInput);
      mxUtils.br(div);

      mxEvent.addListener(replaceInput, "input", updateReplBtns);
    }

    var regexInput = document.createElement("input");
    regexInput.setAttribute("id", "geFindWinRegExChck");
    regexInput.setAttribute("type", "checkbox");
    regexInput.style.marginRight = "4px";
    div.appendChild(regexInput);

    var regexLabel = document.createElement("label");
    regexLabel.setAttribute("for", "geFindWinRegExChck");
    div.appendChild(regexLabel);
    mxUtils.write(regexLabel, mxResources.get("regularExpression"));
    div.appendChild(regexLabel);

    // var help = ui.menus.createHelpLink('https://www.drawio.com/doc/faq/find-shapes');
    // help.style.position = 'relative';
    // help.style.marginLeft = '6px';
    // help.style.top = '3px';
    // div.appendChild(help);

    mxUtils.br(div);

    var allPagesInput = document.createElement("input");
    allPagesInput.setAttribute("id", "geFindWinAllPagesChck");
    allPagesInput.setAttribute("type", "checkbox");
    allPagesInput.style.marginRight = "4px";
    div.appendChild(allPagesInput);

    var allPagesLabel = document.createElement("label");
    allPagesLabel.setAttribute("for", "geFindWinAllPagesChck");
    div.appendChild(allPagesLabel);
    mxUtils.write(allPagesLabel, mxResources.get("allPages"));
    div.appendChild(allPagesLabel);

    var tmp = document.createElement("div");

    function testMeta(re, cell, search) {
      if (typeof cell.value === "object" && cell.value.attributes != null) {
        var attrs = cell.value.attributes;

        for (var i = 0; i < attrs.length; i++) {
          if (attrs[i].nodeName != "label") {
            var value = mxUtils
              .trim(
                attrs[i].nodeValue.replace(/[\x00-\x1F\x7F-\x9F]|\s+/g, " ")
              )
              .toLowerCase();

            if (
              (re == null && value.indexOf(search) >= 0) ||
              (re != null && re.test(value))
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }

    function updateReplBtns() {
      if (lastSearchSuccessful) {
        replaceFindBtn.removeAttribute("disabled");
        replaceBtn.removeAttribute("disabled");
      } else {
        replaceFindBtn.setAttribute("disabled", "disabled");
        replaceBtn.setAttribute("disabled", "disabled");
      }

      if (searchInput.value) {
        replaceAllBtn.removeAttribute("disabled");
      } else {
        replaceAllBtn.setAttribute("disabled", "disabled");
      }
    }

    function search(internalCall, trySameCell, stayOnPage) {
      replAllNotif.innerText = "";
      var cells = graph.model.getDescendants(graph.model.getRoot());
      var searchStr = searchInput.value.toLowerCase();
      var re = regexInput.checked ? new RegExp(searchStr) : null;
      var firstMatch = null;
      lblMatch = null;

      if (lastSearch != searchStr) {
        lastSearch = searchStr;
        lastFound = null;
        allChecked = false;
      }

      var active = lastFound == null;

      if (searchStr.length > 0) {
        if (allChecked) {
          allChecked = false;

          //Find current page index
          var currentPageIndex;

          for (var i = 0; i < ui.pages.length; i++) {
            if (ui.currentPage == ui.pages[i]) {
              currentPageIndex = i;
              break;
            }
          }

          var nextPageIndex = (currentPageIndex + 1) % ui.pages.length,
            nextPage;
          lastFound = null;

          do {
            allChecked = false;
            nextPage = ui.pages[nextPageIndex];
            graph = ui.createTemporaryGraph(graph.getStylesheet());
            ui.updatePageRoot(nextPage);
            graph.model.setRoot(nextPage.root);
            nextPageIndex = (nextPageIndex + 1) % ui.pages.length;
          } while (
            !search(true, trySameCell, stayOnPage) &&
            nextPageIndex != currentPageIndex
          );

          if (lastFound) {
            lastFound = null;

            if (!stayOnPage) {
              ui.selectPage(nextPage);
            } else {
              ui.editor.graph.model.execute(new SelectPage(ui, nextPage));
            }
          }

          allChecked = false;
          graph = ui.editor.graph;

          return search(true, trySameCell, stayOnPage);
        }

        var i;

        for (i = 0; i < cells.length; i++) {
          var state = graph.view.getState(cells[i]);

          //Try the same cell with replace to find other occurances
          if (trySameCell) {
            active = active || state == lastFound;
          }

          if (
            state != null &&
            state.cell.value != null &&
            (active || firstMatch == null) &&
            (graph.model.isVertex(state.cell) || graph.model.isEdge(state.cell))
          ) {
            let label;
            if (state.style != null && state.style["html"] == "1") {
              tmp.innerHTML = graph.sanitizeHtml(graph.getLabel(state.cell));
              label = mxUtils.extractTextWithWhitespace([tmp]);
            } else {
              label = graph.getLabel(state.cell);
            }

            label = mxUtils
              .trim(label.replace(/[\x00-\x1F\x7F-\x9F]|\s+/g, " "))
              .toLowerCase();
            var lblPosShift = 0;

            if (trySameCell && withReplace && state == lastFound) {
              label = label.substr(lblMatchPos);
              lblPosShift = lblMatchPos;
            }

            var checkMeta = replaceInput.value == "";

            if (
              (re == null &&
                (label.indexOf(searchStr) >= 0 ||
                  (checkMeta && testMeta(re, state.cell, searchStr)))) ||
              (re != null &&
                (re.test(label) ||
                  (checkMeta && testMeta(re, state.cell, searchStr))))
            ) {
              if (withReplace) {
                if (re != null) {
                  var result = label.match(re);

                  if (result != null && result.length > 0) {
                    lblMatch = result[0].toLowerCase();
                    lblMatchPos = lblPosShift + result.index + lblMatch.length;
                  }
                } else {
                  lblMatch = searchStr;
                  lblMatchPos =
                    lblPosShift + label.indexOf(searchStr) + lblMatch.length;
                }
              }

              if (active) {
                firstMatch = state;

                break;
              } else if (firstMatch == null) {
                firstMatch = state;
              }
            }
          }

          active = active || state == lastFound;
        }
      }

      if (firstMatch != null) {
        if (i == cells.length && allPagesInput.checked) {
          lastFound = null;
          allChecked = true;
          return search(true, trySameCell, stayOnPage);
        }

        lastFound = firstMatch;
        graph.scrollCellToVisible(lastFound.cell);

        if (graph.isEnabled() && !graph.isCellLocked(lastFound.cell)) {
          if (
            !stayOnPage &&
            (graph.getSelectionCell() != lastFound.cell ||
              graph.getSelectionCount() != 1)
          ) {
            graph.setSelectionCell(lastFound.cell);
          }
        } else {
          graph.highlightCell(lastFound.cell);
        }
      }
      //Check other pages
      else if (!internalCall && allPagesInput.checked) {
        allChecked = true;
        return search(true, trySameCell, stayOnPage);
      } else if (graph.isEnabled() && !stayOnPage) {
        graph.clearSelection();
      }

      lastSearchSuccessful = firstMatch != null;

      if (withReplace && !internalCall) {
        updateReplBtns();
      }

      return searchStr.length == 0 || firstMatch != null;
    }

    mxUtils.br(div);

    var btnsCont = document.createElement("div");
    btnsCont.style.left = "0px";
    btnsCont.style.right = "0px";
    btnsCont.style.marginTop = "6px";
    btnsCont.style.padding = "0 6px 0 6px";
    btnsCont.style.textAlign = "center";
    div.appendChild(btnsCont);

    var resetBtn = mxUtils.button(mxResources.get("reset"), function () {
      replAllNotif.innerText = "";
      searchInput.value = "";
      searchInput.style.backgroundColor = "";

      if (withReplace) {
        replaceInput.value = "";
        updateReplBtns();
      }

      lastFound = null;
      lastSearch = null;
      allChecked = false;
      searchInput.focus();
    });

    resetBtn.setAttribute("title", mxResources.get("reset"));
    resetBtn.style.float = "none";
    resetBtn.style.width = "120px";
    resetBtn.style.marginTop = "6px";
    resetBtn.style.marginLeft = "8px";
    resetBtn.style.overflow = "hidden";
    resetBtn.style.textOverflow = "ellipsis";
    resetBtn.className = "geBtn";

    if (!withReplace) {
      btnsCont.appendChild(resetBtn);
    }

    var btn = mxUtils.button(mxResources.get("find"), function () {
      try {
        searchInput.style.backgroundColor = search()
          ? ""
          : Editor.isDarkMode()
          ? "#ff0000"
          : "#ffcfcf";
      } catch (e) {
        ui.handleError(e);
      }
    });

    // TODO: Reset state after selection change
    btn.setAttribute("title", mxResources.get("find") + " (Enter)");
    btn.style.float = "none";
    btn.style.width = "120px";
    btn.style.marginTop = "6px";
    btn.style.marginLeft = "8px";
    btn.style.overflow = "hidden";
    btn.style.textOverflow = "ellipsis";
    btn.className = "geBtn gePrimaryBtn";

    btnsCont.appendChild(btn);

    var replAllNotif = document.createElement("div");
    replAllNotif.style.marginTop = "10px";

    if (!withReplace) {
      resetBtn.style.width = "90px";
      btn.style.width = "90px";
    } else {
      function replaceInLabel(str, substr, newSubstr, startIndex, style) {
        if (style == null || style["html"] != "1") {
          var replStart = str.toLowerCase().indexOf(substr, startIndex);
          return replStart < 0
            ? str
            : str.substr(0, replStart) +
                newSubstr +
                str.substr(replStart + substr.length);
        }

        var origStr = str;
        substr = mxUtils.htmlEntities(substr, false, false, false);
        var tagPos = [],
          p = -1;

        //Original position (startIndex) counts for \n which is removed when tags are removed, so handle <br> separately
        // The same for block level elements which are replaced by \n
        str = str
          .replace(/<br>/gi, "\n")
          .replace(
            /(\s|\S)(<(BLOCKQUOTE|DIV|H1|H2|H3|H4|H5|H6|OL|P|PRE|TABLE|UL)[^>]*>)/gi,
            "$1\n$2"
          );

        while ((p = str.indexOf("<", p + 1)) > -1) {
          tagPos.push(p);
        }

        var tags = str.match(/<[^>]*>/g);
        str = str.replace(/<[^>]*>/g, "");
        var lStr = str.toLowerCase();
        var replStart = lStr.indexOf(substr, startIndex);

        if (replStart < 0) {
          return origStr;
        }

        var replEnd = replStart + substr.length;
        var newSubstr = mxUtils.htmlEntities(newSubstr);

        //Tags within the replaced text is added before it
        var newStr = str.substr(0, replStart) + newSubstr + str.substr(replEnd);
        var tagDiff = 0;

        for (var i = 0; i < tagPos.length; i++) {
          if (tagPos[i] - tagDiff < replStart) {
            newStr =
              newStr.substr(0, tagPos[i]) + tags[i] + newStr.substr(tagPos[i]);
          } else if (tagPos[i] - tagDiff < replEnd) {
            var inPos = replStart + tagDiff;
            newStr = newStr.substr(0, inPos) + tags[i] + newStr.substr(inPos);
          } else {
            var inPos = tagPos[i] + (newSubstr.length - substr.length);
            newStr = newStr.substr(0, inPos) + tags[i] + newStr.substr(inPos);
          }

          tagDiff += tags[i].length;
        }

        return newStr
          .replace(
            /\n(<(BLOCKQUOTE|DIV|H1|H2|H3|H4|H5|H6|OL|P|PRE|TABLE|UL)[^>]*>)/gi,
            "$1"
          )
          .replace(/\n/g, "<br>");
      }

      var replaceFindBtn = mxUtils.button(
        mxResources.get("replFind"),
        function () {
          try {
            if (lblMatch != null && lastFound != null) {
              var cell = lastFound.cell,
                lbl = graph.getLabel(cell);

              if (graph.isCellEditable(cell)) {
                graph.model.setValue(
                  cell,
                  replaceInLabel(
                    lbl,
                    lblMatch,
                    replaceInput.value,
                    lblMatchPos - lblMatch.length,
                    graph.getCurrentCellStyle(cell)
                  )
                );
              }

              searchInput.style.backgroundColor = search(false, true)
                ? ""
                : Editor.isDarkMode()
                ? "#ff0000"
                : "#ffcfcf";
            }
          } catch (e) {
            ui.handleError(e);
          }
        }
      );

      replaceFindBtn.setAttribute("title", mxResources.get("replFind"));
      replaceFindBtn.style.float = "none";
      replaceFindBtn.style.width = "120px";
      replaceFindBtn.style.marginTop = "6px";
      replaceFindBtn.style.marginLeft = "8px";
      replaceFindBtn.style.overflow = "hidden";
      replaceFindBtn.style.textOverflow = "ellipsis";
      replaceFindBtn.className = "geBtn gePrimaryBtn";
      replaceFindBtn.setAttribute("disabled", "disabled");

      btnsCont.appendChild(replaceFindBtn);
      mxUtils.br(btnsCont);

      var replaceBtn = mxUtils.button(mxResources.get("replace"), function () {
        try {
          if (lblMatch != null && lastFound != null) {
            var cell = lastFound.cell,
              lbl = graph.getLabel(cell);

            graph.model.setValue(
              cell,
              replaceInLabel(
                lbl,
                lblMatch,
                replaceInput.value,
                lblMatchPos - lblMatch.length,
                graph.getCurrentCellStyle(cell)
              )
            );
            replaceFindBtn.setAttribute("disabled", "disabled");
            replaceBtn.setAttribute("disabled", "disabled");
          }
        } catch (e) {
          ui.handleError(e);
        }
      });

      replaceBtn.setAttribute("title", mxResources.get("replace"));
      replaceBtn.style.float = "none";
      replaceBtn.style.width = "120px";
      replaceBtn.style.marginTop = "6px";
      replaceBtn.style.marginLeft = "8px";
      replaceBtn.style.overflow = "hidden";
      replaceBtn.style.textOverflow = "ellipsis";
      replaceBtn.className = "geBtn gePrimaryBtn";
      replaceBtn.setAttribute("disabled", "disabled");

      btnsCont.appendChild(replaceBtn);

      var replaceAllBtn = mxUtils.button(
        mxResources.get("replaceAll"),
        function () {
          replAllNotif.innerText = "";

          lastSearch = null; // Reset last search to check all matches
          var currentPage = ui.currentPage;
          var cells = ui.editor.graph.getSelectionCells();
          ui.editor.graph.rendering = false;

          graph.getModel().beginUpdate();
          try {
            var safeguard = 0;
            var seen = {};

            while (search(false, true, true) && safeguard < 100) {
              var cell = lastFound.cell,
                lbl = graph.getLabel(cell);
              var oldSeen = seen[cell.id];

              if (
                oldSeen &&
                oldSeen.replAllMrk == marker &&
                oldSeen.replAllPos >= lblMatchPos
              ) {
                break;
              }

              seen[cell.id] = { replAllMrk: marker, replAllPos: lblMatchPos };

              if (graph.isCellEditable(cell)) {
                graph.model.setValue(
                  cell,
                  replaceInLabel(
                    lbl,
                    lblMatch,
                    replaceInput.value,
                    lblMatchPos - lblMatch.length,
                    graph.getCurrentCellStyle(cell)
                  )
                );
                safeguard++;
              }
            }

            if (currentPage != ui.currentPage) {
              ui.editor.graph.model.execute(new SelectPage(ui, currentPage));
            }

            mxUtils.write(
              replAllNotif,
              mxResources.get("matchesRepl", [safeguard])
            );
          } catch (e) {
            ui.handleError(e);
          } finally {
            graph.getModel().endUpdate();
            ui.editor.graph.setSelectionCells(cells);
            ui.editor.graph.rendering = true;
          }

          marker++;
        }
      );

      replaceAllBtn.setAttribute("title", mxResources.get("replaceAll"));
      replaceAllBtn.style.float = "none";
      replaceAllBtn.style.width = "120px";
      replaceAllBtn.style.marginTop = "6px";
      replaceAllBtn.style.marginLeft = "8px";
      replaceAllBtn.style.overflow = "hidden";
      replaceAllBtn.style.textOverflow = "ellipsis";
      replaceAllBtn.className = "geBtn gePrimaryBtn";
      replaceAllBtn.setAttribute("disabled", "disabled");

      btnsCont.appendChild(replaceAllBtn);
      mxUtils.br(btnsCont);
      btnsCont.appendChild(resetBtn);

      var closeBtn = mxUtils.button(
        mxResources.get("close"),
        mxUtils.bind(this, function () {
          this.window.setVisible(false);
        })
      );

      closeBtn.setAttribute("title", mxResources.get("close"));
      closeBtn.style.float = "none";
      closeBtn.style.width = "120px";
      closeBtn.style.marginTop = "6px";
      closeBtn.style.marginLeft = "8px";
      closeBtn.style.overflow = "hidden";
      closeBtn.style.textOverflow = "ellipsis";
      closeBtn.className = "geBtn";

      btnsCont.appendChild(closeBtn);
      mxUtils.br(btnsCont);
      btnsCont.appendChild(replAllNotif);
    }

    mxEvent.addListener(searchInput, "keyup", function (evt) {
      // Ctrl or Cmd keys
      if (evt.keyCode == 91 || evt.keyCode == 93 || evt.keyCode == 17) {
        // Workaround for lost focus on show
        mxEvent.consume(evt);
      } else if (evt.keyCode == 27) {
        // Escape closes window
        action.funct();
      } else if (
        lastSearch != searchInput.value.toLowerCase() ||
        evt.keyCode == 13
      ) {
        try {
          searchInput.style.backgroundColor = search()
            ? ""
            : Editor.isDarkMode()
            ? "#ff0000"
            : "#ffcfcf";
        } catch (e) {
          searchInput.style.backgroundColor = Editor.isDarkMode()
            ? "#ff0000"
            : "#ffcfcf";
        }
      }
    });

    // Ctrl+F closes window
    mxEvent.addListener(div, "keydown", function (evt) {
      if (
        evt.keyCode == 70 &&
        ui.keyHandler.isControlDown(evt) &&
        !mxEvent.isShiftDown(evt)
      ) {
        action.funct();
        mxEvent.consume(evt);
      }
    });

    this.window = new mxWindow(
      mxResources.get("find") +
        (withReplace ? "/" + mxResources.get("replace") : ""),
      div,
      x,
      y,
      w,
      h,
      true,
      true
    );
    this.window.destroyOnClose = false;
    this.window.setMaximizable(false);
    this.window.setResizable(false);
    this.window.setClosable(true);

    this.window.addListener(
      "show",
      mxUtils.bind(this, function () {
        this.window.fit();

        if (this.window.isVisible()) {
          searchInput.focus();

          if (mxClient.IS_GC || mxClient.IS_FF || document.documentMode >= 5) {
            searchInput.select();
          } else {
            document.execCommand("selectAll", false, null);
          }

          if (ui.pages != null && ui.pages.length > 1) {
            allPagesInput.removeAttribute("disabled");
          } else {
            allPagesInput.checked = false;
            allPagesInput.setAttribute("disabled", "disabled");
          }
        } else {
          graph.container.focus();
        }
      })
    );

    ui.installResizeHandler(this, false);
  };
  mx.FindWindow = FindWindow;
};

export const initFindWindow = (editorUi) => {
  const { mxUtils, Editor, FindWindow, mxEventObject, mxEvent } = mx;
  const graph = editorUi.editor.graph;
  const action = editorUi.actions.addAction(
    "findReplace",
    mxUtils.bind(editorUi, function (arg1, evt) {
      var findReplace =
        graph.isEnabled() && (evt == null || !mxEvent.isShiftDown(evt));
      var evtName = findReplace ? "findReplace" : "find";
      var name = evtName + "Window";

      if (this[name] == null) {
        var modern =
          Editor.currentTheme == "min" ||
          Editor.currentTheme == "simple" ||
          Editor.currentTheme == "sketch";
        var w = findReplace ? (modern ? 330 : 300) : 240;
        var h = findReplace ? (modern ? 304 : 288) : 170;
        this[name] = new FindWindow(
          editorUi,
          document.body.offsetWidth - (w + 20),
          100,
          w,
          h,
          findReplace
        );
        this[name].window.addListener("show", function () {
          editorUi.fireEvent(new mxEventObject(evtName));
        });
        this[name].window.addListener("hide", function () {
          editorUi.fireEvent(new mxEventObject(evtName));
        });
        this[name].window.setVisible(true);
      } else {
        this[name].window.setVisible(!this[name].window.isVisible());
      }
    }),
    null,
    null,
    Editor.ctrlKey + "+F"
  );
  action.setToggleAction(true);
  action.setSelectedCallback(
    mxUtils.bind(this, function () {
      var name = graph.isEnabled() ? "findReplaceWindow" : "findWindow";

      return this[name] != null && this[name].window.isVisible();
    })
  );

  editorUi.keyHandler.bindAction(70, true, "findReplace"); // Ctrl+F
};
