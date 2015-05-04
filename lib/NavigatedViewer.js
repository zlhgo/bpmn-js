'use strict';

var inherits = require('inherits');

var Viewer = require('./Viewer'),
    BaseViewer = require('./BaseViewer');


var viewerModules = Viewer._viewerModules;

var navigationModules = [
  require('diagram-js/lib/navigation/zoomscroll'),
  require('diagram-js/lib/navigation/movecanvas')
];

var navigatedViewerModules = [].concat(
  viewerModules,
  navigationModules);


/**
 * A viewer that includes mouse navigation facilities.
 *
 * Have a look at the {@link Viewer} for additional documentation.
 *
 * @param {Object} [options] configuration options to pass to the viewer
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {String|Number} [options.width] the width of the viewer
 * @param {String|Number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Array<didi.Module>} [options.modules] a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
 */
function NavigatedViewer(options) {
  options = options || {};

  options.modules = options.modules || navigatedViewerModules;

  BaseViewer.call(this, options);
}

inherits(NavigatedViewer, BaseViewer);

module.exports = NavigatedViewer;