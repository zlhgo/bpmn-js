'use strict';

var map = require('lodash/collection/map'),
    filter = require('lodash/collection/filter'),
    sortBy = require('lodash/collection/sortBy');

var labelUtil = require('../label-editing/LabelUtil');

var getBoundingBox = require('diagram-js/lib/util/Elements').getBBox;


/**
 * Provides ability to search through BPMN elements
 */
function Search(elementRegistry, overlays, selection, canvas, searchPad, eventBus) {
  var self = this;

  this._elementRegistry = elementRegistry;
  this._overlays = overlays;
  this._selection = selection;
  this._canvas = canvas;
  this._eventBus = eventBus;

  searchPad.registerProvider(this);

  eventBus.on('searchPad.closed', function() {
    self._resetOverlay();
  });

  eventBus.on('searchPad.cleared', function() {
    self._resetOverlay();
  });
}

Search._inject = [
  'elementRegistry',
  'overlays',
  'selection',
  'canvas',
  'searchPad',
  'eventBus'
];


/**
 * Finds all elements that match given pattern
 *
 * @param  {String} pattern
 * @return {Array<Result>} { text: <String>, item: <Element> }
 */
Search.prototype.find = function(pattern) {
    var elements = this._elementRegistry.getAll();

    // excluding label elements
    elements = filter(elements, function isElement(element) {
      return !element.labelTarget;
    });

    // including only elements with non-empty label
    elements = filter(elements, labelUtil.getLabel);

    // filter according to requested pattern
    if (pattern){
      elements = filter(elements, function(el) {

        var label = labelUtil.getLabel(el);
        label = label.replace(/\s/g, '');
        label = label.toLowerCase();

        pattern = pattern.replace(/\s/g, '');
        pattern = pattern.toLowerCase();

        return label.indexOf(pattern) > -1;
      });
    }

    elements = map(elements, function(el) {
      return {
        text: labelUtil.getLabel(el),
        item: el
      };
    });

    elements = sortBy(elements, function(el) {
      return el.text;
    });

    return elements;
};


/**
 * Preselect result entry
 *
 * @param  {Element} element
 */
Search.prototype.preselect = function(element) {
  this._resetOverlay(element);

  this._centerViewbox(element);
};


/**
 * Select result element
 *
 * @param  {Element} element
 */
Search.prototype.select = function(element) {
  this._resetOverlay();

  this._centerViewbox(element);

  this._selection.select(element);
};


/**
 * Center viewbox on the element middle point.
 *
 * @param  {Element} element
 */
Search.prototype._centerViewbox = function(element) {
  var viewbox = this._canvas.viewbox();

  var box = getBoundingBox(element);

  var newViewbox = {
    x: (box.x + box.width/2) - viewbox.outer.width/2,
    y: (box.y + box.height/2) - viewbox.outer.height/2,
    width: viewbox.outer.width,
    height: viewbox.outer.height
  };

  this._canvas.viewbox(newViewbox);

  this._canvas.zoom(viewbox.scale);
};


/**
 * Reset overlay removes and, optionally, set
 * overlay to a new element.
 *
 * @param  {Element} element
 */
Search.prototype._resetOverlay = function(element) {
  if (this._overlayId) {
    this._overlays.remove(this._overlayId);
  }

  if (element) {
    var box = getBoundingBox(element);
    var overlay = constructOverlay(box);
    this._overlayId = this._overlays.add(element, overlay);
  }
};


module.exports = Search;


function constructOverlay(box) {

  var offset = 6;
  var w = box.width + offset * 2;
  var h = box.height + offset * 2;

  var styles = [
    'width: '+ w +'px',
    'height: '+ h + 'px',
    'background: yellow',
    'border: dashed 2px #0231d5',
    'opacity: 0.3'
  ].join('; ');

  return {
    position: {
      bottom: h - offset,
      right: w - offset
    },
    html: '<div style="' + styles + '"></div>'
  };
}
