'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */

var bpmnCopyPasteModule = require('../../../../lib/features/copy-paste'),
    copyPasteModule = require('diagram-js/lib/features/copy-paste'),
    modelingModule = require('../../../../lib/features/modeling'),
    coreModule = require('../../../../lib/core');

var map = require('lodash/collection/map'),
    forEach = require('lodash/collection/forEach');

var DescriptorTree = require('./DescriptorTree');


function mapProperty(shapes, prop) {
  return map(shapes, function(shape) {
    return shape[prop];
  });
}

function expectCollection(collA, collB, contains) {
  expect(collA).to.have.length(collB.length);

  forEach(collB, function(element) {
    if (!element.parent) {
      return;
    }

    if (contains) {
      expect(collA).to.contain(element);
    } else {
      expect(collA).to.not.contain(element);
    }
  });
}


describe('features/copy-paste', function() {

  var testModules = [ bpmnCopyPasteModule, copyPasteModule, modelingModule, coreModule ];

  var basicXML = require('../../../fixtures/bpmn/features/copy-paste/basic.bpmn'),
      collaborationXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration.bpmn'),
      collaborationMultipleXML = require('../../../fixtures/bpmn/features/copy-paste/collaboration-multiple.bpmn');


  var integrationTest = function(ids) {
    return function(canvas, elementRegistry, modeling, copyPaste, commandStack) {
      // given
      var shapes = elementRegistry.getAll(),
          rootElement;

      var initialContext = {
            type: mapProperty(shapes, 'type'),
            ids: mapProperty(shapes, 'id'),
            length: shapes.length
          },
          currentContext;

      var elements = map(ids, function(id) {
        return elementRegistry.get(id);
      });

      copyPaste.copy(elements);

      modeling.removeElements(elements);

      rootElement = canvas.getRootElement();

      copyPaste.paste({
        element: rootElement,
        point: {
          x: 1100,
          y: 250
        }
      });

      elements = elementRegistry.getAll();

      // remove root
      elements = elementRegistry.filter(function(element) {
        return !!element.parent;
      });

      modeling.moveElements(elements, { x: 50, y: -50 });

      // when
      commandStack.undo();
      commandStack.undo();
      commandStack.undo();

      currentContext = {
        type: mapProperty(shapes, 'type'),
        ids: mapProperty(shapes, 'id'),
        length: shapes.length
      };

      // then
      expect(initialContext).to.have.length(currentContext.length);

      expectCollection(initialContext.ids, currentContext.ids, true);

      // when
      commandStack.redo();
      commandStack.redo();
      commandStack.redo();

      currentContext = {
        type: mapProperty(elementRegistry.getAll(), 'type'),
        ids: mapProperty(elementRegistry.getAll(), 'id'),
        length: shapes.length
      };

      // then
      expect(initialContext).to.have.length(currentContext.length);

      expectCollection(initialContext.type, currentContext.type, true);
      expectCollection(initialContext.ids, currentContext.ids, false);
    };
  };

    describe('basic diagram', function() {

      beforeEach(bootstrapModeler(basicXML, { modules: testModules }));

      describe('copy', function() {

        it('selected elements', inject(function(elementRegistry, copyPaste) {

          // given
          var subProcess, startEvent, boundaryEvent, textAnnotation, conditionalFlow, defaultFlow,
              tree;

          // when
          copyPaste.copy(elementRegistry.get('SubProcess_1kd6ist'));

          tree = new DescriptorTree(copyPaste._tree);

          startEvent = tree.getElement('StartEvent_1');
          boundaryEvent = tree.getElement('BoundaryEvent_1c94bi9');
          subProcess = tree.getElement('SubProcess_1kd6ist');
          textAnnotation = tree.getElement('TextAnnotation_0h1hhgg');
          conditionalFlow = tree.getElement('SequenceFlow_07vo2r8');
          defaultFlow = tree.getElement('Task_1fo63a7');

          // then
          expect(tree.getLength()).to.equal(3);

          expect(tree.getDepthLength(0)).to.equal(1);
          expect(tree.getDepthLength(1)).to.equal(3);
          expect(tree.getDepthLength(2)).to.equal(15);

          expect(subProcess.isExpanded).to.be.true;
          expect(startEvent.name).to.equal('hello');
          expect(textAnnotation.text).to.equal('foo');
          expect(boundaryEvent.eventDefinitions).to.contain('bpmn:TimerEventDefinition');
        }));

      });

      describe('integration', function() {

        it('should retain label\'s relative position',
          inject(function(modeling, copyPaste, canvas, elementRegistry) {
          // given
          var startEvent = elementRegistry.get('StartEvent_1'),
              startEventLabel = startEvent.label,
              seqFlow = elementRegistry.get('SequenceFlow_1rtr33r'),
              seqFlowLabel = seqFlow.label,
              task = elementRegistry.get('Task_1fo63a7'),
              rootElement = canvas.getRootElement(),
              newStrtEvt, newSeqFlow;

          // when
          copyPaste.copy([ startEvent, task ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          newStrtEvt = elementRegistry.filter(function(element) {
            return element.parent === rootElement && element.type === 'bpmn:StartEvent';
          })[0];

          newSeqFlow = elementRegistry.filter(function(element) {
            return element.parent === rootElement && element.type === 'bpmn:SequenceFlow';
          })[0];

          // then
          expect(newStrtEvt.label.x - newStrtEvt.x).to.equal(startEventLabel.x - startEvent.x);
          expect(newStrtEvt.label.y - newStrtEvt.y).to.equal(startEventLabel.y - startEvent.y);

          expect(newSeqFlow.label.x - newSeqFlow.waypoints[0].x).to.equal(seqFlowLabel.x - seqFlow.waypoints[0].x);
          expect(newSeqFlow.label.y - newSeqFlow.waypoints[0].y).to.equal(seqFlowLabel.y - seqFlow.waypoints[0].y);
        }));


        it('should retain default & conditional flow property',
          inject(function(elementRegistry, copyPaste, canvas, modeling) {
          // given
          var subProcess = elementRegistry.get('SubProcess_1kd6ist'),
              rootElement = canvas.getRootElement(),
              task, defaultFlow, conditionalFlow;

          // when
          copyPaste.copy(subProcess);

          modeling.removeElements([ subProcess ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          task = elementRegistry.filter(function(element) {
            return element.type === 'bpmn:Task';
          })[0];

          defaultFlow = elementRegistry.filter(function(element) {
            return !!(element.type === 'bpmn:SequenceFlow' && task.businessObject.default.id === element.id);
          })[0];

          conditionalFlow = elementRegistry.filter(function(element) {
            return !!(element.type === 'bpmn:SequenceFlow' && element.businessObject.conditionExpression);
          })[0];

          expect(defaultFlow).to.exist;
          expect(conditionalFlow).to.exist;
        }));


        it('should retain loop characteristics',
          inject(function(elementRegistry, copyPaste, canvas, modeling) {
          // given
          var subProcess = elementRegistry.get('SubProcess_0gev7mx'),
              rootElement = canvas.getRootElement(),
              loopCharacteristics;

          // when
          copyPaste.copy(subProcess);

          modeling.removeElements([ subProcess ]);

          copyPaste.paste({
            element: rootElement,
            point: {
              x: 1100,
              y: 250
            }
          });

          subProcess = elementRegistry.filter(function(element) {
            return !!(element.id !== 'SubProcess_1kd6ist' && element.type === 'bpmn:SubProcess');
          })[0];

          loopCharacteristics = subProcess.businessObject.loopCharacteristics;

          expect(loopCharacteristics.$type).to.equal('bpmn:MultiInstanceLoopCharacteristics');
          expect(loopCharacteristics.isSequential).to.be.true;
        }));


        it('selected elements', inject(integrationTest([ 'SubProcess_1kd6ist' ])));

      });

      describe('rules', function() {

        it('disallow individual boundary events copying', inject(function(copyPaste, elementRegistry, canvas) {

          var boundaryEventA = elementRegistry.get('BoundaryEvent_1404oxd'),
              boundaryEventB = elementRegistry.get('BoundaryEvent_1c94bi9'),
              tree;

          // when
          copyPaste.copy([ boundaryEventA, boundaryEventB ]);

          tree = new DescriptorTree(copyPaste._tree);

          expect(tree.getLength()).to.equal(0);
        }));
      });

    });

    describe('basic collaboration', function() {

      beforeEach(bootstrapModeler(collaborationXML, { modules: testModules }));

      describe('integration', function() {

        it('participant with including lanes + elements', inject(integrationTest([ 'Participant_0uu1rvj' ])));

        it('collapsed pool', inject(integrationTest([ 'Participant_145muai' ])));

      });

      describe('rules', function () {

        it('disallow individual lanes copying', inject(function(copyPaste, elementRegistry, canvas) {

          var laneA = elementRegistry.get('Lane_13h648l'),
              laneB = elementRegistry.get('Lane_1gl63sa'),
              tree;

          // when
          copyPaste.copy([ laneA, laneB ]);

          tree = new DescriptorTree(copyPaste._tree);

          expect(tree.getLength()).to.equal(0);
        }));

      });

    });

    describe('complex collaboration', function() {

      beforeEach(bootstrapModeler(collaborationMultipleXML, { modules: testModules }));

      describe('integration', function() {

        it('multiple participants', inject(integrationTest([ 'Participant_0pgdgt4', 'Participant_1id96b4' ])));

      });

    });

});
