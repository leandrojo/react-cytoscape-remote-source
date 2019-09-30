/* global document, io */
/* eslint-disable no-console */
/* eslint-disable react/jsx-filename-extension */

import Immutable from 'immutable';
import React from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

import './Canvas.css';

cytoscape.use(edgehandles);

const style = [
  {
    selector: 'node[name]',
    style: {
      'background-color': 'white',
      color: 'white',
      content: 'data(name)',
    },
  },

  {
    selector: 'edge',
    style: {
      'background-color': 'white',
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
    },
  },

  {
    selector: '.eh-handle',
    style: {
      'background-color': 'red',
      width: 12,
      height: 12,
      shape: 'ellipse',
      'overlay-opacity': 0,
      'border-width': 12, // makes the handle easier to hit
      'border-opacity': 0,
    },
  },

  {
    selector: '.eh-hover',
    style: {
      'background-color': 'red',
    },
  },

  {
    selector: '.eh-source',
    style: {
      'border-width': 2,
      'border-color': 'red',
    },
  },

  {
    selector: '.eh-target',
    style: {
      'border-width': 2,
      'border-color': 'red',
    },
  },

  {
    selector: '.eh-preview, .eh-ghost-edge',
    style: {
      'background-color': 'red',
      'line-color': 'red',
      'target-arrow-color': 'red',
      'source-arrow-color': 'red',
    },
  },

  {
    selector: '.eh-ghost-edge.eh-preview-active',
    style: {
      opacity: 0,
    },
  },
];

const ref = React.createRef();

const Canvas = () => {
  const [data, update] = React.useState({
    edges: Immutable.Set([]),
    nodes: Immutable.Set([]),
  });
  const [state, setState] = React.useState(false);

  const onPressModeHandleEdge = () => {
    state.eh.enableDrawMode();
  };

  const onPressModeSelected = () => {
    state.eh.disableDrawMode();
  };

  React.useEffect(() => {
    const { hostname } = document.location;
    const socket = io(`http://${hostname}:8080`);

    const cy = cytoscape({
      container: ref.current,
      layout: {},
      style,
    });

    const eh = cy.edgehandles();

    cy.promiseOn('add').then(() => {
      console.log({
        edges: cy.edges().jsons(),
        nodes: cy
          .nodes()
          .jsons()
          .filter((node) => {
            if (/eh-handle|eh-source|eh-ghost/.test(node.classes)) return false;
            return true;
          }),
      });
    });

    cy.on('drag', (ev) => {
      socket.emit('canvas/update', ev.target.json());
    });

    cy.once('add', () => {
      cy.maxZoom(1);
      cy.minZoom(0.2);

      // cy.layout({
      //   name: 'grid',
      // }).run();
    });

    socket.on('canvas', ({ canvas }) => {
      update({
        edges: Immutable.Set(canvas.edges),
        nodes: Immutable.Set(canvas.nodes),
      });

      console.log('canvas', canvas);
    });

    setState({
      cy,
      eh,
    });
  }, []);

  React.useEffect(() => {
    if (state === false) return;

    const { cy } = state;

    cy.remove(cy.elements());
    cy.add({
      edges: data.edges.toJS(),
      nodes: data.nodes.toJS(),
    });
  }, [state, data]);

  return (
    <>
      <div className="canvas" ref={ref} />
      <div className="actions">
        <button type="button" onClick={onPressModeSelected}>Selected Mode</button>
        <button type="button" onClick={onPressModeHandleEdge}>Handle Edge Mode</button>
      </div>
    </>
  );
};

export default Canvas;
