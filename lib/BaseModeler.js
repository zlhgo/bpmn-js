'use strict';

var inherits = require('inherits');

var IdSupport = require('bpmn-moddle/lib/id-support'),
    Ids = require('ids');

var BaseViewer = require('./BaseViewer');

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
                    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
                    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
                    'targetNamespace="http://bpmn.io/schema/bpmn" ' +
                    'id="Definitions_1">' +
    '<bpmn:process id="Process_1" isExecutable="false">' +
      '<bpmn:startEvent id="StartEvent_1"/>' +
    '</bpmn:process>' +
    '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
      '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
        '<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">' +
          '<dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>' +
        '</bpmndi:BPMNShape>' +
      '</bpmndi:BPMNPlane>' +
    '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';


/**
 * A modeler for BPMN 2.0 diagrams.
 *
 * You must provide `options.modules` to this constructor function.
 *
 * @param {Object} options configuration options to pass to the modeler
 * @param {DOMElement} [options.container] the container to render the viewer in, defaults to body.
 * @param {String|Number} [options.width] the width of the viewer
 * @param {String|Number} [options.height] the height of the viewer
 * @param {Object} [options.moddleExtensions] extension packages to provide
 * @param {Array<didi.Module>} options.modules a list of modules to override the default modules
 * @param {Array<didi.Module>} [options.additionalModules] a list of modules to use with the default modules
 *
 * @see Modeler
 */
function BaseModeler(options) {
  BaseViewer.call(this, options);
}

inherits(BaseModeler, BaseViewer);

module.exports = BaseModeler;


BaseModeler.prototype.createDiagram = function(done) {
  return this.importXML(initialDiagram, done);
};

BaseModeler.prototype.createModdle = function() {
  var moddle = BaseViewer.prototype.createModdle.call(this);

  IdSupport.extend(moddle, new Ids([ 32, 36, 1 ]));

  return moddle;
};