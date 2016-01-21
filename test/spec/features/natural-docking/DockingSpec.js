'use strict';

var TestHelper = require('../../../TestHelper');

/* global bootstrapModeler, inject */


var modelingModule = require('../../../../lib/features/modeling'),
    bendpointsModule = require('diagram-js/lib/features/bendpoints'),
    coreModule = require('../../../../lib/core');


describe.skip('features/natural-docking', function() {

  var diagramXML = require('./Docking.bpmn');

  var testModules = [
    coreModule,
    bendpointsModule,
    modelingModule,
    require('./fix')
  ];

  beforeEach(bootstrapModeler(diagramXML, { modules: testModules }));


  describe('should apply', function() {

    it('moving element', inject(function(elementRegistry, bendpoints, modeling) {

      // given
      var taskShape = elementRegistry.get('Task'),
          sequenceFlowConnection = elementRegistry.get('SequenceFlow_A'),
          sequenceFlow = sequenceFlowConnection.businessObject;

      // when
      modeling.moveElements([ taskShape ], { x: 0, y: -50 });

      var expectedWaypoints = [
        {x: 598, y: 351 },
        {x: 954, y: 351 },
        {x: 954, y: 446 },
        {x: 852, y: 446 }
      ];

      // then

      // expect cropped connection
      expect(sequenceFlowConnection.waypoints).eql(expectedWaypoints);

      // expect cropped waypoints in di
      var diWaypoints = bpmnFactory.createDiWaypoints(expectedWaypoints);

      expect(sequenceFlow.di.waypoint).eql(diWaypoints);
    }));


    it('updating bendpoint', inject(function() {

    }));


    it('moving connection segment', inject(function() {

    }));


    it('reconnecting connection end', inject(function() {

    }));


    it('reconnecting connection start', inject(function() {

    }));

  });

});
