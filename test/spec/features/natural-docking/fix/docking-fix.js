'use strict';

function fixDocking(eventBus) {

  eventBus.on('connectionSegment.move.activate', 1500, function(e) {

    console.log(e);
  });

}

fixDocking.$inject = [ 'eventBus' ];

module.exports = fixDocking;