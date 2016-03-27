module.exports = {
  __depends__: [
    require('diagram-js/lib/features/search-pad'),
    require('diagram-js/lib/features/overlays')
  ],
  __init__: [ 'bpmnSearch'],
  bpmnSearch: [ 'type', require('./BpmnSearchProvider') ]
};
