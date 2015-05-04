'use strict';

var TestHelper = require('../../TestHelper');

/* global bootstrapViewer, inject */

var EventBus = require('diagram-js/lib/core/EventBus');


describe('environment - mocking', function() {

  var diagramXML = require('../../fixtures/bpmn/simple.bpmn');

  var mockEventBus, bootstrapCalled;

  beforeEach(bootstrapViewer(diagramXML, {}, function() {
    mockEventBus = new EventBus();

    bootstrapCalled = true;

    return {
      eventBus: mockEventBus
    };
  }));

  afterEach(function() {
    bootstrapCalled = false;
  });


  it('should use spy', inject(function(eventBus) {

    expect(eventBus).toEqual(mockEventBus);
    expect(bootstrapCalled).toBe(true);
  }));


  it('should reparse bootstrap code', inject(function(eventBus) {

    expect(bootstrapCalled).toBe(true);
  }));


  it('should inject bpmnjs', inject(function(bpmnjs) {

    expect(bpmnjs).toBeDefined();
  }));

});