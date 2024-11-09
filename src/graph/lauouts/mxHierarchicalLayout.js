import mx from "../mx";

export const useMxHierarchicalLayout = () => {
  const {
    mxGraphLayout,
    mxConstants,
    mxCell,
    mxDictionary,
    mxObjectIdentity,
    mxUtils,
    WeightedCellSorter,
    mxPoint,
  } = mx;

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxGraphAbstractHierarchyCell
   *
   * An abstraction of an internal hierarchy node or edge
   *
   * Constructor: mxGraphAbstractHierarchyCell
   *
   * Constructs a new hierarchical layout algorithm.
   */
  function mxGraphAbstractHierarchyCell() {
    this.x = [];
    this.y = [];
    this.temp = [];
  }

  /**
   * Variable: maxRank
   *
   * The maximum rank this cell occupies. Default is -1.
   */
  mxGraphAbstractHierarchyCell.prototype.maxRank = -1;

  /**
   * Variable: minRank
   *
   * The minimum rank this cell occupies. Default is -1.
   */
  mxGraphAbstractHierarchyCell.prototype.minRank = -1;

  /**
   * Variable: x
   *
   * The x position of this cell for each layer it occupies
   */
  mxGraphAbstractHierarchyCell.prototype.x = null;

  /**
   * Variable: y
   *
   * The y position of this cell for each layer it occupies
   */
  mxGraphAbstractHierarchyCell.prototype.y = null;

  /**
   * Variable: width
   *
   * The width of this cell. Default is 0.
   */
  mxGraphAbstractHierarchyCell.prototype.width = 0;

  /**
   * Variable: height
   *
   * The height of this cell. Default is 0.
   */
  mxGraphAbstractHierarchyCell.prototype.height = 0;

  /**
   * Variable: nextLayerConnectedCells
   *
   * A cached version of the cells this cell connects to on the next layer up
   */
  mxGraphAbstractHierarchyCell.prototype.nextLayerConnectedCells = null;

  /**
   * Variable: previousLayerConnectedCells
   *
   * A cached version of the cells this cell connects to on the next layer down
   */
  mxGraphAbstractHierarchyCell.prototype.previousLayerConnectedCells = null;

  /**
   * Variable: temp
   *
   * Temporary variable for general use. Generally, try to avoid
   * carrying information between stages. Currently, the longest
   * path layering sets temp to the rank position in fixRanks()
   * and the crossing reduction uses this. This meant temp couldn't
   * be used for hashing the nodes in the model dfs and so hashCode
   * was created
   */
  mxGraphAbstractHierarchyCell.prototype.temp = null;

  /**
   * Function: getNextLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer up
   */
  mxGraphAbstractHierarchyCell.prototype.getNextLayerConnectedCells = function (
    layer
  ) {
    return null;
  };

  /**
   * Function: getPreviousLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer down
   */
  mxGraphAbstractHierarchyCell.prototype.getPreviousLayerConnectedCells =
    function (layer) {
      return null;
    };

  /**
   * Function: isEdge
   *
   * Returns whether or not this cell is an edge
   */
  mxGraphAbstractHierarchyCell.prototype.isEdge = function () {
    return false;
  };

  /**
   * Function: isVertex
   *
   * Returns whether or not this cell is a node
   */
  mxGraphAbstractHierarchyCell.prototype.isVertex = function () {
    return false;
  };

  /**
   * Function: getGeneralPurposeVariable
   *
   * Gets the value of temp for the specified layer
   */
  mxGraphAbstractHierarchyCell.prototype.getGeneralPurposeVariable = function (
    layer
  ) {
    return null;
  };

  /**
   * Function: setGeneralPurposeVariable
   *
   * Set the value of temp for the specified layer
   */
  mxGraphAbstractHierarchyCell.prototype.setGeneralPurposeVariable = function (
    layer,
    value
  ) {
    return null;
  };

  /**
   * Function: setX
   *
   * Set the value of x for the specified layer
   */
  mxGraphAbstractHierarchyCell.prototype.setX = function (layer, value) {
    if (this.isVertex()) {
      this.x[0] = value;
    } else if (this.isEdge()) {
      this.x[layer - this.minRank - 1] = value;
    }
  };

  /**
   * Function: getX
   *
   * Gets the value of x on the specified layer
   */
  mxGraphAbstractHierarchyCell.prototype.getX = function (layer) {
    if (this.isVertex()) {
      return this.x[0];
    } else if (this.isEdge()) {
      return this.x[layer - this.minRank - 1];
    }

    return 0.0;
  };

  /**
   * Function: setY
   *
   * Set the value of y for the specified layer
   */
  mxGraphAbstractHierarchyCell.prototype.setY = function (layer, value) {
    if (this.isVertex()) {
      this.y[0] = value;
    } else if (this.isEdge()) {
      this.y[layer - this.minRank - 1] = value;
    }
  };

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxGraphHierarchyEdge
   *
   * An abstraction of a hierarchical edge for the hierarchy layout
   *
   * Constructor: mxGraphHierarchyEdge
   *
   * Constructs a hierarchy edge
   *
   * Arguments:
   *
   * edges - a list of real graph edges this abstraction represents
   */
  function mxGraphHierarchyEdge(edges) {
    mxGraphAbstractHierarchyCell.apply(this, arguments);
    this.edges = edges;
    this.ids = [];

    for (var i = 0; i < edges.length; i++) {
      this.ids.push(mxObjectIdentity.get(edges[i]));
    }
  }

  /**
   * Extends mxGraphAbstractHierarchyCell.
   */
  mxGraphHierarchyEdge.prototype = new mxGraphAbstractHierarchyCell();
  mxGraphHierarchyEdge.prototype.constructor = mxGraphHierarchyEdge;

  /**
   * Variable: edges
   *
   * The graph edge(s) this object represents. Parallel edges are all grouped
   * together within one hierarchy edge.
   */
  mxGraphHierarchyEdge.prototype.edges = null;

  /**
   * Variable: ids
   *
   * The object identities of the wrapped cells
   */
  mxGraphHierarchyEdge.prototype.ids = null;

  /**
   * Variable: source
   *
   * The node this edge is sourced at
   */
  mxGraphHierarchyEdge.prototype.source = null;

  /**
   * Variable: target
   *
   * The node this edge targets
   */
  mxGraphHierarchyEdge.prototype.target = null;

  /**
   * Variable: isReversed
   *
   * Whether or not the direction of this edge has been reversed
   * internally to create a DAG for the hierarchical layout
   */
  mxGraphHierarchyEdge.prototype.isReversed = false;

  /**
   * Function: invert
   *
   * Inverts the direction of this internal edge(s)
   */
  mxGraphHierarchyEdge.prototype.invert = function (layer) {
    var temp = this.source;
    this.source = this.target;
    this.target = temp;
    this.isReversed = !this.isReversed;
  };

  /**
   * Function: getNextLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer up
   */
  mxGraphHierarchyEdge.prototype.getNextLayerConnectedCells = function (layer) {
    if (this.nextLayerConnectedCells == null) {
      this.nextLayerConnectedCells = [];

      for (var i = 0; i < this.temp.length; i++) {
        this.nextLayerConnectedCells[i] = [];

        if (i == this.temp.length - 1) {
          this.nextLayerConnectedCells[i].push(this.source);
        } else {
          this.nextLayerConnectedCells[i].push(this);
        }
      }
    }

    return this.nextLayerConnectedCells[layer - this.minRank - 1];
  };

  /**
   * Function: getPreviousLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer down
   */
  mxGraphHierarchyEdge.prototype.getPreviousLayerConnectedCells = function (
    layer
  ) {
    if (this.previousLayerConnectedCells == null) {
      this.previousLayerConnectedCells = [];

      for (var i = 0; i < this.temp.length; i++) {
        this.previousLayerConnectedCells[i] = [];

        if (i == 0) {
          this.previousLayerConnectedCells[i].push(this.target);
        } else {
          this.previousLayerConnectedCells[i].push(this);
        }
      }
    }

    return this.previousLayerConnectedCells[layer - this.minRank - 1];
  };

  /**
   * Function: isEdge
   *
   * Returns true.
   */
  mxGraphHierarchyEdge.prototype.isEdge = function () {
    return true;
  };

  /**
   * Function: getGeneralPurposeVariable
   *
   * Gets the value of temp for the specified layer
   */
  mxGraphHierarchyEdge.prototype.getGeneralPurposeVariable = function (layer) {
    return this.temp[layer - this.minRank - 1];
  };

  /**
   * Function: setGeneralPurposeVariable
   *
   * Set the value of temp for the specified layer
   */
  mxGraphHierarchyEdge.prototype.setGeneralPurposeVariable = function (
    layer,
    value
  ) {
    this.temp[layer - this.minRank - 1] = value;
  };

  /**
   * Function: getCoreCell
   *
   * Gets the first core edge associated with this wrapper
   */
  mxGraphHierarchyEdge.prototype.getCoreCell = function () {
    if (this.edges != null && this.edges.length > 0) {
      return this.edges[0];
    }

    return null;
  };

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxGraphHierarchyModel
   *
   * Internal model of a hierarchical graph. This model stores nodes and edges
   * equivalent to the real graph nodes and edges, but also stores the rank of the
   * cells, the order within the ranks and the new candidate locations of cells.
   * The internal model also reverses edge direction were appropriate , ignores
   * self-loop and groups parallels together under one edge object.
   *
   * Constructor: mxGraphHierarchyModel
   *
   * Creates an internal ordered graph model using the vertices passed in. If
   * there are any, leftward edge need to be inverted in the internal model
   *
   * Arguments:
   *
   * graph - the facade describing the graph to be operated on
   * vertices - the vertices for this hierarchy
   * ordered - whether or not the vertices are already ordered
   * deterministic - whether or not this layout should be deterministic on each
   * tightenToSource - whether or not to tighten vertices towards the sources
   * scanRanksFromSinks - Whether rank assignment is from the sinks or sources.
   * usage
   */
  function mxGraphHierarchyModel(
    layout,
    vertices,
    roots,
    parent,
    tightenToSource
  ) {
    var graph = layout.getGraph();
    this.tightenToSource = tightenToSource;
    this.roots = roots;
    this.parent = parent;

    // map of cells to internal cell needed for second run through
    // to setup the sink of edges correctly
    this.vertexMapper = new mxDictionary();
    this.edgeMapper = new mxDictionary();
    this.maxRank = 0;
    var internalVertices = [];

    if (vertices == null) {
      vertices = this.graph.getChildVertices(parent);
    }

    this.maxRank = this.SOURCESCANSTARTRANK;
    // map of cells to internal cell needed for second run through
    // to setup the sink of edges correctly. Guess size by number
    // of edges is roughly same as number of vertices.
    this.createInternalCells(layout, vertices, internalVertices);

    // Go through edges set their sink values. Also check the
    // ordering if and invert edges if necessary
    for (var i = 0; i < vertices.length; i++) {
      var edges = internalVertices[i].connectsAsSource;

      for (var j = 0; j < edges.length; j++) {
        var internalEdge = edges[j];
        var realEdges = internalEdge.edges;

        // Only need to process the first real edge, since
        // all the edges connect to the same other vertex
        if (realEdges != null && realEdges.length > 0) {
          var realEdge = realEdges[0];
          var targetCell = layout.getVisibleTerminal(realEdge, false);
          var internalTargetCell = this.vertexMapper.get(targetCell);

          if (internalVertices[i] == internalTargetCell) {
            // If there are parallel edges going between two vertices and not all are in the same direction
            // you can have navigated across one direction when doing the cycle reversal that isn't the same
            // direction as the first real edge in the array above. When that happens the if above catches
            // that and we correct the target cell before continuing.
            // This branch only detects this single case
            targetCell = layout.getVisibleTerminal(realEdge, true);
            internalTargetCell = this.vertexMapper.get(targetCell);
          }

          if (
            internalTargetCell != null &&
            internalVertices[i] != internalTargetCell
          ) {
            internalEdge.target = internalTargetCell;

            if (internalTargetCell.connectsAsTarget.length == 0) {
              internalTargetCell.connectsAsTarget = [];
            }

            if (
              mxUtils.indexOf(
                internalTargetCell.connectsAsTarget,
                internalEdge
              ) < 0
            ) {
              internalTargetCell.connectsAsTarget.push(internalEdge);
            }
          }
        }
      }

      // Use the temp variable in the internal nodes to mark this
      // internal vertex as having been visited.
      internalVertices[i].temp[0] = 1;
    }
  }

  /**
   * Variable: maxRank
   *
   * Stores the largest rank number allocated
   */
  mxGraphHierarchyModel.prototype.maxRank = null;

  /**
   * Variable: vertexMapper
   *
   * Map from graph vertices to internal model nodes.
   */
  mxGraphHierarchyModel.prototype.vertexMapper = null;

  /**
   * Variable: edgeMapper
   *
   * Map from graph edges to internal model edges
   */
  mxGraphHierarchyModel.prototype.edgeMapper = null;

  /**
   * Variable: ranks
   *
   * Mapping from rank number to actual rank
   */
  mxGraphHierarchyModel.prototype.ranks = null;

  /**
   * Variable: roots
   *
   * Store of roots of this hierarchy model, these are real graph cells, not
   * internal cells
   */
  mxGraphHierarchyModel.prototype.roots = null;

  /**
   * Variable: parent
   *
   * The parent cell whose children are being laid out
   */
  mxGraphHierarchyModel.prototype.parent = null;

  /**
   * Variable: dfsCount
   *
   * Count of the number of times the ancestor dfs has been used.
   */
  mxGraphHierarchyModel.prototype.dfsCount = 0;

  /**
   * Variable: SOURCESCANSTARTRANK
   *
   * High value to start source layering scan rank value from.
   */
  mxGraphHierarchyModel.prototype.SOURCESCANSTARTRANK = 100000000;

  /**
   * Variable: tightenToSource
   *
   * Whether or not to tighten the assigned ranks of vertices up towards
   * the source cells.
   */
  mxGraphHierarchyModel.prototype.tightenToSource = false;

  /**
   * Function: createInternalCells
   *
   * Creates all edges in the internal model
   *
   * Parameters:
   *
   * layout - Reference to the <mxHierarchicalLayout> algorithm.
   * vertices - Array of <mxCells> that represent the vertices whom are to
   * have an internal representation created.
   * internalVertices - The array of <mxGraphHierarchyNodes> to have their
   * information filled in using the real vertices.
   */
  mxGraphHierarchyModel.prototype.createInternalCells = function (
    layout,
    vertices,
    internalVertices
  ) {
    var graph = layout.getGraph();

    // Create internal edges
    for (var i = 0; i < vertices.length; i++) {
      internalVertices[i] = new mxGraphHierarchyNode(vertices[i]);
      this.vertexMapper.put(vertices[i], internalVertices[i]);

      // If the layout is deterministic, order the cells
      //List outgoingCells = graph.getNeighbours(vertices[i], deterministic);
      var conns = layout.getEdges(vertices[i]);
      internalVertices[i].connectsAsSource = [];

      // Create internal edges, but don't do any rank assignment yet
      // First use the information from the greedy cycle remover to
      // invert the leftward edges internally
      for (var j = 0; j < conns.length; j++) {
        var cell = layout.getVisibleTerminal(conns[j], false);

        // Looking for outgoing edges only
        if (
          cell != vertices[i] &&
          layout.graph.model.isVertex(cell) &&
          !layout.isVertexIgnored(cell)
        ) {
          // We process all edge between this source and its targets
          // If there are edges going both ways, we need to collect
          // them all into one internal edges to avoid looping problems
          // later. We assume this direction (source -> target) is the
          // natural direction if at least half the edges are going in
          // that direction.

          // The check below for edges[0] being in the vertex mapper is
          // in case we've processed this the other way around
          // (target -> source) and the number of edges in each direction
          // are the same. All the graph edges will have been assigned to
          // an internal edge going the other way, so we don't want to
          // process them again
          var undirectedEdges = layout.getEdgesBetween(
            vertices[i],
            cell,
            false
          );
          var directedEdges = layout.getEdgesBetween(vertices[i], cell, true);

          if (
            undirectedEdges != null &&
            undirectedEdges.length > 0 &&
            this.edgeMapper.get(undirectedEdges[0]) == null &&
            directedEdges.length * 2 >= undirectedEdges.length
          ) {
            var internalEdge = new mxGraphHierarchyEdge(undirectedEdges);

            for (var k = 0; k < undirectedEdges.length; k++) {
              var edge = undirectedEdges[k];
              this.edgeMapper.put(edge, internalEdge);

              // Resets all point on the edge and disables the edge style
              // without deleting it from the cell style
              graph.resetEdge(edge);

              if (layout.disableEdgeStyle) {
                layout.setEdgeStyleEnabled(edge, false);
                layout.setOrthogonalEdge(edge, true);
              }
            }

            internalEdge.source = internalVertices[i];

            if (
              mxUtils.indexOf(
                internalVertices[i].connectsAsSource,
                internalEdge
              ) < 0
            ) {
              internalVertices[i].connectsAsSource.push(internalEdge);
            }
          }
        }
      }

      // Ensure temp variable is cleared from any previous use
      internalVertices[i].temp[0] = 0;
    }
  };

  /**
   * Function: initialRank
   *
   * Basic determination of minimum layer ranking by working from from sources
   * or sinks and working through each node in the relevant edge direction.
   * Starting at the sinks is basically a longest path layering algorithm.
   */
  mxGraphHierarchyModel.prototype.initialRank = function () {
    var startNodes = [];

    if (this.roots != null) {
      for (var i = 0; i < this.roots.length; i++) {
        var internalNode = this.vertexMapper.get(this.roots[i]);

        if (internalNode != null) {
          startNodes.push(internalNode);
        }
      }
    }

    var internalNodes = this.vertexMapper.getValues();

    for (var i = 0; i < internalNodes.length; i++) {
      // Mark the node as not having had a layer assigned
      internalNodes[i].temp[0] = -1;
    }

    var startNodesCopy = startNodes.slice();

    while (startNodes.length > 0) {
      var internalNode = startNodes[0];
      var layerDeterminingEdges;
      var edgesToBeMarked;

      layerDeterminingEdges = internalNode.connectsAsTarget;
      edgesToBeMarked = internalNode.connectsAsSource;

      // flag to keep track of whether or not all layer determining
      // edges have been scanned
      var allEdgesScanned = true;

      // Work out the layer of this node from the layer determining
      // edges. The minimum layer number of any node connected by one of
      // the layer determining edges variable
      var minimumLayer = this.SOURCESCANSTARTRANK;

      for (var i = 0; i < layerDeterminingEdges.length; i++) {
        var internalEdge = layerDeterminingEdges[i];

        if (internalEdge.temp[0] == 5270620) {
          // This edge has been scanned, get the layer of the
          // node on the other end
          var otherNode = internalEdge.source;
          minimumLayer = Math.min(minimumLayer, otherNode.temp[0] - 1);
        } else {
          allEdgesScanned = false;

          break;
        }
      }

      // If all edge have been scanned, assign the layer, mark all
      // edges in the other direction and remove from the nodes list
      if (allEdgesScanned) {
        internalNode.temp[0] = minimumLayer;
        this.maxRank = Math.min(this.maxRank, minimumLayer);

        if (edgesToBeMarked != null) {
          for (var i = 0; i < edgesToBeMarked.length; i++) {
            var internalEdge = edgesToBeMarked[i];

            // Assign unique stamp ( y/m/d/h )
            internalEdge.temp[0] = 5270620;

            // Add node on other end of edge to LinkedList of
            // nodes to be analysed
            var otherNode = internalEdge.target;

            // Only add node if it hasn't been assigned a layer
            if (otherNode.temp[0] == -1) {
              startNodes.push(otherNode);

              // Mark this other node as neither being
              // unassigned nor assigned so it isn't
              // added to this list again, but it's
              // layer isn't used in any calculation.
              otherNode.temp[0] = -2;
            }
          }
        }

        startNodes.shift();
      } else {
        // Not all the edges have been scanned, get to the back of
        // the class and put the dunces cap on
        var removedCell = startNodes.shift();
        startNodes.push(internalNode);

        if (removedCell == internalNode && startNodes.length == 1) {
          // This is an error condition, we can't get out of
          // this loop. It could happen for more than one node
          // but that's a lot harder to detect. Log the error
          // TODO make log comment
          break;
        }
      }
    }

    // Normalize the ranks down from their large starting value to place
    // at least 1 sink on layer 0
    for (var i = 0; i < internalNodes.length; i++) {
      // Mark the node as not having had a layer assigned
      internalNodes[i].temp[0] -= this.maxRank;
    }

    // Tighten the rank 0 nodes as far as possible
    for (var i = 0; i < startNodesCopy.length; i++) {
      var internalNode = startNodesCopy[i];
      var currentMaxLayer = 0;
      var layerDeterminingEdges = internalNode.connectsAsSource;

      for (var j = 0; j < layerDeterminingEdges.length; j++) {
        var internalEdge = layerDeterminingEdges[j];
        var otherNode = internalEdge.target;
        internalNode.temp[0] = Math.max(currentMaxLayer, otherNode.temp[0] + 1);
        currentMaxLayer = internalNode.temp[0];
      }
    }

    // Reset the maxRank to that which would be expected for a from-sink
    // scan
    this.maxRank = this.SOURCESCANSTARTRANK - this.maxRank;
  };

  /**
   * Function: fixRanks
   *
   * Fixes the layer assignments to the values stored in the nodes. Also needs
   * to create dummy nodes for edges that cross layers.
   */
  mxGraphHierarchyModel.prototype.fixRanks = function () {
    var rankList = [];
    this.ranks = [];

    for (var i = 0; i < this.maxRank + 1; i++) {
      rankList[i] = [];
      this.ranks[i] = rankList[i];
    }

    // Perform a DFS to obtain an initial ordering for each rank.
    // Without doing this you would end up having to process
    // crossings for a standard tree.
    var rootsArray = null;

    if (this.roots != null) {
      var oldRootsArray = this.roots;
      rootsArray = [];

      for (var i = 0; i < oldRootsArray.length; i++) {
        var cell = oldRootsArray[i];
        var internalNode = this.vertexMapper.get(cell);
        rootsArray[i] = internalNode;
      }
    }

    this.visit(
      function (parent, node, edge, layer, seen) {
        if (seen == 0 && node.maxRank < 0 && node.minRank < 0) {
          rankList[node.temp[0]].push(node);
          node.maxRank = node.temp[0];
          node.minRank = node.temp[0];

          // Set temp[0] to the nodes position in the rank
          node.temp[0] = rankList[node.maxRank].length - 1;
        }

        if (parent != null && edge != null) {
          var parentToCellRankDifference = parent.maxRank - node.maxRank;

          if (parentToCellRankDifference > 1) {
            // There are ranks in between the parent and current cell
            edge.maxRank = parent.maxRank;
            edge.minRank = node.maxRank;
            edge.temp = [];
            edge.x = [];
            edge.y = [];

            for (var i = edge.minRank + 1; i < edge.maxRank; i++) {
              // The connecting edge must be added to the
              // appropriate ranks
              rankList[i].push(edge);
              edge.setGeneralPurposeVariable(i, rankList[i].length - 1);
            }
          }
        }
      },
      rootsArray,
      false,
      null
    );
  };

  /**
   * Function: visit
   *
   * A depth first search through the internal heirarchy model.
   *
   * Parameters:
   *
   * visitor - The visitor function pattern to be called for each node.
   * trackAncestors - Whether or not the search is to keep track all nodes
   * directly above this one in the search path.
   */
  mxGraphHierarchyModel.prototype.visit = function (
    visitor,
    dfsRoots,
    trackAncestors,
    seenNodes
  ) {
    // Run dfs through on all roots
    if (dfsRoots != null) {
      for (var i = 0; i < dfsRoots.length; i++) {
        var internalNode = dfsRoots[i];

        if (internalNode != null) {
          if (seenNodes == null) {
            seenNodes = new Object();
          }

          if (trackAncestors) {
            // Set up hash code for root
            internalNode.hashCode = [];
            internalNode.hashCode[0] = this.dfsCount;
            internalNode.hashCode[1] = i;
            this.extendedDfs(
              null,
              internalNode,
              null,
              visitor,
              seenNodes,
              internalNode.hashCode,
              i,
              0
            );
          } else {
            this.dfs(null, internalNode, null, visitor, seenNodes, 0);
          }
        }
      }

      this.dfsCount++;
    }
  };

  /**
   * Function: dfs
   *
   * Performs a depth first search on the internal hierarchy model
   *
   * Parameters:
   *
   * parent - the parent internal node of the current internal node
   * root - the current internal node
   * connectingEdge - the internal edge connecting the internal node and the parent
   * internal node, if any
   * visitor - the visitor pattern to be called for each node
   * seen - a set of all nodes seen by this dfs a set of all of the
   * ancestor node of the current node
   * layer - the layer on the dfs tree ( not the same as the model ranks )
   */
  mxGraphHierarchyModel.prototype.dfs = function (
    parent,
    root,
    connectingEdge,
    visitor,
    seen,
    layer
  ) {
    if (root != null) {
      var rootId = root.id;

      if (seen[rootId] == null) {
        seen[rootId] = root;
        visitor(parent, root, connectingEdge, layer, 0);

        // Copy the connects as source list so that visitors
        // can change the original for edge direction inversions
        var outgoingEdges = root.connectsAsSource.slice();

        for (var i = 0; i < outgoingEdges.length; i++) {
          var internalEdge = outgoingEdges[i];
          var targetNode = internalEdge.target;

          // Root check is O(|roots|)
          this.dfs(root, targetNode, internalEdge, visitor, seen, layer + 1);
        }
      } else {
        // Use the int field to indicate this node has been seen
        visitor(parent, root, connectingEdge, layer, 1);
      }
    }
  };

  /**
   * Function: extendedDfs
   *
   * Performs a depth first search on the internal hierarchy model. This dfs
   * extends the default version by keeping track of cells ancestors, but it
   * should be only used when necessary because of it can be computationally
   * intensive for deep searches.
   *
   * Parameters:
   *
   * parent - the parent internal node of the current internal node
   * root - the current internal node
   * connectingEdge - the internal edge connecting the internal node and the parent
   * internal node, if any
   * visitor - the visitor pattern to be called for each node
   * seen - a set of all nodes seen by this dfs
   * ancestors - the parent hash code
   * childHash - the new hash code for this node
   * layer - the layer on the dfs tree ( not the same as the model ranks )
   */
  mxGraphHierarchyModel.prototype.extendedDfs = function (
    parent,
    root,
    connectingEdge,
    visitor,
    seen,
    ancestors,
    childHash,
    layer
  ) {
    // Explanation of custom hash set. Previously, the ancestors variable
    // was passed through the dfs as a HashSet. The ancestors were copied
    // into a new HashSet and when the new child was processed it was also
    // added to the set. If the current node was in its ancestor list it
    // meant there is a cycle in the graph and this information is passed
    // to the visitor.visit() in the seen parameter. The HashSet clone was
    // very expensive on CPU so a custom hash was developed using primitive
    // types. temp[] couldn't be used so hashCode[] was added to each node.
    // Each new child adds another int to the array, copying the prefix
    // from its parent. Child of the same parent add different ints (the
    // limit is therefore 2^32 children per parent...). If a node has a
    // child with the hashCode already set then the child code is compared
    // to the same portion of the current nodes array. If they match there
    // is a loop.
    // Note that the basic mechanism would only allow for 1 use of this
    // functionality, so the root nodes have two ints. The second int is
    // incremented through each node root and the first is incremented
    // through each run of the dfs algorithm (therefore the dfs is not
    // thread safe). The hash code of each node is set if not already set,
    // or if the first int does not match that of the current run.
    if (root != null) {
      if (parent != null) {
        // Form this nodes hash code if necessary, that is, if the
        // hashCode variable has not been initialized or if the
        // start of the parent hash code does not equal the start of
        // this nodes hash code, indicating the code was set on a
        // previous run of this dfs.
        if (root.hashCode == null || root.hashCode[0] != parent.hashCode[0]) {
          var hashCodeLength = parent.hashCode.length + 1;
          root.hashCode = parent.hashCode.slice();
          root.hashCode[hashCodeLength - 1] = childHash;
        }
      }

      var rootId = root.id;

      if (seen[rootId] == null) {
        seen[rootId] = root;
        visitor(parent, root, connectingEdge, layer, 0);

        // Copy the connects as source list so that visitors
        // can change the original for edge direction inversions
        var outgoingEdges = root.connectsAsSource.slice();

        for (var i = 0; i < outgoingEdges.length; i++) {
          var internalEdge = outgoingEdges[i];
          var targetNode = internalEdge.target;

          // Root check is O(|roots|)
          this.extendedDfs(
            root,
            targetNode,
            internalEdge,
            visitor,
            seen,
            root.hashCode,
            i,
            layer + 1
          );
        }
      } else {
        // Use the int field to indicate this node has been seen
        visitor(parent, root, connectingEdge, layer, 1);
      }
    }
  };

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxGraphHierarchyNode
   *
   * An abstraction of a hierarchical edge for the hierarchy layout
   *
   * Constructor: mxGraphHierarchyNode
   *
   * Constructs an internal node to represent the specified real graph cell
   *
   * Arguments:
   *
   * cell - the real graph cell this node represents
   */
  function mxGraphHierarchyNode(cell) {
    mxGraphAbstractHierarchyCell.apply(this, arguments);
    this.cell = cell;
    this.id = mxObjectIdentity.get(cell);
    this.connectsAsTarget = [];
    this.connectsAsSource = [];
  }

  /**
   * Extends mxGraphAbstractHierarchyCell.
   */
  mxGraphHierarchyNode.prototype = new mxGraphAbstractHierarchyCell();
  mxGraphHierarchyNode.prototype.constructor = mxGraphHierarchyNode;

  /**
   * Variable: cell
   *
   * The graph cell this object represents.
   */
  mxGraphHierarchyNode.prototype.cell = null;

  /**
   * Variable: id
   *
   * The object identity of the wrapped cell
   */
  mxGraphHierarchyNode.prototype.id = null;

  /**
   * Variable: connectsAsTarget
   *
   * Collection of hierarchy edges that have this node as a target
   */
  mxGraphHierarchyNode.prototype.connectsAsTarget = null;

  /**
   * Variable: connectsAsSource
   *
   * Collection of hierarchy edges that have this node as a source
   */
  mxGraphHierarchyNode.prototype.connectsAsSource = null;

  /**
   * Variable: hashCode
   *
   * Assigns a unique hashcode for each node. Used by the model dfs instead
   * of copying HashSets
   */
  mxGraphHierarchyNode.prototype.hashCode = false;

  /**
   * Function: getRankValue
   *
   * Returns the integer value of the layer that this node resides in
   */
  mxGraphHierarchyNode.prototype.getRankValue = function (layer) {
    return this.maxRank;
  };

  /**
   * Function: getNextLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer up
   */
  mxGraphHierarchyNode.prototype.getNextLayerConnectedCells = function (layer) {
    if (this.nextLayerConnectedCells == null) {
      this.nextLayerConnectedCells = [];
      this.nextLayerConnectedCells[0] = [];

      for (var i = 0; i < this.connectsAsTarget.length; i++) {
        var edge = this.connectsAsTarget[i];

        if (edge.maxRank == -1 || edge.maxRank == layer + 1) {
          // Either edge is not in any rank or
          // no dummy nodes in edge, add node of other side of edge
          this.nextLayerConnectedCells[0].push(edge.source);
        } else {
          // Edge spans at least two layers, add edge
          this.nextLayerConnectedCells[0].push(edge);
        }
      }
    }

    return this.nextLayerConnectedCells[0];
  };

  /**
   * Function: getPreviousLayerConnectedCells
   *
   * Returns the cells this cell connects to on the next layer down
   */
  mxGraphHierarchyNode.prototype.getPreviousLayerConnectedCells = function (
    layer
  ) {
    if (this.previousLayerConnectedCells == null) {
      this.previousLayerConnectedCells = [];
      this.previousLayerConnectedCells[0] = [];

      for (var i = 0; i < this.connectsAsSource.length; i++) {
        var edge = this.connectsAsSource[i];

        if (edge.minRank == -1 || edge.minRank == layer - 1) {
          // No dummy nodes in edge, add node of other side of edge
          this.previousLayerConnectedCells[0].push(edge.target);
        } else {
          // Edge spans at least two layers, add edge
          this.previousLayerConnectedCells[0].push(edge);
        }
      }
    }

    return this.previousLayerConnectedCells[0];
  };

  /**
   * Function: isVertex
   *
   * Returns true.
   */
  mxGraphHierarchyNode.prototype.isVertex = function () {
    return true;
  };

  /**
   * Function: getGeneralPurposeVariable
   *
   * Gets the value of temp for the specified layer
   */
  mxGraphHierarchyNode.prototype.getGeneralPurposeVariable = function (layer) {
    return this.temp[0];
  };

  /**
   * Function: setGeneralPurposeVariable
   *
   * Set the value of temp for the specified layer
   */
  mxGraphHierarchyNode.prototype.setGeneralPurposeVariable = function (
    layer,
    value
  ) {
    this.temp[0] = value;
  };

  /**
   * Function: isAncestor
   */
  mxGraphHierarchyNode.prototype.isAncestor = function (otherNode) {
    // Firstly, the hash code of this node needs to be shorter than the
    // other node
    if (
      otherNode != null &&
      this.hashCode != null &&
      otherNode.hashCode != null &&
      this.hashCode.length < otherNode.hashCode.length
    ) {
      if (this.hashCode == otherNode.hashCode) {
        return true;
      }

      if (this.hashCode == null || this.hashCode == null) {
        return false;
      }

      // Secondly, this hash code must match the start of the other
      // node's hash code. Arrays.equals cannot be used here since
      // the arrays are different length, and we do not want to
      // perform another array copy.
      for (var i = 0; i < this.hashCode.length; i++) {
        if (this.hashCode[i] != otherNode.hashCode[i]) {
          return false;
        }
      }

      return true;
    }

    return false;
  };

  /**
   * Function: getCoreCell
   *
   * Gets the core vertex associated with this wrapper
   */
  mxGraphHierarchyNode.prototype.getCoreCell = function () {
    return this.cell;
  };

  /**
   * Copyright (c) 2006-2018, JGraph Ltd
   * Copyright (c) 2006-2018, Gaudenz Alder
   */
  /**
   * Class: mxCoordinateAssignment
   *
   * Sets the horizontal locations of node and edge dummy nodes on each layer.
   * Uses median down and up weighings as well as heuristics to straighten edges as
   * far as possible.
   *
   * Constructor: mxCoordinateAssignment
   *
   * Creates a coordinate assignment.
   *
   * Arguments:
   *
   * intraCellSpacing - the minimum buffer between cells on the same rank
   * interRankCellSpacing - the minimum distance between cells on adjacent ranks
   * orientation - the position of the root node(s) relative to the graph
   * initialX - the leftmost coordinate node placement starts at
   */
  function mxCoordinateAssignment(
    layout,
    intraCellSpacing,
    interRankCellSpacing,
    orientation,
    initialX,
    parallelEdgeSpacing
  ) {
    this.layout = layout;
    this.intraCellSpacing = intraCellSpacing;
    this.interRankCellSpacing = interRankCellSpacing;
    this.orientation = orientation;
    this.initialX = initialX;
    this.parallelEdgeSpacing = parallelEdgeSpacing;
  }

  /**
   * Extends mxHierarchicalLayoutStage.
   */
  mxCoordinateAssignment.prototype = new mxHierarchicalLayoutStage();
  mxCoordinateAssignment.prototype.constructor = mxCoordinateAssignment;

  /**
   * Variable: layout
   *
   * Reference to the enclosing <mxHierarchicalLayout>.
   */
  mxCoordinateAssignment.prototype.layout = null;

  /**
   * Variable: intraCellSpacing
   *
   * The minimum buffer between cells on the same rank. Default is 30.
   */
  mxCoordinateAssignment.prototype.intraCellSpacing = 30;

  /**
   * Variable: interRankCellSpacing
   *
   * The minimum distance between cells on adjacent ranks. Default is 100.
   */
  mxCoordinateAssignment.prototype.interRankCellSpacing = 100;

  /**
   * Variable: parallelEdgeSpacing
   *
   * The distance between each parallel edge on each ranks for long edges.
   * Default is 10.
   */
  mxCoordinateAssignment.prototype.parallelEdgeSpacing = 10;

  /**
   * Variable: maxIterations
   *
   * The number of heuristic iterations to run. Default is 8.
   */
  mxCoordinateAssignment.prototype.maxIterations = 8;

  /**
   * Variable: prefHozEdgeSep
   *
   * The preferred horizontal distance between edges exiting a vertex Default is 5.
   */
  mxCoordinateAssignment.prototype.prefHozEdgeSep = 5;

  /**
   * Variable: prefVertEdgeOff
   *
   * The preferred vertical offset between edges exiting a vertex Default is 2.
   */
  mxCoordinateAssignment.prototype.prefVertEdgeOff = 2;

  /**
   * Variable: minEdgeJetty
   *
   * The minimum distance for an edge jetty from a vertex Default is 12.
   */
  mxCoordinateAssignment.prototype.minEdgeJetty = 12;

  /**
   * Variable: channelBuffer
   *
   * The size of the vertical buffer in the center of inter-rank channels
   * where edge control points should not be placed Default is 4.
   */
  mxCoordinateAssignment.prototype.channelBuffer = 4;

  /**
   * Variable: jettyPositions
   *
   * Map of internal edges and (x,y) pair of positions of the start and end jetty
   * for that edge where it connects to the source and target vertices.
   * Note this should technically be a WeakHashMap, but since JS does not
   * have an equivalent, housekeeping must be performed before using.
   * i.e. check all edges are still in the model and clear the values.
   * Note that the y co-ord is the offset of the jetty, not the
   * absolute point
   */
  mxCoordinateAssignment.prototype.jettyPositions = null;

  /**
   * Variable: orientation
   *
   * The position of the root ( start ) node(s) relative to the rest of the
   * laid out graph. Default is <mxConstants.DIRECTION_NORTH>.
   */
  mxCoordinateAssignment.prototype.orientation = mxConstants.DIRECTION_NORTH;

  /**
   * Variable: initialX
   *
   * The minimum x position node placement starts at
   */
  mxCoordinateAssignment.prototype.initialX = null;

  /**
   * Variable: limitX
   *
   * The maximum x value this positioning lays up to
   */
  mxCoordinateAssignment.prototype.limitX = null;

  /**
   * Variable: currentXDelta
   *
   * The sum of x-displacements for the current iteration
   */
  mxCoordinateAssignment.prototype.currentXDelta = null;

  /**
   * Variable: widestRank
   *
   * The rank that has the widest x position
   */
  mxCoordinateAssignment.prototype.widestRank = null;

  /**
   * Variable: rankTopY
   *
   * Internal cache of top-most values of Y for each rank
   */
  mxCoordinateAssignment.prototype.rankTopY = null;

  /**
   * Variable: rankBottomY
   *
   * Internal cache of bottom-most value of Y for each rank
   */
  mxCoordinateAssignment.prototype.rankBottomY = null;

  /**
   * Variable: widestRankValue
   *
   * The X-coordinate of the edge of the widest rank
   */
  mxCoordinateAssignment.prototype.widestRankValue = null;

  /**
   * Variable: rankWidths
   *
   * The width of all the ranks
   */
  mxCoordinateAssignment.prototype.rankWidths = null;

  /**
   * Variable: rankY
   *
   * The Y-coordinate of all the ranks
   */
  mxCoordinateAssignment.prototype.rankY = null;

  /**
   * Variable: fineTuning
   *
   * Whether or not to perform local optimisations and iterate multiple times
   * through the algorithm. Default is true.
   */
  mxCoordinateAssignment.prototype.fineTuning = true;

  /**
   * Variable: nextLayerConnectedCache
   *
   * A store of connections to the layer above for speed
   */
  mxCoordinateAssignment.prototype.nextLayerConnectedCache = null;

  /**
   * Variable: previousLayerConnectedCache
   *
   * A store of connections to the layer below for speed
   */
  mxCoordinateAssignment.prototype.previousLayerConnectedCache = null;

  /**
   * Variable: groupPadding
   *
   * Padding added to resized parents Default is 10.
   */
  mxCoordinateAssignment.prototype.groupPadding = 10;

  /**
   * Utility method to display current positions
   */
  mxCoordinateAssignment.prototype.printStatus = function () {
    var model = this.layout.getModel();
    mxLog.show();

    mxLog.writeln("======Coord assignment debug=======");

    for (var j = 0; j < model.ranks.length; j++) {
      mxLog.write("Rank ", j, " : ");
      var rank = model.ranks[j];

      for (var k = 0; k < rank.length; k++) {
        var cell = rank[k];

        mxLog.write(cell.getGeneralPurposeVariable(j), "  ");
      }
      mxLog.writeln();
    }

    mxLog.writeln("====================================");
  };

  /**
   * Function: execute
   *
   * A basic horizontal coordinate assignment algorithm
   */
  mxCoordinateAssignment.prototype.execute = function (parent) {
    this.jettyPositions = Object();
    var model = this.layout.getModel();
    this.currentXDelta = 0.0;

    this.initialCoords(this.layout.getGraph(), model);

    //	this.printStatus();

    if (this.fineTuning) {
      this.minNode(model);
    }

    var bestXDelta = 100000000.0;

    if (this.fineTuning) {
      for (var i = 0; i < this.maxIterations; i++) {
        //			this.printStatus();

        // Median Heuristic
        if (i != 0) {
          this.medianPos(i, model);
          this.minNode(model);
        }

        // if the total offset is less for the current positioning,
        // there are less heavily angled edges and so the current
        // positioning is used
        if (this.currentXDelta < bestXDelta) {
          for (var j = 0; j < model.ranks.length; j++) {
            var rank = model.ranks[j];

            for (var k = 0; k < rank.length; k++) {
              var cell = rank[k];
              cell.setX(j, cell.getGeneralPurposeVariable(j));
            }
          }

          bestXDelta = this.currentXDelta;
        } else {
          // Restore the best positions
          for (var j = 0; j < model.ranks.length; j++) {
            var rank = model.ranks[j];

            for (var k = 0; k < rank.length; k++) {
              var cell = rank[k];
              cell.setGeneralPurposeVariable(j, cell.getX(j));
            }
          }
        }

        this.minPath(this.layout.getGraph(), model);

        this.currentXDelta = 0;
      }
    }

    this.setCellLocations(this.layout.getGraph(), model);
  };

  /**
   * Function: minNode
   *
   * Performs one median positioning sweep in both directions
   */
  mxCoordinateAssignment.prototype.minNode = function (model) {
    // Queue all nodes
    var nodeList = [];

    // Need to be able to map from cell to cellWrapper
    var map = new mxDictionary();
    var rank = [];

    for (var i = 0; i <= model.maxRank; i++) {
      rank[i] = model.ranks[i];

      for (var j = 0; j < rank[i].length; j++) {
        // Use the weight to store the rank and visited to store whether
        // or not the cell is in the list
        var node = rank[i][j];
        var nodeWrapper = new WeightedCellSorter(node, i);
        nodeWrapper.rankIndex = j;
        nodeWrapper.visited = true;
        nodeList.push(nodeWrapper);

        map.put(node, nodeWrapper);
      }
    }

    // Set a limit of the maximum number of times we will access the queue
    // in case a loop appears
    var maxTries = nodeList.length * 10;
    var count = 0;

    // Don't move cell within this value of their median
    var tolerance = 1;

    while (nodeList.length > 0 && count <= maxTries) {
      var cellWrapper = nodeList.shift();
      var cell = cellWrapper.cell;

      var rankValue = cellWrapper.weightedValue;
      var rankIndex = parseInt(cellWrapper.rankIndex);

      var nextLayerConnectedCells = cell.getNextLayerConnectedCells(rankValue);
      var previousLayerConnectedCells =
        cell.getPreviousLayerConnectedCells(rankValue);

      var numNextLayerConnected = nextLayerConnectedCells.length;
      var numPreviousLayerConnected = previousLayerConnectedCells.length;

      var medianNextLevel = this.medianXValue(
        nextLayerConnectedCells,
        rankValue + 1
      );
      var medianPreviousLevel = this.medianXValue(
        previousLayerConnectedCells,
        rankValue - 1
      );

      var numConnectedNeighbours =
        numNextLayerConnected + numPreviousLayerConnected;
      var currentPosition = cell.getGeneralPurposeVariable(rankValue);
      var cellMedian = currentPosition;

      if (numConnectedNeighbours > 0) {
        cellMedian =
          (medianNextLevel * numNextLayerConnected +
            medianPreviousLevel * numPreviousLayerConnected) /
          numConnectedNeighbours;
      }

      // Flag storing whether or not position has changed
      var positionChanged = false;

      if (cellMedian < currentPosition - tolerance) {
        if (rankIndex == 0) {
          cell.setGeneralPurposeVariable(rankValue, cellMedian);
          positionChanged = true;
        } else {
          var leftCell = rank[rankValue][rankIndex - 1];
          var leftLimit = leftCell.getGeneralPurposeVariable(rankValue);
          leftLimit =
            leftLimit +
            leftCell.width / 2 +
            this.intraCellSpacing +
            cell.width / 2;

          if (leftLimit < cellMedian) {
            cell.setGeneralPurposeVariable(rankValue, cellMedian);
            positionChanged = true;
          } else if (
            leftLimit <
            cell.getGeneralPurposeVariable(rankValue) - tolerance
          ) {
            cell.setGeneralPurposeVariable(rankValue, leftLimit);
            positionChanged = true;
          }
        }
      } else if (cellMedian > currentPosition + tolerance) {
        var rankSize = rank[rankValue].length;

        if (rankIndex == rankSize - 1) {
          cell.setGeneralPurposeVariable(rankValue, cellMedian);
          positionChanged = true;
        } else {
          var rightCell = rank[rankValue][rankIndex + 1];
          var rightLimit = rightCell.getGeneralPurposeVariable(rankValue);
          rightLimit =
            rightLimit -
            rightCell.width / 2 -
            this.intraCellSpacing -
            cell.width / 2;

          if (rightLimit > cellMedian) {
            cell.setGeneralPurposeVariable(rankValue, cellMedian);
            positionChanged = true;
          } else if (
            rightLimit >
            cell.getGeneralPurposeVariable(rankValue) + tolerance
          ) {
            cell.setGeneralPurposeVariable(rankValue, rightLimit);
            positionChanged = true;
          }
        }
      }

      if (positionChanged) {
        // Add connected nodes to map and list
        for (var i = 0; i < nextLayerConnectedCells.length; i++) {
          var connectedCell = nextLayerConnectedCells[i];
          var connectedCellWrapper = map.get(connectedCell);

          if (connectedCellWrapper != null) {
            if (connectedCellWrapper.visited == false) {
              connectedCellWrapper.visited = true;
              nodeList.push(connectedCellWrapper);
            }
          }
        }

        // Add connected nodes to map and list
        for (var i = 0; i < previousLayerConnectedCells.length; i++) {
          var connectedCell = previousLayerConnectedCells[i];
          var connectedCellWrapper = map.get(connectedCell);

          if (connectedCellWrapper != null) {
            if (connectedCellWrapper.visited == false) {
              connectedCellWrapper.visited = true;
              nodeList.push(connectedCellWrapper);
            }
          }
        }
      }

      cellWrapper.visited = false;
      count++;
    }
  };

  /**
   * Function: medianPos
   *
   * Performs one median positioning sweep in one direction
   *
   * Parameters:
   *
   * i - the iteration of the whole process
   * model - an internal model of the hierarchical layout
   */
  mxCoordinateAssignment.prototype.medianPos = function (i, model) {
    // Reverse sweep direction each time through this method
    var downwardSweep = i % 2 == 0;

    if (downwardSweep) {
      for (var j = model.maxRank; j > 0; j--) {
        this.rankMedianPosition(j - 1, model, j);
      }
    } else {
      for (var j = 0; j < model.maxRank - 1; j++) {
        this.rankMedianPosition(j + 1, model, j);
      }
    }
  };

  /**
   * Function: rankMedianPosition
   *
   * Performs median minimisation over one rank.
   *
   * Parameters:
   *
   * rankValue - the layer number of this rank
   * model - an internal model of the hierarchical layout
   * nextRankValue - the layer number whose connected cels are to be laid out
   * relative to
   */
  mxCoordinateAssignment.prototype.rankMedianPosition = function (
    rankValue,
    model,
    nextRankValue
  ) {
    var rank = model.ranks[rankValue];

    // Form an array of the order in which the cell are to be processed
    // , the order is given by the weighted sum of the in or out edges,
    // depending on whether we're traveling up or down the hierarchy.
    var weightedValues = [];
    var cellMap = new Object();

    for (var i = 0; i < rank.length; i++) {
      var currentCell = rank[i];
      weightedValues[i] = new WeightedCellSorter();
      weightedValues[i].cell = currentCell;
      weightedValues[i].rankIndex = i;
      cellMap[currentCell.id] = weightedValues[i];
      var nextLayerConnectedCells = null;

      if (nextRankValue < rankValue) {
        nextLayerConnectedCells =
          currentCell.getPreviousLayerConnectedCells(rankValue);
      } else {
        nextLayerConnectedCells =
          currentCell.getNextLayerConnectedCells(rankValue);
      }

      // Calculate the weighing based on this node type and those this
      // node is connected to on the next layer
      weightedValues[i].weightedValue = this.calculatedWeightedValue(
        currentCell,
        nextLayerConnectedCells
      );
    }

    weightedValues.sort(WeightedCellSorter.prototype.compare);

    // Set the new position of each node within the rank using
    // its temp variable

    for (var i = 0; i < weightedValues.length; i++) {
      var numConnectionsNextLevel = 0;
      var cell = weightedValues[i].cell;
      var nextLayerConnectedCells = null;
      var medianNextLevel = 0;

      if (nextRankValue < rankValue) {
        nextLayerConnectedCells = cell
          .getPreviousLayerConnectedCells(rankValue)
          .slice();
      } else {
        nextLayerConnectedCells = cell
          .getNextLayerConnectedCells(rankValue)
          .slice();
      }

      if (nextLayerConnectedCells != null) {
        numConnectionsNextLevel = nextLayerConnectedCells.length;

        if (numConnectionsNextLevel > 0) {
          medianNextLevel = this.medianXValue(
            nextLayerConnectedCells,
            nextRankValue
          );
        } else {
          // For case of no connections on the next level set the
          // median to be the current position and try to be
          // positioned there
          medianNextLevel = cell.getGeneralPurposeVariable(rankValue);
        }
      }

      var leftBuffer = 0.0;
      var leftLimit = -100000000.0;

      for (var j = weightedValues[i].rankIndex - 1; j >= 0; ) {
        var weightedValue = cellMap[rank[j].id];

        if (weightedValue != null) {
          var leftCell = weightedValue.cell;

          if (weightedValue.visited) {
            // The left limit is the right hand limit of that
            // cell plus any allowance for unallocated cells
            // in-between
            leftLimit =
              leftCell.getGeneralPurposeVariable(rankValue) +
              leftCell.width / 2.0 +
              this.intraCellSpacing +
              leftBuffer +
              cell.width / 2.0;
            j = -1;
          } else {
            leftBuffer += leftCell.width + this.intraCellSpacing;
            j--;
          }
        }
      }

      var rightBuffer = 0.0;
      var rightLimit = 100000000.0;

      for (
        var j = weightedValues[i].rankIndex + 1;
        j < weightedValues.length;

      ) {
        var weightedValue = cellMap[rank[j].id];

        if (weightedValue != null) {
          var rightCell = weightedValue.cell;

          if (weightedValue.visited) {
            // The left limit is the right hand limit of that
            // cell plus any allowance for unallocated cells
            // in-between
            rightLimit =
              rightCell.getGeneralPurposeVariable(rankValue) -
              rightCell.width / 2.0 -
              this.intraCellSpacing -
              rightBuffer -
              cell.width / 2.0;
            j = weightedValues.length;
          } else {
            rightBuffer += rightCell.width + this.intraCellSpacing;
            j++;
          }
        }
      }

      if (medianNextLevel >= leftLimit && medianNextLevel <= rightLimit) {
        cell.setGeneralPurposeVariable(rankValue, medianNextLevel);
      } else if (medianNextLevel < leftLimit) {
        // Couldn't place at median value, place as close to that
        // value as possible
        cell.setGeneralPurposeVariable(rankValue, leftLimit);
        this.currentXDelta += leftLimit - medianNextLevel;
      } else if (medianNextLevel > rightLimit) {
        // Couldn't place at median value, place as close to that
        // value as possible
        cell.setGeneralPurposeVariable(rankValue, rightLimit);
        this.currentXDelta += medianNextLevel - rightLimit;
      }

      weightedValues[i].visited = true;
    }
  };

  /**
   * Function: calculatedWeightedValue
   *
   * Calculates the priority the specified cell has based on the type of its
   * cell and the cells it is connected to on the next layer
   *
   * Parameters:
   *
   * currentCell - the cell whose weight is to be calculated
   * collection - the cells the specified cell is connected to
   */
  mxCoordinateAssignment.prototype.calculatedWeightedValue = function (
    currentCell,
    collection
  ) {
    var totalWeight = 0;

    for (var i = 0; i < collection.length; i++) {
      var cell = collection[i];

      if (currentCell.isVertex() && cell.isVertex()) {
        totalWeight++;
      } else if (currentCell.isEdge() && cell.isEdge()) {
        totalWeight += 8;
      } else {
        totalWeight += 2;
      }
    }

    return totalWeight;
  };

  /**
   * Function: medianXValue
   *
   * Calculates the median position of the connected cell on the specified
   * rank
   *
   * Parameters:
   *
   * connectedCells - the cells the candidate connects to on this level
   * rankValue - the layer number of this rank
   */
  mxCoordinateAssignment.prototype.medianXValue = function (
    connectedCells,
    rankValue
  ) {
    if (connectedCells.length == 0) {
      return 0;
    }

    var medianValues = [];

    for (var i = 0; i < connectedCells.length; i++) {
      medianValues[i] = connectedCells[i].getGeneralPurposeVariable(rankValue);
    }

    medianValues.sort(function (a, b) {
      return a - b;
    });

    if (connectedCells.length % 2 == 1) {
      // For odd numbers of adjacent vertices return the median
      return medianValues[Math.floor(connectedCells.length / 2)];
    } else {
      var medianPoint = connectedCells.length / 2;
      var leftMedian = medianValues[medianPoint - 1];
      var rightMedian = medianValues[medianPoint];

      return (leftMedian + rightMedian) / 2;
    }
  };

  /**
   * Function: initialCoords
   *
   * Sets up the layout in an initial positioning. The ranks are all centered
   * as much as possible along the middle vertex in each rank. The other cells
   * are then placed as close as possible on either side.
   *
   * Parameters:
   *
   * facade - the facade describing the input graph
   * model - an internal model of the hierarchical layout
   */
  mxCoordinateAssignment.prototype.initialCoords = function (facade, model) {
    this.calculateWidestRank(facade, model);

    // Sweep up and down from the widest rank
    for (var i = this.widestRank; i >= 0; i--) {
      if (i < model.maxRank) {
        this.rankCoordinates(i, facade, model);
      }
    }

    for (var i = this.widestRank + 1; i <= model.maxRank; i++) {
      if (i > 0) {
        this.rankCoordinates(i, facade, model);
      }
    }
  };

  /**
   * Function: rankCoordinates
   *
   * Sets up the layout in an initial positioning. All the first cells in each
   * rank are moved to the left and the rest of the rank inserted as close
   * together as their size and buffering permits. This method works on just
   * the specified rank.
   *
   * Parameters:
   *
   * rankValue - the current rank being processed
   * graph - the facade describing the input graph
   * model - an internal model of the hierarchical layout
   */
  mxCoordinateAssignment.prototype.rankCoordinates = function (
    rankValue,
    graph,
    model
  ) {
    var rank = model.ranks[rankValue];
    var maxY = 0.0;
    var localX =
      this.initialX + (this.widestRankValue - this.rankWidths[rankValue]) / 2;

    // Store whether or not any of the cells' bounds were unavailable so
    // to only issue the warning once for all cells
    var boundsWarning = false;

    for (var i = 0; i < rank.length; i++) {
      var node = rank[i];

      if (node.isVertex()) {
        var bounds = this.layout.getVertexBounds(node.cell);

        if (bounds != null) {
          if (
            this.orientation == mxConstants.DIRECTION_NORTH ||
            this.orientation == mxConstants.DIRECTION_SOUTH
          ) {
            node.width = bounds.width;
            node.height = bounds.height;
          } else {
            node.width = bounds.height;
            node.height = bounds.width;
          }
        } else {
          boundsWarning = true;
        }

        maxY = Math.max(maxY, node.height);
      } else if (node.isEdge()) {
        // The width is the number of additional parallel edges
        // time the parallel edge spacing
        var numEdges = 1;

        if (node.edges != null) {
          numEdges = node.edges.length;
        } else {
          mxLog.warn("edge.edges is null");
        }

        node.width = (numEdges - 1) * this.parallelEdgeSpacing;
      }

      // Set the initial x-value as being the best result so far
      localX += node.width / 2.0;
      node.setX(rankValue, localX);
      node.setGeneralPurposeVariable(rankValue, localX);
      localX += node.width / 2.0;
      localX += this.intraCellSpacing;
    }

    if (boundsWarning == true) {
      mxLog.warn("At least one cell has no bounds");
    }
  };

  /**
   * Function: calculateWidestRank
   *
   * Calculates the width rank in the hierarchy. Also set the y value of each
   * rank whilst performing the calculation
   *
   * Parameters:
   *
   * graph - the facade describing the input graph
   * model - an internal model of the hierarchical layout
   */
  mxCoordinateAssignment.prototype.calculateWidestRank = function (
    graph,
    model
  ) {
    // Starting y co-ordinate
    var y = -this.interRankCellSpacing;

    // Track the widest cell on the last rank since the y
    // difference depends on it
    var lastRankMaxCellHeight = 0.0;
    this.rankWidths = [];
    this.rankY = [];

    for (var rankValue = model.maxRank; rankValue >= 0; rankValue--) {
      // Keep track of the widest cell on this rank
      var maxCellHeight = 0.0;
      var rank = model.ranks[rankValue];
      var localX = this.initialX;

      // Store whether or not any of the cells' bounds were unavailable so
      // to only issue the warning once for all cells
      var boundsWarning = false;

      for (var i = 0; i < rank.length; i++) {
        var node = rank[i];

        if (node.isVertex()) {
          var bounds = this.layout.getVertexBounds(node.cell);

          if (bounds != null) {
            if (
              this.orientation == mxConstants.DIRECTION_NORTH ||
              this.orientation == mxConstants.DIRECTION_SOUTH
            ) {
              node.width = bounds.width;
              node.height = bounds.height;
            } else {
              node.width = bounds.height;
              node.height = bounds.width;
            }
          } else {
            boundsWarning = true;
          }

          maxCellHeight = Math.max(maxCellHeight, node.height);
        } else if (node.isEdge()) {
          // The width is the number of additional parallel edges
          // time the parallel edge spacing
          var numEdges = 1;

          if (node.edges != null) {
            numEdges = node.edges.length;
          } else {
            mxLog.warn("edge.edges is null");
          }

          node.width = (numEdges - 1) * this.parallelEdgeSpacing;
        }

        // Set the initial x-value as being the best result so far
        localX += node.width / 2.0;
        node.setX(rankValue, localX);
        node.setGeneralPurposeVariable(rankValue, localX);
        localX += node.width / 2.0;
        localX += this.intraCellSpacing;

        if (localX > this.widestRankValue) {
          this.widestRankValue = localX;
          this.widestRank = rankValue;
        }

        this.rankWidths[rankValue] = localX;
      }

      if (boundsWarning == true) {
        mxLog.warn("At least one cell has no bounds");
      }

      this.rankY[rankValue] = y;
      var distanceToNextRank =
        maxCellHeight / 2.0 +
        lastRankMaxCellHeight / 2.0 +
        this.interRankCellSpacing;
      lastRankMaxCellHeight = maxCellHeight;

      if (
        this.orientation == mxConstants.DIRECTION_NORTH ||
        this.orientation == mxConstants.DIRECTION_WEST
      ) {
        y += distanceToNextRank;
      } else {
        y -= distanceToNextRank;
      }

      for (var i = 0; i < rank.length; i++) {
        var cell = rank[i];
        cell.setY(rankValue, y);
      }
    }
  };

  /**
   * Function: minPath
   *
   * Straightens out chains of virtual nodes where possibleacade to those stored after this layout
   * processing step has completed.
   *
   * Parameters:
   *
   * graph - the facade describing the input graph
   * model - an internal model of the hierarchical layout
   */
  mxCoordinateAssignment.prototype.minPath = function (graph, model) {
    // Work down and up each edge with at least 2 control points
    // trying to straighten each one out. If the same number of
    // straight segments are formed in both directions, the
    // preferred direction used is the one where the final
    // control points have the least offset from the connectable
    // region of the terminating vertices
    var edges = model.edgeMapper.getValues();

    for (var j = 0; j < edges.length; j++) {
      var cell = edges[j];

      if (cell.maxRank - cell.minRank - 1 < 1) {
        continue;
      }

      // At least two virtual nodes in the edge
      // Check first whether the edge is already straight
      var referenceX = cell.getGeneralPurposeVariable(cell.minRank + 1);
      var edgeStraight = true;
      var refSegCount = 0;

      for (var i = cell.minRank + 2; i < cell.maxRank; i++) {
        var x = cell.getGeneralPurposeVariable(i);

        if (referenceX != x) {
          edgeStraight = false;
          referenceX = x;
        } else {
          refSegCount++;
        }
      }

      if (!edgeStraight) {
        var upSegCount = 0;
        var downSegCount = 0;
        var upXPositions = [];
        var downXPositions = [];

        var currentX = cell.getGeneralPurposeVariable(cell.minRank + 1);

        for (var i = cell.minRank + 1; i < cell.maxRank - 1; i++) {
          // Attempt to straight out the control point on the
          // next segment up with the current control point.
          var nextX = cell.getX(i + 1);

          if (currentX == nextX) {
            upXPositions[i - cell.minRank - 1] = currentX;
            upSegCount++;
          } else if (this.repositionValid(model, cell, i + 1, currentX)) {
            upXPositions[i - cell.minRank - 1] = currentX;
            upSegCount++;
            // Leave currentX at same value
          } else {
            upXPositions[i - cell.minRank - 1] = nextX;
            currentX = nextX;
          }
        }

        currentX = cell.getX(i);

        for (var i = cell.maxRank - 1; i > cell.minRank + 1; i--) {
          // Attempt to straight out the control point on the
          // next segment down with the current control point.
          var nextX = cell.getX(i - 1);

          if (currentX == nextX) {
            downXPositions[i - cell.minRank - 2] = currentX;
            downSegCount++;
          } else if (this.repositionValid(model, cell, i - 1, currentX)) {
            downXPositions[i - cell.minRank - 2] = currentX;
            downSegCount++;
            // Leave currentX at same value
          } else {
            downXPositions[i - cell.minRank - 2] = cell.getX(i - 1);
            currentX = nextX;
          }
        }

        if (downSegCount > refSegCount || upSegCount > refSegCount) {
          if (downSegCount >= upSegCount) {
            // Apply down calculation values
            for (var i = cell.maxRank - 2; i > cell.minRank; i--) {
              cell.setX(i, downXPositions[i - cell.minRank - 1]);
            }
          } else if (upSegCount > downSegCount) {
            // Apply up calculation values
            for (var i = cell.minRank + 2; i < cell.maxRank; i++) {
              cell.setX(i, upXPositions[i - cell.minRank - 2]);
            }
          } else {
            // Neither direction provided a favourable result
            // But both calculations are better than the
            // existing solution, so apply the one with minimal
            // offset to attached vertices at either end.
          }
        }
      }
    }
  };

  /**
   * Function: repositionValid
   *
   * Determines whether or not a node may be moved to the specified x
   * position on the specified rank
   *
   * Parameters:
   *
   * model - the layout model
   * cell - the cell being analysed
   * rank - the layer of the cell
   * position - the x position being sought
   */
  mxCoordinateAssignment.prototype.repositionValid = function (
    model,
    cell,
    rank,
    position
  ) {
    var rankArray = model.ranks[rank];
    var rankIndex = -1;

    for (var i = 0; i < rankArray.length; i++) {
      if (cell == rankArray[i]) {
        rankIndex = i;
        break;
      }
    }

    if (rankIndex < 0) {
      return false;
    }

    var currentX = cell.getGeneralPurposeVariable(rank);

    if (position < currentX) {
      // Trying to move node to the left.
      if (rankIndex == 0) {
        // Left-most node, can move anywhere
        return true;
      }

      var leftCell = rankArray[rankIndex - 1];
      var leftLimit = leftCell.getGeneralPurposeVariable(rank);
      leftLimit =
        leftLimit + leftCell.width / 2 + this.intraCellSpacing + cell.width / 2;

      if (leftLimit <= position) {
        return true;
      } else {
        return false;
      }
    } else if (position > currentX) {
      // Trying to move node to the right.
      if (rankIndex == rankArray.length - 1) {
        // Right-most node, can move anywhere
        return true;
      }

      var rightCell = rankArray[rankIndex + 1];
      var rightLimit = rightCell.getGeneralPurposeVariable(rank);
      rightLimit =
        rightLimit -
        rightCell.width / 2 -
        this.intraCellSpacing -
        cell.width / 2;

      if (rightLimit >= position) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  };

  /**
   * Function: setCellLocations
   *
   * Sets the cell locations in the facade to those stored after this layout
   * processing step has completed.
   *
   * Parameters:
   *
   * graph - the input graph
   * model - the layout model
   */
  mxCoordinateAssignment.prototype.setCellLocations = function (graph, model) {
    this.rankTopY = [];
    this.rankBottomY = [];

    for (var i = 0; i < model.ranks.length; i++) {
      this.rankTopY[i] = Number.MAX_VALUE;
      this.rankBottomY[i] = -Number.MAX_VALUE;
    }

    var vertices = model.vertexMapper.getValues();

    // Process vertices all first, since they define the lower and
    // limits of each rank. Between these limits lie the channels
    // where the edges can be routed across the graph

    for (var i = 0; i < vertices.length; i++) {
      this.setVertexLocation(vertices[i]);
    }

    // Post process edge styles. Needs the vertex locations set for initial
    // values of the top and bottoms of each rank
    if (
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.ORTHOGONAL ||
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.POLYLINE ||
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE
    ) {
      this.localEdgeProcessing(model);
    }

    var edges = model.edgeMapper.getValues();

    for (var i = 0; i < edges.length; i++) {
      this.setEdgePosition(edges[i]);
    }
  };

  /**
   * Function: localEdgeProcessing
   *
   * Separates the x position of edges as they connect to vertices
   *
   * Parameters:
   *
   * model - the layout model
   */
  mxCoordinateAssignment.prototype.localEdgeProcessing = function (model) {
    // Iterate through each vertex, look at the edges connected in
    // both directions.
    for (var rankIndex = 0; rankIndex < model.ranks.length; rankIndex++) {
      var rank = model.ranks[rankIndex];

      for (var cellIndex = 0; cellIndex < rank.length; cellIndex++) {
        var cell = rank[cellIndex];

        if (cell.isVertex()) {
          var currentCells = cell.getPreviousLayerConnectedCells(rankIndex);

          var currentRank = rankIndex - 1;

          // Two loops, last connected cells, and next
          for (var k = 0; k < 2; k++) {
            if (
              currentRank > -1 &&
              currentRank < model.ranks.length &&
              currentCells != null &&
              currentCells.length > 0
            ) {
              var sortedCells = [];

              for (var j = 0; j < currentCells.length; j++) {
                var sorter = new WeightedCellSorter(
                  currentCells[j],
                  currentCells[j].getX(currentRank)
                );
                sortedCells.push(sorter);
              }

              sortedCells.sort(WeightedCellSorter.prototype.compare);

              var leftLimit = cell.x[0] - cell.width / 2;
              var rightLimit = leftLimit + cell.width;

              // Connected edge count starts at 1 to allow for buffer
              // with edge of vertex
              var connectedEdgeCount = 0;
              var connectedEdgeGroupCount = 0;
              var connectedEdges = [];
              // Calculate width requirements for all connected edges
              for (var j = 0; j < sortedCells.length; j++) {
                var innerCell = sortedCells[j].cell;
                var connections;

                if (innerCell.isVertex()) {
                  // Get the connecting edge
                  if (k == 0) {
                    connections = cell.connectsAsSource;
                  } else {
                    connections = cell.connectsAsTarget;
                  }

                  for (
                    var connIndex = 0;
                    connIndex < connections.length;
                    connIndex++
                  ) {
                    if (
                      connections[connIndex].source == innerCell ||
                      connections[connIndex].target == innerCell
                    ) {
                      connectedEdgeCount += connections[connIndex].edges.length;
                      connectedEdgeGroupCount++;

                      connectedEdges.push(connections[connIndex]);
                    }
                  }
                } else {
                  connectedEdgeCount += innerCell.edges.length;
                  connectedEdgeGroupCount++;
                  connectedEdges.push(innerCell);
                }
              }

              var requiredWidth =
                (connectedEdgeCount + 1) * this.prefHozEdgeSep;

              // Add a buffer on the edges of the vertex if the edge count allows
              if (cell.width > requiredWidth + 2 * this.prefHozEdgeSep) {
                leftLimit += this.prefHozEdgeSep;
                rightLimit -= this.prefHozEdgeSep;
              }

              var availableWidth = rightLimit - leftLimit;
              var edgeSpacing = availableWidth / connectedEdgeCount;

              var currentX = leftLimit + edgeSpacing / 2.0;
              var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
              var maxYOffset = 0;

              for (var j = 0; j < connectedEdges.length; j++) {
                var numActualEdges = connectedEdges[j].edges.length;
                var pos = this.jettyPositions[connectedEdges[j].ids[0]];

                if (pos == null) {
                  pos = [];
                  this.jettyPositions[connectedEdges[j].ids[0]] = pos;
                }

                if (j < connectedEdgeCount / 2) {
                  currentYOffset += this.prefVertEdgeOff;
                } else if (j > connectedEdgeCount / 2) {
                  currentYOffset -= this.prefVertEdgeOff;
                }
                // Ignore the case if equals, this means the second of 2
                // jettys with the same y (even number of edges)

                for (var m = 0; m < numActualEdges; m++) {
                  pos[m * 4 + k * 2] = currentX;
                  currentX += edgeSpacing;
                  pos[m * 4 + k * 2 + 1] = currentYOffset;
                }

                maxYOffset = Math.max(maxYOffset, currentYOffset);
              }
            }

            currentCells = cell.getNextLayerConnectedCells(rankIndex);

            currentRank = rankIndex + 1;
          }
        }
      }
    }
  };

  /**
   * Function: setEdgePosition
   *
   * Fixes the control points
   */
  mxCoordinateAssignment.prototype.setEdgePosition = function (cell) {
    // For parallel edges we need to seperate out the points a
    // little
    var offsetX = 0;
    // Only set the edge control points once

    if (cell.temp[0] != 101207) {
      var maxRank = cell.maxRank;
      var minRank = cell.minRank;

      if (maxRank == minRank) {
        maxRank = cell.source.maxRank;
        minRank = cell.target.minRank;
      }

      var parallelEdgeCount = 0;
      var jettys = this.jettyPositions[cell.ids[0]];

      var source = cell.isReversed ? cell.target.cell : cell.source.cell;
      var graph = this.layout.graph;
      var layoutReversed =
        this.orientation == mxConstants.DIRECTION_EAST ||
        this.orientation == mxConstants.DIRECTION_SOUTH;

      for (var i = 0; i < cell.edges.length; i++) {
        var realEdge = cell.edges[i];
        var realSource = this.layout.getVisibleTerminal(realEdge, true);

        //List oldPoints = graph.getPoints(realEdge);
        var newPoints = [];

        // Single length reversed edges end up with the jettys in the wrong
        // places. Since single length edges only have jettys, not segment
        // control points, we just say the edge isn't reversed in this section
        var reversed = cell.isReversed;

        if (realSource != source) {
          // The real edges include all core model edges and these can go
          // in both directions. If the source of the hierarchical model edge
          // isn't the source of the specific real edge in this iteration
          // treat if as reversed
          reversed = !reversed;
        }

        // First jetty of edge
        if (jettys != null) {
          var arrayOffset = reversed ? 2 : 0;
          var y = reversed
            ? layoutReversed
              ? this.rankBottomY[minRank]
              : this.rankTopY[minRank]
            : layoutReversed
            ? this.rankTopY[maxRank]
            : this.rankBottomY[maxRank];
          var jetty = jettys[parallelEdgeCount * 4 + 1 + arrayOffset];

          if (reversed != layoutReversed) {
            jetty = -jetty;
          }

          y += jetty;
          var x = jettys[parallelEdgeCount * 4 + arrayOffset];

          var modelSource = graph.model.getTerminal(realEdge, true);

          if (
            this.layout.isPort(modelSource) &&
            graph.model.getParent(modelSource) == realSource
          ) {
            var state = graph.view.getState(modelSource);

            if (state != null) {
              x = state.x;
            } else {
              x =
                realSource.geometry.x +
                cell.source.width * modelSource.geometry.x;
            }
          }

          if (
            this.orientation == mxConstants.DIRECTION_NORTH ||
            this.orientation == mxConstants.DIRECTION_SOUTH
          ) {
            newPoints.push(new mxPoint(x, y));

            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(x, y + jetty));
            }
          } else {
            newPoints.push(new mxPoint(y, x));

            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(y + jetty, x));
            }
          }
        }

        // Declare variables to define loop through edge points and
        // change direction if edge is reversed

        var loopStart = cell.x.length - 1;
        var loopLimit = -1;
        var loopDelta = -1;
        var currentRank = cell.maxRank - 1;

        if (reversed) {
          loopStart = 0;
          loopLimit = cell.x.length;
          loopDelta = 1;
          currentRank = cell.minRank + 1;
        }
        // Reversed edges need the points inserted in
        // reverse order
        for (
          var j = loopStart;
          cell.maxRank != cell.minRank && j != loopLimit;
          j += loopDelta
        ) {
          // The horizontal position in a vertical layout
          var positionX = cell.x[j] + offsetX;

          // Work out the vertical positions in a vertical layout
          // in the edge buffer channels above and below this rank
          var topChannelY =
            (this.rankTopY[currentRank] + this.rankBottomY[currentRank + 1]) /
            2.0;
          var bottomChannelY =
            (this.rankTopY[currentRank - 1] + this.rankBottomY[currentRank]) /
            2.0;

          if (reversed) {
            var tmp = topChannelY;
            topChannelY = bottomChannelY;
            bottomChannelY = tmp;
          }

          if (
            this.orientation == mxConstants.DIRECTION_NORTH ||
            this.orientation == mxConstants.DIRECTION_SOUTH
          ) {
            newPoints.push(new mxPoint(positionX, topChannelY));
            newPoints.push(new mxPoint(positionX, bottomChannelY));
          } else {
            newPoints.push(new mxPoint(topChannelY, positionX));
            newPoints.push(new mxPoint(bottomChannelY, positionX));
          }

          this.limitX = Math.max(this.limitX, positionX);
          currentRank += loopDelta;
        }

        // Second jetty of edge
        if (jettys != null) {
          var arrayOffset = reversed ? 2 : 0;
          var rankY = reversed
            ? layoutReversed
              ? this.rankTopY[maxRank]
              : this.rankBottomY[maxRank]
            : layoutReversed
            ? this.rankBottomY[minRank]
            : this.rankTopY[minRank];
          var jetty = jettys[parallelEdgeCount * 4 + 3 - arrayOffset];

          if (reversed != layoutReversed) {
            jetty = -jetty;
          }
          var y = rankY - jetty;
          var x = jettys[parallelEdgeCount * 4 + 2 - arrayOffset];

          var modelTarget = graph.model.getTerminal(realEdge, false);
          var realTarget = this.layout.getVisibleTerminal(realEdge, false);

          if (
            this.layout.isPort(modelTarget) &&
            graph.model.getParent(modelTarget) == realTarget
          ) {
            var state = graph.view.getState(modelTarget);

            if (state != null) {
              x = state.x;
            } else {
              x =
                realTarget.geometry.x +
                cell.target.width * modelTarget.geometry.x;
            }
          }

          if (
            this.orientation == mxConstants.DIRECTION_NORTH ||
            this.orientation == mxConstants.DIRECTION_SOUTH
          ) {
            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(x, y - jetty));
            }

            newPoints.push(new mxPoint(x, y));
          } else {
            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(y - jetty, x));
            }

            newPoints.push(new mxPoint(y, x));
          }
        }

        if (cell.isReversed) {
          this.processReversedEdge(cell, realEdge);
        }

        this.layout.setEdgePoints(realEdge, newPoints);

        // Resets edge label position
        if (this.layout.resetEdgeLabels && realEdge.geometry != null) {
          let geometry = realEdge.geometry.clone();
          geometry.relative = true;
          geometry.x = 0;
          geometry.y = 0;

          graph.model.setGeometry(realEdge, geometry);
        }

        // Increase offset so next edge is drawn next to
        // this one
        if (offsetX == 0.0) {
          offsetX = this.parallelEdgeSpacing;
        } else if (offsetX > 0) {
          offsetX = -offsetX;
        } else {
          offsetX = -offsetX + this.parallelEdgeSpacing;
        }

        parallelEdgeCount++;
      }

      cell.temp[0] = 101207;
    }
  };

  /**
   * Function: setVertexLocation
   *
   * Fixes the position of the specified vertex.
   *
   * Parameters:
   *
   * cell - the vertex to position
   */
  mxCoordinateAssignment.prototype.setVertexLocation = function (cell) {
    var realCell = cell.cell;
    var positionX = cell.x[0] - cell.width / 2;
    var positionY = cell.y[0] - cell.height / 2;

    this.rankTopY[cell.minRank] = Math.min(
      this.rankTopY[cell.minRank],
      positionY
    );
    this.rankBottomY[cell.minRank] = Math.max(
      this.rankBottomY[cell.minRank],
      positionY + cell.height
    );

    if (
      this.orientation == mxConstants.DIRECTION_NORTH ||
      this.orientation == mxConstants.DIRECTION_SOUTH
    ) {
      this.layout.setVertexLocation(realCell, positionX, positionY);
    } else {
      this.layout.setVertexLocation(realCell, positionY, positionX);
    }

    this.limitX = Math.max(this.limitX, positionX + cell.width);
  };

  /**
   * Function: processReversedEdge
   *
   * Hook to add additional processing
   *
   * Parameters:
   *
   * edge - the hierarchical model edge
   * realEdge - the real edge in the graph
   */
  mxCoordinateAssignment.prototype.processReversedEdge = function (
    graph,
    model
  ) {
    // hook for subclassers
  };

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxHierarchicalLayoutStage
   *
   * The specific layout interface for hierarchical layouts. It adds a
   * <code>run</code> method with a parameter for the hierarchical layout model
   * that is shared between the layout stages.
   *
   * Constructor: mxHierarchicalLayoutStage
   *
   * Constructs a new hierarchical layout stage.
   */
  function mxHierarchicalLayoutStage() {}

  /**
   * Function: execute
   *
   * Takes the graph detail and configuration information within the facade
   * and creates the resulting laid out graph within that facade for further
   * use.
   */
  mxHierarchicalLayoutStage.prototype.execute = function (parent) {};

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxMedianHybridCrossingReduction
   *
   * Sets the horizontal locations of node and edge dummy nodes on each layer.
   * Uses median down and up weighings as well heuristic to straighten edges as
   * far as possible.
   *
   * Constructor: mxMedianHybridCrossingReduction
   *
   * Creates a coordinate assignment.
   *
   * Arguments:
   *
   * intraCellSpacing - the minimum buffer between cells on the same rank
   * interRankCellSpacing - the minimum distance between cells on adjacent ranks
   * orientation - the position of the root node(s) relative to the graph
   * initialX - the leftmost coordinate node placement starts at
   */
  function mxMedianHybridCrossingReduction(layout) {
    this.layout = layout;
  }

  /**
   * Extends mxMedianHybridCrossingReduction.
   */
  mxMedianHybridCrossingReduction.prototype = new mxHierarchicalLayoutStage();
  mxMedianHybridCrossingReduction.prototype.constructor =
    mxMedianHybridCrossingReduction;

  /**
   * Variable: layout
   *
   * Reference to the enclosing <mxHierarchicalLayout>.
   */
  mxMedianHybridCrossingReduction.prototype.layout = null;

  /**
   * Variable: maxIterations
   *
   * The maximum number of iterations to perform whilst reducing edge
   * crossings. Default is 24.
   */
  mxMedianHybridCrossingReduction.prototype.maxIterations = 24;

  /**
   * Variable: nestedBestRanks
   *
   * Stores each rank as a collection of cells in the best order found for
   * each layer so far
   */
  mxMedianHybridCrossingReduction.prototype.nestedBestRanks = null;

  /**
   * Variable: currentBestCrossings
   *
   * The total number of crossings found in the best configuration so far
   */
  mxMedianHybridCrossingReduction.prototype.currentBestCrossings = 0;

  /**
   * Variable: iterationsWithoutImprovement
   *
   * The total number of crossings found in the best configuration so far
   */
  mxMedianHybridCrossingReduction.prototype.iterationsWithoutImprovement = 0;

  /**
   * Variable: maxNoImprovementIterations
   *
   * The total number of crossings found in the best configuration so far
   */
  mxMedianHybridCrossingReduction.prototype.maxNoImprovementIterations = 2;

  /**
   * Function: execute
   *
   * Performs a vertex ordering within ranks as described by Gansner et al
   * 1993
   */
  mxMedianHybridCrossingReduction.prototype.execute = function (parent) {
    var model = this.layout.getModel();

    // Stores initial ordering as being the best one found so far
    this.nestedBestRanks = [];

    for (var i = 0; i < model.ranks.length; i++) {
      this.nestedBestRanks[i] = model.ranks[i].slice();
    }

    var iterationsWithoutImprovement = 0;
    var currentBestCrossings = this.calculateCrossings(model);

    for (
      var i = 0;
      i < this.maxIterations &&
      iterationsWithoutImprovement < this.maxNoImprovementIterations;
      i++
    ) {
      this.weightedMedian(i, model);
      this.transpose(i, model);
      var candidateCrossings = this.calculateCrossings(model);

      if (candidateCrossings < currentBestCrossings) {
        currentBestCrossings = candidateCrossings;
        iterationsWithoutImprovement = 0;

        // Store the current rankings as the best ones
        for (var j = 0; j < this.nestedBestRanks.length; j++) {
          var rank = model.ranks[j];

          for (var k = 0; k < rank.length; k++) {
            var cell = rank[k];
            this.nestedBestRanks[j][cell.getGeneralPurposeVariable(j)] = cell;
          }
        }
      } else {
        // Increase count of iterations where we haven't improved the
        // layout
        iterationsWithoutImprovement++;

        // Restore the best values to the cells
        for (var j = 0; j < this.nestedBestRanks.length; j++) {
          var rank = model.ranks[j];

          for (var k = 0; k < rank.length; k++) {
            var cell = rank[k];
            cell.setGeneralPurposeVariable(j, k);
          }
        }
      }

      if (currentBestCrossings == 0) {
        // Do nothing further
        break;
      }
    }

    // Store the best rankings but in the model
    var ranks = [];
    var rankList = [];

    for (var i = 0; i < model.maxRank + 1; i++) {
      rankList[i] = [];
      ranks[i] = rankList[i];
    }

    for (var i = 0; i < this.nestedBestRanks.length; i++) {
      for (var j = 0; j < this.nestedBestRanks[i].length; j++) {
        rankList[i].push(this.nestedBestRanks[i][j]);
      }
    }

    model.ranks = ranks;
  };

  /**
   * Function: calculateCrossings
   *
   * Calculates the total number of edge crossing in the current graph.
   * Returns the current number of edge crossings in the hierarchy graph
   * model in the current candidate layout
   *
   * Parameters:
   *
   * model - the internal model describing the hierarchy
   */
  mxMedianHybridCrossingReduction.prototype.calculateCrossings = function (
    model
  ) {
    var numRanks = model.ranks.length;
    var totalCrossings = 0;

    for (var i = 1; i < numRanks; i++) {
      totalCrossings += this.calculateRankCrossing(i, model);
    }

    return totalCrossings;
  };

  /**
   * Function: calculateRankCrossing
   *
   * Calculates the number of edges crossings between the specified rank and
   * the rank below it. Returns the number of edges crossings with the rank
   * beneath
   *
   * Parameters:
   *
   * i -  the topmost rank of the pair ( higher rank value )
   * model - the internal model describing the hierarchy
   */
  mxMedianHybridCrossingReduction.prototype.calculateRankCrossing = function (
    i,
    model
  ) {
    var totalCrossings = 0;
    var rank = model.ranks[i];
    var previousRank = model.ranks[i - 1];

    var tmpIndices = [];

    // Iterate over the top rank and fill in the connection information
    for (var j = 0; j < rank.length; j++) {
      var node = rank[j];
      var rankPosition = node.getGeneralPurposeVariable(i);
      var connectedCells = node.getPreviousLayerConnectedCells(i);
      var nodeIndices = [];

      for (var k = 0; k < connectedCells.length; k++) {
        var connectedNode = connectedCells[k];
        var otherCellRankPosition = connectedNode.getGeneralPurposeVariable(
          i - 1
        );
        nodeIndices.push(otherCellRankPosition);
      }

      nodeIndices.sort(function (x, y) {
        return x - y;
      });
      tmpIndices[rankPosition] = nodeIndices;
    }

    var indices = [];

    for (var j = 0; j < tmpIndices.length; j++) {
      indices = indices.concat(tmpIndices[j]);
    }

    var firstIndex = 1;

    while (firstIndex < previousRank.length) {
      firstIndex <<= 1;
    }

    var treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;

    var tree = [];

    for (var j = 0; j < treeSize; ++j) {
      tree[j] = 0;
    }

    for (var j = 0; j < indices.length; j++) {
      var index = indices[j];
      var treeIndex = index + firstIndex;
      ++tree[treeIndex];

      while (treeIndex > 0) {
        if (treeIndex % 2) {
          totalCrossings += tree[treeIndex + 1];
        }

        treeIndex = (treeIndex - 1) >> 1;
        ++tree[treeIndex];
      }
    }

    return totalCrossings;
  };

  /**
   * Function: transpose
   *
   * Takes each possible adjacent cell pair on each rank and checks if
   * swapping them around reduces the number of crossing
   *
   * Parameters:
   *
   * mainLoopIteration - the iteration number of the main loop
   * model - the internal model describing the hierarchy
   */
  mxMedianHybridCrossingReduction.prototype.transpose = function (
    mainLoopIteration,
    model
  ) {
    var improved = true;

    // Track the number of iterations in case of looping
    var count = 0;
    var maxCount = 10;
    while (improved && count++ < maxCount) {
      // On certain iterations allow allow swapping of cell pairs with
      // equal edge crossings switched or not switched. This help to
      // nudge a stuck layout into a lower crossing total.
      var nudge = mainLoopIteration % 2 == 1 && count % 2 == 1;
      improved = false;

      for (var i = 0; i < model.ranks.length; i++) {
        var rank = model.ranks[i];
        var orderedCells = [];

        for (var j = 0; j < rank.length; j++) {
          var cell = rank[j];
          var tempRank = cell.getGeneralPurposeVariable(i);

          // FIXME: Workaround to avoid negative tempRanks
          if (tempRank < 0) {
            tempRank = j;
          }
          orderedCells[tempRank] = cell;
        }

        var leftCellAboveConnections = null;
        var leftCellBelowConnections = null;
        var rightCellAboveConnections = null;
        var rightCellBelowConnections = null;

        var leftAbovePositions = null;
        var leftBelowPositions = null;
        var rightAbovePositions = null;
        var rightBelowPositions = null;

        var leftCell = null;
        var rightCell = null;

        for (var j = 0; j < rank.length - 1; j++) {
          // For each intra-rank adjacent pair of cells
          // see if swapping them around would reduce the
          // number of edges crossing they cause in total
          // On every cell pair except the first on each rank, we
          // can save processing using the previous values for the
          // right cell on the new left cell
          if (j == 0) {
            leftCell = orderedCells[j];
            leftCellAboveConnections = leftCell.getNextLayerConnectedCells(i);
            leftCellBelowConnections =
              leftCell.getPreviousLayerConnectedCells(i);
            leftAbovePositions = [];
            leftBelowPositions = [];

            for (var k = 0; k < leftCellAboveConnections.length; k++) {
              leftAbovePositions[k] = leftCellAboveConnections[
                k
              ].getGeneralPurposeVariable(i + 1);
            }

            for (var k = 0; k < leftCellBelowConnections.length; k++) {
              leftBelowPositions[k] = leftCellBelowConnections[
                k
              ].getGeneralPurposeVariable(i - 1);
            }
          } else {
            leftCellAboveConnections = rightCellAboveConnections;
            leftCellBelowConnections = rightCellBelowConnections;
            leftAbovePositions = rightAbovePositions;
            leftBelowPositions = rightBelowPositions;
            leftCell = rightCell;
          }

          rightCell = orderedCells[j + 1];
          rightCellAboveConnections = rightCell.getNextLayerConnectedCells(i);
          rightCellBelowConnections =
            rightCell.getPreviousLayerConnectedCells(i);

          rightAbovePositions = [];
          rightBelowPositions = [];

          for (var k = 0; k < rightCellAboveConnections.length; k++) {
            rightAbovePositions[k] = rightCellAboveConnections[
              k
            ].getGeneralPurposeVariable(i + 1);
          }

          for (var k = 0; k < rightCellBelowConnections.length; k++) {
            rightBelowPositions[k] = rightCellBelowConnections[
              k
            ].getGeneralPurposeVariable(i - 1);
          }

          var totalCurrentCrossings = 0;
          var totalSwitchedCrossings = 0;

          for (var k = 0; k < leftAbovePositions.length; k++) {
            for (var ik = 0; ik < rightAbovePositions.length; ik++) {
              if (leftAbovePositions[k] > rightAbovePositions[ik]) {
                totalCurrentCrossings++;
              }

              if (leftAbovePositions[k] < rightAbovePositions[ik]) {
                totalSwitchedCrossings++;
              }
            }
          }

          for (var k = 0; k < leftBelowPositions.length; k++) {
            for (var ik = 0; ik < rightBelowPositions.length; ik++) {
              if (leftBelowPositions[k] > rightBelowPositions[ik]) {
                totalCurrentCrossings++;
              }

              if (leftBelowPositions[k] < rightBelowPositions[ik]) {
                totalSwitchedCrossings++;
              }
            }
          }

          if (
            totalSwitchedCrossings < totalCurrentCrossings ||
            (totalSwitchedCrossings == totalCurrentCrossings && nudge)
          ) {
            var temp = leftCell.getGeneralPurposeVariable(i);
            leftCell.setGeneralPurposeVariable(
              i,
              rightCell.getGeneralPurposeVariable(i)
            );
            rightCell.setGeneralPurposeVariable(i, temp);

            // With this pair exchanged we have to switch all of
            // values for the left cell to the right cell so the
            // next iteration for this rank uses it as the left
            // cell again
            rightCellAboveConnections = leftCellAboveConnections;
            rightCellBelowConnections = leftCellBelowConnections;
            rightAbovePositions = leftAbovePositions;
            rightBelowPositions = leftBelowPositions;
            rightCell = leftCell;

            if (!nudge) {
              // Don't count nudges as improvement or we'll end
              // up stuck in two combinations and not finishing
              // as early as we should
              improved = true;
            }
          }
        }
      }
    }
  };

  /**
   * Function: weightedMedian
   *
   * Sweeps up or down the layout attempting to minimise the median placement
   * of connected cells on adjacent ranks
   *
   * Parameters:
   *
   * iteration - the iteration number of the main loop
   * model - the internal model describing the hierarchy
   */
  mxMedianHybridCrossingReduction.prototype.weightedMedian = function (
    iteration,
    model
  ) {
    // Reverse sweep direction each time through this method
    var downwardSweep = iteration % 2 == 0;
    if (downwardSweep) {
      for (var j = model.maxRank - 1; j >= 0; j--) {
        this.medianRank(j, downwardSweep);
      }
    } else {
      for (var j = 1; j < model.maxRank; j++) {
        this.medianRank(j, downwardSweep);
      }
    }
  };

  /**
   * Function: medianRank
   *
   * Attempts to minimise the median placement of connected cells on this rank
   * and one of the adjacent ranks
   *
   * Parameters:
   *
   * rankValue - the layer number of this rank
   * downwardSweep - whether or not this is a downward sweep through the graph
   */
  mxMedianHybridCrossingReduction.prototype.medianRank = function (
    rankValue,
    downwardSweep
  ) {
    var numCellsForRank = this.nestedBestRanks[rankValue].length;
    var medianValues = [];
    var reservedPositions = [];

    for (var i = 0; i < numCellsForRank; i++) {
      var cell = this.nestedBestRanks[rankValue][i];
      var sorterEntry = new MedianCellSorter();
      sorterEntry.cell = cell;

      // Flip whether or not equal medians are flipped on up and down
      // sweeps
      // TODO re-implement some kind of nudge
      // medianValues[i].nudge = !downwardSweep;
      var nextLevelConnectedCells;

      if (downwardSweep) {
        nextLevelConnectedCells = cell.getNextLayerConnectedCells(rankValue);
      } else {
        nextLevelConnectedCells =
          cell.getPreviousLayerConnectedCells(rankValue);
      }

      var nextRankValue;

      if (downwardSweep) {
        nextRankValue = rankValue + 1;
      } else {
        nextRankValue = rankValue - 1;
      }

      if (
        nextLevelConnectedCells != null &&
        nextLevelConnectedCells.length != 0
      ) {
        sorterEntry.medianValue = this.medianValue(
          nextLevelConnectedCells,
          nextRankValue
        );
        medianValues.push(sorterEntry);
      } else {
        // Nodes with no adjacent vertices are flagged in the reserved array
        // to indicate they should be left in their current position.
        reservedPositions[cell.getGeneralPurposeVariable(rankValue)] = true;
      }
    }

    medianValues.sort(MedianCellSorter.prototype.compare);

    // Set the new position of each node within the rank using
    // its temp variable
    for (var i = 0; i < numCellsForRank; i++) {
      if (reservedPositions[i] == null) {
        var cell = medianValues.shift().cell;
        cell.setGeneralPurposeVariable(rankValue, i);
      }
    }
  };

  /**
   * Function: medianValue
   *
   * Calculates the median rank order positioning for the specified cell using
   * the connected cells on the specified rank. Returns the median rank
   * ordering value of the connected cells
   *
   * Parameters:
   *
   * connectedCells - the cells on the specified rank connected to the
   * specified cell
   * rankValue - the rank that the connected cell lie upon
   */
  mxMedianHybridCrossingReduction.prototype.medianValue = function (
    connectedCells,
    rankValue
  ) {
    var medianValues = [];
    var arrayCount = 0;

    for (var i = 0; i < connectedCells.length; i++) {
      var cell = connectedCells[i];
      medianValues[arrayCount++] = cell.getGeneralPurposeVariable(rankValue);
    }

    // Sort() sorts lexicographically by default (i.e. 11 before 9) so force
    // numerical order sort
    medianValues.sort(function (a, b) {
      return a - b;
    });

    if (arrayCount % 2 == 1) {
      // For odd numbers of adjacent vertices return the median
      return medianValues[Math.floor(arrayCount / 2)];
    } else if (arrayCount == 2) {
      return (medianValues[0] + medianValues[1]) / 2.0;
    } else {
      var medianPoint = arrayCount / 2;
      var leftMedian = medianValues[medianPoint - 1] - medianValues[0];
      var rightMedian =
        medianValues[arrayCount - 1] - medianValues[medianPoint];

      return (
        (medianValues[medianPoint - 1] * rightMedian +
          medianValues[medianPoint] * leftMedian) /
        (leftMedian + rightMedian)
      );
    }
  };

  /**
   * Class: MedianCellSorter
   *
   * A utility class used to track cells whilst sorting occurs on the median
   * values. Does not violate (x.compareTo(y)==0) == (x.equals(y))
   *
   * Constructor: MedianCellSorter
   *
   * Constructs a new median cell sorter.
   */
  function MedianCellSorter() {
    // empty
  }

  /**
   * Variable: medianValue
   *
   * The weighted value of the cell stored.
   */
  MedianCellSorter.prototype.medianValue = 0;

  /**
   * Variable: cell
   *
   * The cell whose median value is being calculated
   */
  MedianCellSorter.prototype.cell = false;

  /**
   * Function: compare
   *
   * Compares two MedianCellSorters.
   */
  MedianCellSorter.prototype.compare = function (a, b) {
    if (a != null && b != null) {
      if (b.medianValue > a.medianValue) {
        return -1;
      } else if (b.medianValue < a.medianValue) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };

  /**
   * Copyright (c) 2006-2015, JGraph Ltd
   * Copyright (c) 2006-2015, Gaudenz Alder
   */
  /**
   * Class: mxMinimumCycleRemover
   *
   * An implementation of the first stage of the Sugiyama layout. Straightforward
   * longest path calculation of layer assignment
   *
   * Constructor: mxMinimumCycleRemover
   *
   * Creates a cycle remover for the given internal model.
   */
  function mxMinimumCycleRemover(layout) {
    this.layout = layout;
  }

  /**
   * Extends mxHierarchicalLayoutStage.
   */
  mxMinimumCycleRemover.prototype = new mxHierarchicalLayoutStage();
  mxMinimumCycleRemover.prototype.constructor = mxMinimumCycleRemover;

  /**
   * Variable: layout
   *
   * Reference to the enclosing <mxHierarchicalLayout>.
   */
  mxMinimumCycleRemover.prototype.layout = null;

  /**
   * Function: execute
   *
   * Takes the graph detail and configuration information within the facade
   * and creates the resulting laid out graph within that facade for further
   * use.
   */
  mxMinimumCycleRemover.prototype.execute = function (parent) {
    var model = this.layout.getModel();
    var seenNodes = new Object();
    var unseenNodesArray = model.vertexMapper.getValues();
    var unseenNodes = new Object();

    for (var i = 0; i < unseenNodesArray.length; i++) {
      unseenNodes[unseenNodesArray[i].id] = unseenNodesArray[i];
    }

    // Perform a dfs through the internal model. If a cycle is found,
    // reverse it.
    var rootsArray = null;

    if (model.roots != null) {
      var modelRoots = model.roots;
      rootsArray = [];

      for (var i = 0; i < modelRoots.length; i++) {
        rootsArray[i] = model.vertexMapper.get(modelRoots[i]);
      }
    }

    model.visit(
      function (parent, node, connectingEdge, layer, seen) {
        // Check if the cell is in it's own ancestor list, if so
        // invert the connecting edge and reverse the target/source
        // relationship to that edge in the parent and the cell
        if (node.isAncestor(parent)) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsSource);
          parent.connectsAsTarget.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsTarget);
          node.connectsAsSource.push(connectingEdge);
        }

        seenNodes[node.id] = node;
        delete unseenNodes[node.id];
      },
      rootsArray,
      true,
      null
    );

    // If there are any nodes that should be nodes that the dfs can miss
    // these need to be processed with the dfs and the roots assigned
    // correctly to form a correct internal model
    var seenNodesCopy = mxUtils.clone(seenNodes, null, true);

    // Pick a random cell and dfs from it
    model.visit(
      function (parent, node, connectingEdge, layer, seen) {
        // Check if the cell is in it's own ancestor list, if so
        // invert the connecting edge and reverse the target/source
        // relationship to that edge in the parent and the cell
        if (node.isAncestor(parent)) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsSource);
          node.connectsAsSource.push(connectingEdge);
          parent.connectsAsTarget.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsTarget);
        }

        seenNodes[node.id] = node;
        delete unseenNodes[node.id];
      },
      unseenNodes,
      true,
      seenNodesCopy
    );
  };

  function mxHierarchicalLayout(graph, orientation, deterministic) {
    mxGraphLayout.call(this, graph);
    this.orientation =
      orientation != null ? orientation : mxConstants.DIRECTION_NORTH;
    this.deterministic = deterministic != null ? deterministic : true;
  }

  var mxHierarchicalEdgeStyle = {
    ORTHOGONAL: 1,
    POLYLINE: 2,
    STRAIGHT: 3,
    CURVE: 4,
  };

  /**
   * Extends mxGraphLayout.
   */
  mxHierarchicalLayout.prototype = new mxGraphLayout();
  mxHierarchicalLayout.prototype.constructor = mxHierarchicalLayout;

  /**
   * Variable: roots
   *
   * Holds the array of <mxCell> that this layout contains.
   */
  mxHierarchicalLayout.prototype.roots = null;

  /**
   * Variable: resizeParent
   *
   * Specifies if the parent should be resized after the layout so that it
   * contains all the child cells. Default is false. See also <parentBorder>.
   */
  mxHierarchicalLayout.prototype.resizeParent = false;

  /**
   * Variable: maintainParentLocation
   *
   * Specifies if the parent location should be maintained, so that the
   * top, left corner stays the same before and after execution of
   * the layout. Default is false for backwards compatibility.
   */
  mxHierarchicalLayout.prototype.maintainParentLocation = false;

  /**
   * Variable: moveParent
   *
   * Specifies if the parent should be moved if <resizeParent> is enabled.
   * Default is false.
   */
  mxHierarchicalLayout.prototype.moveParent = false;

  /**
   * Variable: parentBorder
   *
   * The border to be added around the children if the parent is to be
   * resized using <resizeParent>. Default is 0.
   */
  mxHierarchicalLayout.prototype.parentBorder = 0;

  /**
   * Variable: intraCellSpacing
   *
   * The spacing buffer added between cells on the same layer. Default is 30.
   */
  mxHierarchicalLayout.prototype.intraCellSpacing = 30;

  /**
   * Variable: interRankCellSpacing
   *
   * The spacing buffer added between cell on adjacent layers. Default is 100.
   */
  mxHierarchicalLayout.prototype.interRankCellSpacing = 100;

  /**
   * Variable: interHierarchySpacing
   *
   * The spacing buffer between unconnected hierarchies. Default is 60.
   */
  mxHierarchicalLayout.prototype.interHierarchySpacing = 60;

  /**
   * Variable: parallelEdgeSpacing
   *
   * The distance between each parallel edge on each ranks for long edges.
   * Default is 10.
   */
  mxHierarchicalLayout.prototype.parallelEdgeSpacing = 10;

  /**
   * Variable: orientation
   *
   * The position of the root node(s) relative to the laid out graph in.
   * Default is <mxConstants.DIRECTION_NORTH>.
   */
  mxHierarchicalLayout.prototype.orientation = mxConstants.DIRECTION_NORTH;

  /**
   * Variable: fineTuning
   *
   * Whether or not to perform local optimisations and iterate multiple times
   * through the algorithm. Default is true.
   */
  mxHierarchicalLayout.prototype.fineTuning = true;

  /**
   *
   * Variable: tightenToSource
   *
   * Whether or not to tighten the assigned ranks of vertices up towards
   * the source cells. Default is true.
   */
  mxHierarchicalLayout.prototype.tightenToSource = true;

  /**
   * Variable: disableEdgeStyle
   *
   * Specifies if the STYLE_NOEDGESTYLE flag should be set on edges that are
   * modified by the result. Default is true.
   */
  mxHierarchicalLayout.prototype.disableEdgeStyle = true;

  /**
   * Variable: resetEdgeLabels
   *
   * Specifies if edge label positions should be reset to the center of the
   * edge. Default is true.
   */
  mxHierarchicalLayout.prototype.resetEdgeLabels = true;

  /**
   * Variable: traverseAncestors
   *
   * Whether or not to drill into child cells and layout in reverse
   * group order. This also cause the layout to navigate edges whose
   * terminal vertices have different parents but are in the same
   * ancestry chain. Default is true.
   */
  mxHierarchicalLayout.prototype.traverseAncestors = true;

  /**
   * Variable: model
   *
   * The internal <mxGraphHierarchyModel> formed of the layout.
   */
  mxHierarchicalLayout.prototype.model = null;

  /**
   * Variable: edgesSet
   *
   * A cache of edges whose source terminal is the key
   */
  mxHierarchicalLayout.prototype.edgesCache = null;

  /**
   * Variable: edgesSet
   *
   * A cache of edges whose source terminal is the key
   */
  mxHierarchicalLayout.prototype.edgeSourceTermCache = null;

  /**
   * Variable: edgesSet
   *
   * A cache of edges whose source terminal is the key
   */
  mxHierarchicalLayout.prototype.edgesTargetTermCache = null;

  /**
   * Variable: edgeStyle
   *
   * The style to apply between cell layers to edge segments.
   * Default is <mxHierarchicalEdgeStyle.POLYLINE>.
   */
  mxHierarchicalLayout.prototype.edgeStyle = mxHierarchicalEdgeStyle.POLYLINE;

  /**
   * Function: getModel
   *
   * Returns the internal <mxGraphHierarchyModel> for this layout algorithm.
   */
  mxHierarchicalLayout.prototype.getModel = function () {
    return this.model;
  };

  /**
   * Function: execute
   *
   * Executes the layout for the children of the specified parent.
   *
   * Parameters:
   *
   * parent - Parent <mxCell> that contains the children to be laid out.
   * roots - Optional starting roots of the layout.
   */
  mxHierarchicalLayout.prototype.execute = function (parent, roots) {
    this.parent = parent;
    var model = this.graph.model;
    this.edgesCache = new mxDictionary();
    this.edgeSourceTermCache = new mxDictionary();
    this.edgesTargetTermCache = new mxDictionary();

    if (roots != null && !(roots instanceof Array)) {
      roots = [roots];
    }

    // If the roots are set and the parent is set, only
    // use the roots that are some dependent of the that
    // parent.
    // If just the root are set, use them as-is
    // If just the parent is set use it's immediate
    // children as the initial set

    if (roots == null && parent == null) {
      // TODO indicate the problem
      return;
    }

    //  Maintaining parent location
    this.parentX = null;
    this.parentY = null;

    if (
      parent != this.root &&
      model.isVertex(parent) != null &&
      this.maintainParentLocation
    ) {
      var geo = this.graph.getCellGeometry(parent);

      if (geo != null) {
        this.parentX = geo.x;
        this.parentY = geo.y;
      }
    }

    if (roots != null) {
      var rootsCopy = [];

      for (var i = 0; i < roots.length; i++) {
        var ancestor =
          parent != null ? model.isAncestor(parent, roots[i]) : true;

        if (ancestor && model.isVertex(roots[i])) {
          rootsCopy.push(roots[i]);
        }
      }

      this.roots = rootsCopy;
    }

    model.beginUpdate();
    try {
      this.run(parent);

      if (this.resizeParent && !this.graph.isCellCollapsed(parent)) {
        this.graph.updateGroupBounds(
          [parent],
          this.parentBorder,
          this.moveParent
        );
      }

      // Maintaining parent location
      if (this.parentX != null && this.parentY != null) {
        var geo = this.graph.getCellGeometry(parent);

        if (geo != null) {
          geo = geo.clone();
          geo.x = this.parentX;
          geo.y = this.parentY;
          model.setGeometry(parent, geo);
        }
      }
    } finally {
      model.endUpdate();
    }
  };

  /**
   * Function: findRoots
   *
   * Returns all visible children in the given parent which do not have
   * incoming edges. If the result is empty then the children with the
   * maximum difference between incoming and outgoing edges are returned.
   * This takes into account edges that are being promoted to the given
   * root due to invisible children or collapsed cells.
   *
   * Parameters:
   *
   * parent - <mxCell> whose children should be checked.
   * vertices - array of vertices to limit search to
   */
  mxHierarchicalLayout.prototype.findRoots = function (parent, vertices) {
    var roots = [];

    if (parent != null && vertices != null) {
      var model = this.graph.model;
      var best = null;
      var maxDiff = -100000;

      for (var i in vertices) {
        var cell = vertices[i];

        if (model.isVertex(cell) && this.graph.isCellVisible(cell)) {
          var conns = this.getEdges(cell);
          var fanOut = 0;
          var fanIn = 0;

          for (var k = 0; k < conns.length; k++) {
            var src = this.getVisibleTerminal(conns[k], true);

            if (src == cell) {
              fanOut++;
            } else {
              fanIn++;
            }
          }

          if (fanIn == 0 && fanOut > 0) {
            roots.push(cell);
          }

          var diff = fanOut - fanIn;

          if (diff > maxDiff) {
            maxDiff = diff;
            best = cell;
          }
        }
      }

      if (roots.length == 0 && best != null) {
        roots.push(best);
      }
    }

    return roots;
  };

  /**
   * Function: getEdges
   *
   * Returns the connected edges for the given cell.
   *
   * Parameters:
   *
   * cell - <mxCell> whose edges should be returned.
   */
  mxHierarchicalLayout.prototype.getEdges = function (cell) {
    var cachedEdges = this.edgesCache.get(cell);

    if (cachedEdges != null) {
      return cachedEdges;
    }

    var model = this.graph.model;
    var edges = [];
    var isCollapsed = this.graph.isCellCollapsed(cell);
    var childCount = model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(cell, i);

      if (this.isPort(child)) {
        edges = edges.concat(model.getEdges(child, true, true));
      } else if (isCollapsed || !this.graph.isCellVisible(child)) {
        edges = edges.concat(model.getEdges(child, true, true));
      }
    }

    edges = edges.concat(model.getEdges(cell, true, true));
    var result = [];

    for (var i = 0; i < edges.length; i++) {
      var source = this.getVisibleTerminal(edges[i], true);
      var target = this.getVisibleTerminal(edges[i], false);

      if (
        source == target ||
        (source != target &&
          ((target == cell &&
            (this.parent == null ||
              this.isAncestor(this.parent, source, this.traverseAncestors))) ||
            (source == cell &&
              (this.parent == null ||
                this.isAncestor(this.parent, target, this.traverseAncestors)))))
      ) {
        result.push(edges[i]);
      }
    }

    this.edgesCache.put(cell, result);

    return result;
  };

  /**
   * Function: getVisibleTerminal
   *
   * Helper function to return visible terminal for edge allowing for ports
   *
   * Parameters:
   *
   * edge - <mxCell> whose edges should be returned.
   * source - Boolean that specifies whether the source or target terminal is to be returned
   */
  mxHierarchicalLayout.prototype.getVisibleTerminal = function (edge, source) {
    var terminalCache = this.edgesTargetTermCache;

    if (source) {
      terminalCache = this.edgeSourceTermCache;
    }

    var term = terminalCache.get(edge);

    if (term != null) {
      return term;
    }

    var state = this.graph.view.getState(edge);

    var terminal =
      state != null
        ? state.getVisibleTerminal(source)
        : this.graph.view.getVisibleTerminal(edge, source);

    if (terminal == null) {
      terminal =
        state != null
          ? state.getVisibleTerminal(source)
          : this.graph.view.getVisibleTerminal(edge, source);
    }

    if (terminal != null) {
      if (this.isPort(terminal)) {
        terminal = this.graph.model.getParent(terminal);
      }

      terminalCache.put(edge, terminal);
    }

    return terminal;
  };

  /**
   * Function: run
   *
   * The API method used to exercise the layout upon the graph description
   * and produce a separate description of the vertex position and edge
   * routing changes made. It runs each stage of the layout that has been
   * created.
   */
  mxHierarchicalLayout.prototype.run = function (parent) {
    // Separate out unconnected hierarchies
    var hierarchyVertices = [];
    var allVertexSet = [];

    if (this.roots == null && parent != null) {
      var filledVertexSet = Object();
      this.filterDescendants(parent, filledVertexSet);

      this.roots = [];
      var filledVertexSetEmpty = true;

      // Poor man's isSetEmpty
      for (var key in filledVertexSet) {
        if (filledVertexSet[key] != null) {
          filledVertexSetEmpty = false;
          break;
        }
      }

      while (!filledVertexSetEmpty) {
        var candidateRoots = this.findRoots(parent, filledVertexSet);

        // If the candidate root is an unconnected group cell, remove it from
        // the layout. We may need a custom set that holds such groups and forces
        // them to be processed for resizing and/or moving.

        for (var i = 0; i < candidateRoots.length; i++) {
          var vertexSet = Object();
          hierarchyVertices.push(vertexSet);

          this.traverse(
            candidateRoots[i],
            true,
            null,
            allVertexSet,
            vertexSet,
            hierarchyVertices,
            filledVertexSet
          );
        }

        for (var i = 0; i < candidateRoots.length; i++) {
          this.roots.push(candidateRoots[i]);
        }

        filledVertexSetEmpty = true;

        // Poor man's isSetEmpty
        for (var key in filledVertexSet) {
          if (filledVertexSet[key] != null) {
            filledVertexSetEmpty = false;
            break;
          }
        }
      }
    } else {
      // Find vertex set as directed traversal from roots

      for (var i = 0; i < this.roots.length; i++) {
        var vertexSet = Object();
        hierarchyVertices.push(vertexSet);

        this.traverse(
          this.roots[i],
          true,
          null,
          allVertexSet,
          vertexSet,
          hierarchyVertices,
          null
        );
      }
    }

    // Iterate through the result removing parents who have children in this layout

    // Perform a layout for each seperate hierarchy
    // Track initial coordinate x-positioning
    var initialX = 0;

    for (var i = 0; i < hierarchyVertices.length; i++) {
      var vertexSet = hierarchyVertices[i];
      var tmp = [];

      for (var key in vertexSet) {
        tmp.push(vertexSet[key]);
      }

      this.model = new mxGraphHierarchyModel(
        this,
        tmp,
        this.roots,
        parent,
        this.tightenToSource
      );

      this.cycleStage(parent);
      this.layeringStage();

      this.crossingStage(parent);
      initialX = this.placementStage(initialX, parent);
    }
  };

  /**
   * Function: filterDescendants
   *
   * Creates an array of descendant cells
   */
  mxHierarchicalLayout.prototype.filterDescendants = function (cell, result) {
    var model = this.graph.model;

    if (
      model.isVertex(cell) &&
      cell != this.parent &&
      this.graph.isCellVisible(cell)
    ) {
      result[mxObjectIdentity.get(cell)] = cell;
    }

    if (
      this.traverseAncestors ||
      (cell == this.parent && this.graph.isCellVisible(cell))
    ) {
      var childCount = model.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        var child = model.getChildAt(cell, i);

        // Ignore ports in the layout vertex list, they are dealt with
        // in the traversal mechanisms
        if (!this.isPort(child)) {
          this.filterDescendants(child, result);
        }
      }
    }
  };

  /**
   * Function: isPort
   *
   * Returns true if the given cell is a "port", that is, when connecting to
   * it, its parent is the connecting vertex in terms of graph traversal
   *
   * Parameters:
   *
   * cell - <mxCell> that represents the port.
   */
  mxHierarchicalLayout.prototype.isPort = function (cell) {
    if (cell != null && cell.geometry != null) {
      return cell.geometry.relative;
    } else {
      return false;
    }
  };

  /**
   * Function: getEdgesBetween
   *
   * Returns the edges between the given source and target. This takes into
   * account collapsed and invisible cells and ports.
   *
   * Parameters:
   *
   * source -
   * target -
   * directed -
   */
  mxHierarchicalLayout.prototype.getEdgesBetween = function (
    source,
    target,
    directed
  ) {
    directed = directed != null ? directed : false;
    var edges = this.getEdges(source);
    var result = [];

    // Checks if the edge is connected to the correct
    // cell and returns the first match
    for (var i = 0; i < edges.length; i++) {
      var src = this.getVisibleTerminal(edges[i], true);
      var trg = this.getVisibleTerminal(edges[i], false);

      if (
        (src == source && trg == target) ||
        (!directed && src == target && trg == source)
      ) {
        result.push(edges[i]);
      }
    }

    return result;
  };

  /**
   * Traverses the (directed) graph invoking the given function for each
   * visited vertex and edge. The function is invoked with the current vertex
   * and the incoming edge as a parameter. This implementation makes sure
   * each vertex is only visited once. The function may return false if the
   * traversal should stop at the given vertex.
   *
   * Parameters:
   *
   * vertex - <mxCell> that represents the vertex where the traversal starts.
   * directed - boolean indicating if edges should only be traversed
   * from source to target. Default is true.
   * edge - Optional <mxCell> that represents the incoming edge. This is
   * null for the first step of the traversal.
   * allVertices - Array of cell paths for the visited cells.
   */
  mxHierarchicalLayout.prototype.traverse = function (
    vertex,
    directed,
    edge,
    allVertices,
    currentComp,
    hierarchyVertices,
    filledVertexSet
  ) {
    if (vertex != null && allVertices != null) {
      // Has this vertex been seen before in any traversal
      // And if the filled vertex set is populated, only
      // process vertices in that it contains
      var vertexID = mxObjectIdentity.get(vertex);

      if (
        allVertices[vertexID] == null &&
        (filledVertexSet == null ? true : filledVertexSet[vertexID] != null)
      ) {
        if (currentComp[vertexID] == null) {
          currentComp[vertexID] = vertex;
        }
        if (allVertices[vertexID] == null) {
          allVertices[vertexID] = vertex;
        }

        if (filledVertexSet !== null) {
          delete filledVertexSet[vertexID];
        }

        var edges = this.getEdges(vertex);
        var edgeIsSource = [];

        for (var i = 0; i < edges.length; i++) {
          edgeIsSource[i] = this.getVisibleTerminal(edges[i], true) == vertex;
        }

        for (var i = 0; i < edges.length; i++) {
          if (!directed || edgeIsSource[i]) {
            var next = this.getVisibleTerminal(edges[i], !edgeIsSource[i]);

            // Check whether there are more edges incoming from the target vertex than outgoing
            // The hierarchical model treats bi-directional parallel edges as being sourced
            // from the more "sourced" terminal. If the directions are equal in number, the direction
            // is that of the natural direction from the roots of the layout.
            // The checks below are slightly more verbose than need be for performance reasons
            var netCount = 1;

            for (var j = 0; j < edges.length; j++) {
              if (j == i) {
                continue;
              } else {
                var isSource2 = edgeIsSource[j];
                var otherTerm = this.getVisibleTerminal(edges[j], !isSource2);

                if (otherTerm == next) {
                  if (isSource2) {
                    netCount++;
                  } else {
                    netCount--;
                  }
                }
              }
            }

            if (netCount >= 0) {
              currentComp = this.traverse(
                next,
                directed,
                edges[i],
                allVertices,
                currentComp,
                hierarchyVertices,
                filledVertexSet
              );
            }
          }
        }
      } else {
        if (currentComp[vertexID] == null) {
          // We've seen this vertex before, but not in the current component
          // This component and the one it's in need to be merged

          for (var i = 0; i < hierarchyVertices.length; i++) {
            var comp = hierarchyVertices[i];

            if (comp[vertexID] != null) {
              for (var key in comp) {
                currentComp[key] = comp[key];
              }

              // Remove the current component from the hierarchy set
              hierarchyVertices.splice(i, 1);
              return currentComp;
            }
          }
        }
      }
    }

    return currentComp;
  };

  /**
   * Function: cycleStage
   *
   * Executes the cycle stage using mxMinimumCycleRemover.
   */
  mxHierarchicalLayout.prototype.cycleStage = function (parent) {
    var cycleStage = new mxMinimumCycleRemover(this);
    cycleStage.execute(parent);
  };

  /**
   * Function: layeringStage
   *
   * Implements first stage of a Sugiyama layout.
   */
  mxHierarchicalLayout.prototype.layeringStage = function () {
    this.model.initialRank();
    this.model.fixRanks();
  };

  /**
   * Function: crossingStage
   *
   * Executes the crossing stage using mxMedianHybridCrossingReduction.
   */
  mxHierarchicalLayout.prototype.crossingStage = function (parent) {
    var crossingStage = new mxMedianHybridCrossingReduction(this);
    crossingStage.execute(parent);
  };

  /**
   * Function: placementStage
   *
   * Executes the placement stage using mxCoordinateAssignment.
   */
  mxHierarchicalLayout.prototype.placementStage = function (initialX, parent) {
    var placementStage = new mxCoordinateAssignment(
      this,
      this.intraCellSpacing,
      this.interRankCellSpacing,
      this.orientation,
      initialX,
      this.parallelEdgeSpacing
    );
    placementStage.fineTuning = this.fineTuning;
    placementStage.execute(parent);

    return placementStage.limitX + this.interHierarchySpacing;
  };
  mx.mxHierarchicalLayout = mxHierarchicalLayout;
};

export const useHierarchicalLayout = (editorUi) => {
  const { mxHierarchicalLayout, mxConstants, mxUtils, Editor } = mx;
  const action = editorUi.actions.addAction(
    "horizontalFlow",
    mxUtils.bind(editorUi, function (arg1, evt) {
      const graph = editorUi.editor.graph;
      new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST).execute(
        graph.getDefaultParent()
      );
    }),
    null,
    null,
    Editor.ctrlKey + "+L"
  );
  editorUi.keyHandler.bindAction(76, true, "horizontalFlow", true); // Ctrl+F
};
