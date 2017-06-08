/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.12.1 - 2015-02-20
 * License: MIT
 */
angular.module('ui.bootstrap.position', [])

/**
 * A set of utility methods that can be use to retrieve position of DOM elements.
 * It is meant to be used where we need to absolute-position DOM elements in
 * relation to other, existing elements (this is the case for tooltips, popovers,
 * typeahead suggestions etc.).
 */
  .factory('$position', ['$document', '$window', '$rootScope', '$timeout', function ($document, $window, $rootScope, $timeout) {

    function getStyle(el, cssprop) {
      if (el.currentStyle) { //IE
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      // finally try and get inline style
      return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static' ) === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent) ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };

    return {
      /**
       * Provides read-only equivalent of jQuery's position function:
       * http://api.jquery.com/position/
       */
      position: function (element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = { top: 0, left: 0 };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }

        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },

      /**
       * Provides read-only equivalent of jQuery's offset function:
       * http://api.jquery.com/offset/
       */
      offset: function (element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },

      /**
       * Provides coordinates for the targetEl in relation to hostEl
       */
      positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0], pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var window_width = $window.innerWidth;
        var window_height = $window.innerHeight;

        var xs_window_width = 414;  //iphone6+ = 414, iphone6=375, iphone5=320
        var xs_window_height = 568; //iphone6+=736, iphone6=667, iphone5=568

        var xs_position_left = 15;
        var xs_position_top = 15;

        if(!!$rootScope.bootstrapConfirmWidthXS){
          xs_window_width = $rootScope.bootstrapConfirmWidthXS; //setting can be overriden at $rootscrop
        }
        if(!!$rootScope.bootstrapConfirmHeightXS){
          xs_window_height = $rootScope.bootstrapConfirmHeightXS;
        }

        var shiftWidth = {
          center: function () {
            if(window_width > xs_window_width)
              return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            else{
              return xs_position_left;
            }
          },
          left: function () {
            if(window_width > xs_window_width)
              return hostElPos.left;
            else{
              return xs_position_left;
            }
          },
          right: function () {
            if(window_width > xs_window_width)
              return hostElPos.left + hostElPos.width;
            else{
              return xs_position_left;
            }
          }
        };

        var shiftHeight = {
          center: function () {
            if(window_height > xs_window_height)
              return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            else{
              return xs_position_top;
            }
          },
          top: function () {
            if(window_height > xs_window_height)
              return hostElPos.top;
            else{
              return xs_position_top;
            }
          },
          bottom: function () {
            if(window_height > xs_window_height)
              return hostElPos.top + hostElPos.height;
            else{
              return xs_position_top;
            }
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: window_width > xs_window_width? hostElPos.left - targetElWidth : shiftWidth[pos0]()
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: window_height > xs_window_height? hostElPos.top - targetElHeight : shiftHeight[pos1](),
              left: shiftWidth[pos1]()
            };
            break;
        }
        return targetElPos;
      }
    };
  }]);
