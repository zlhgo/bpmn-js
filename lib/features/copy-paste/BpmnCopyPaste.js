'use strict';

var ModelUtil = require('../../util/ModelUtil'),
    getBusinessObject = ModelUtil.getBusinessObject,
    is = ModelUtil.is;

var map = require('lodash/collection/map'),
    forEach = require('lodash/collection/forEach');


function setProperties(descriptor, data, properties) {
  forEach(properties, function(property) {
    if (data[property]) {
      descriptor[property] = data[property];
    }
  });
}

function removeProperties(element, properties) {
  forEach(properties, function(prop) {
    if (element[prop]) {
      delete element[prop];
    }
  });
}

function BpmnCopyPaste(bpmnFactory, eventBus, copyPaste, clipboard, moddle, canvas, bpmnRules) {

  copyPaste.registerDescriptor(function(element, descriptor) {
    var businessObject = getBusinessObject(element),
        conditionExpression,
        eventDefinitions;

    descriptor.type = element.type;

    if (element.type === 'label') {
      return descriptor;
    }

    setProperties(descriptor, businessObject, [
      'name',
      'text',
      'processRef',
      'isInterrupting',
      'isForCompensation',
      'associationDirection'
    ]);

    if (businessObject.default) {
      descriptor.default = businessObject.default.id;
    }

    if (businessObject.loopCharacteristics) {

      descriptor.loopCharacteristics = {
        type: businessObject.loopCharacteristics.$type,
        isSequential: businessObject.loopCharacteristics.isSequential
      };
    }

    setProperties(descriptor, businessObject.di, [ 'isExpanded' ]);

    if (is(businessObject, 'bpmn:SequenceFlow')) {
      conditionExpression = businessObject.get('conditionExpression');

      if (conditionExpression) {
        descriptor.conditionExpression = {
          type: conditionExpression.$type,
          body: conditionExpression.body
        };
      }
    }

    eventDefinitions = businessObject.get('eventDefinitions') || [];

    if (eventDefinitions.length) {
      descriptor.eventDefinitions = map(eventDefinitions, function(defs) {
        return defs.$type;
      });
    }

    return descriptor;
  });

  eventBus.on('element.paste', function(context) {
    var descriptor = context.descriptor,
        createdElements = context.createdElements,
        parent = descriptor.parent,
        businessObject, eventDefinitions, newEventDefinition, rootElement,
        conditionExpression, loopCharacteristics,
        source, target, canConnect;

    if (descriptor.type === 'label') {
      return;
    }

    if (is(parent, 'bpmn:Process')) {
      rootElement = canvas.getRootElement();

      descriptor.parent = is(rootElement, 'bpmn:Collaboration') ? rootElement : parent;
    }

    if (descriptor.type === 'bpmn:MessageFlow') {
      descriptor.parent = canvas.getRootElement();
    }

    // make sure that the correct type of connection is created
    if (descriptor.waypoints) {
      source = createdElements[descriptor.source];
      target = createdElements[descriptor.target];

      if (source && target) {
        source = source.element;
        target = target.element;
      }

      canConnect = bpmnRules.canConnect(source, target);

      if (canConnect) {
        descriptor.type = canConnect.type;
      }
    }

    descriptor.businessObject = businessObject = bpmnFactory.create(descriptor.type);

    setProperties(businessObject, descriptor, [
      'name',
      'text',
    ]);

    if (descriptor.loopCharacteristics) {
      loopCharacteristics = descriptor.loopCharacteristics;

      businessObject.loopCharacteristics = moddle.create(loopCharacteristics.type);

      if (loopCharacteristics.isSequential) {
        businessObject.loopCharacteristics.isSequential = true;
      }

      businessObject.loopCharacteristics.$parent = businessObject;
    }

    if (descriptor.conditionExpression) {
      conditionExpression = descriptor.conditionExpression;

      businessObject.conditionExpression = moddle.create(conditionExpression.type, { body: conditionExpression.body });

      businessObject.conditionExpression.$parent = businessObject;
    }

    if (descriptor.eventDefinitions) {
      eventDefinitions = businessObject.eventDefinitions;

      businessObject.eventDefinitions = map(descriptor.eventDefinitions, function(type) {
        newEventDefinition = moddle.create(type);

        newEventDefinition.$parent = businessObject;

        return newEventDefinition;
      });
    }

    removeProperties(descriptor, [ 'name', 'text', 'eventDefinitions', 'conditionExpression', 'loopCharacteristics' ]);
  });
}


BpmnCopyPaste.$inject = [
  'bpmnFactory',
  'eventBus',
  'copyPaste',
  'clipboard',
  'moddle',
  'canvas',
  'bpmnRules'
];

module.exports = BpmnCopyPaste;
