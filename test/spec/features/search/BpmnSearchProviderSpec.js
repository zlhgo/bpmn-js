'use strict';

var coreModule = require('../../../../lib/core'),
    modelingModule = require('../../../../lib/features/modeling'),
    bpmnSearchModule = require('../../../../lib/features/search');

var domQuery = require('min-dom/lib/query');

/* global bootstrapViewer, inject */

describe('features - BPMN search provider', function() {

  var diagramXML = require('./bpmn-search.bpmn');

  var testModules = [
    coreModule,
    modelingModule,
    bpmnSearchModule
  ];

  beforeEach(bootstrapViewer(diagramXML, { modules: testModules }));


  it('find should return all elements that match label', inject(function(bpmnSearch) {
    // given
    var pattern = '123456';

    // when
    var elements = bpmnSearch.find(pattern);

    // then
    expect(elements).length(3);
    elements.forEach(function(e) {
      expect(e).to.have.property('item');
      expect(e).to.have.property('text');
    });
  }));


  describe('selection', function() {

    var element;

    beforeEach(inject(function(bpmnSearch) {
      // given
      var pattern = 'UNIQUE ELEMENT';
      element = bpmnSearch.find(pattern)[0].item;
    }));


    it('preselect should set overlay on an element', inject(function(bpmnSearch, overlays) {
      // when
      bpmnSearch.preselect(element);

      // then
      var overlay = overlays.get({ element: element });
      expect(overlay).length(1);
    }));


    it('select should remove overlay from an element', inject(function(bpmnSearch, overlays) {
      // given
      bpmnSearch.preselect(element);

      // when
      bpmnSearch.select(element);

      // then
      var overlay = overlays.get({ element: element });
      expect(overlay).length(0);
    }));


    it('select should center viewbox on an element', inject(function(bpmnSearch, canvas) {
      // given
      var container = canvas.getContainer();
      container.style.width = '1000px';
      container.style.height = '1000px';

      canvas.viewbox({
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      });

      // when
      bpmnSearch.select(element);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox).to.have.property('x', -450);
      expect(newViewbox).to.have.property('y', -460);
    }));


    it('select should keep zoom level', inject(function(bpmnSearch, canvas) {
      // given
      canvas.zoom(0.4);

      // when
      bpmnSearch.select(element);

      // then
      var newViewbox = canvas.viewbox();
      expect(newViewbox).to.have.property('scale', 0.4);
    }));


    it('select should apply selection on an element', inject(function(bpmnSearch, selection) {
      // when
      bpmnSearch.select(element);

      // then
      expect(selection.isSelected(element)).to.be.true;
    }));

  });

});
