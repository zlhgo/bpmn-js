'use strict';

/**
 * Is an element of the given BPMN type?
 *
 * @param  {djs.model.Base|ModdleElement} element
 * @param  {String} type
 *
 * @return {Boolean}
 *
 * @category Utilities
 * @public
 */
function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}

module.exports.is = is;


/**
 * Return the business object for a given element.
 *
 * @param  {djs.model.Base|ModdleElement} element
 *
 * @return {ModdleElement}
 *
 * @category Utilities
 * @public
 */
function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

module.exports.getBusinessObject = getBusinessObject;
