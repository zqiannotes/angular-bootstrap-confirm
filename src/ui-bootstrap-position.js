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

  //https://stackoverflow.com/questions/1567327/using-jquery-to-get-elements-position-relative-to-viewport?rq=1
    function getViewportOffset($e) {
        // var scrollLeft = $window.scrollLeft();
        // var scrollTop = $window.scrollTop();
        // var offset = $e.offset()

        var scrollLeft = $window.pageXOffset;
        var scrollTop = $window.pageYOffset;
        var offset = $e[0].getBoundingClientRect();

        //the rect for viewport
        var rect_viewport = {
            x1: scrollLeft,
            y1: scrollTop,
            x2: scrollLeft + $window.innerWidth,
            y2: scrollTop + $window.innerHeight
        };

        //the rect for viewport - top half
        var rect_viewport_tophalf = {
            x1: scrollLeft,
            y1: scrollTop,
            x2: scrollLeft + $window.innerWidth,
            y2: scrollTop + $window.innerHeight / 2
        };

        //the rect for viewport - low half
        var rect_viewport_lowhalf = {
            x1: scrollLeft,
            y1: scrollTop + $window.innerHeight / 2 + 1,
            x2: scrollLeft + $window.innerWidth,
            y2: scrollTop + $window.innerHeight
        };

        //the rect for viewport - left half
        var rect_viewport_lefthalf = {
            x1: scrollLeft,
            y1: scrollTop,
            x2: scrollLeft + $window.innerWidth / 2,
            y2: scrollTop + $window.innerHeight
        };

        //the rect for viewport - right half
        var rect_viewport_righthalf = {
            x1: scrollLeft + $window.innerWidth / 2 + 1,
            y1: scrollTop,
            x2: scrollLeft + $window.innerWidth,
            y2: scrollTop + $window.innerHeight
        };


        //the rect for element
        var rect_element = {
            x1: offset.left,
            y1: offset.top,
            x2: offset.left + $e[0].clientWidth,
            y2: offset.top + $e[0].clientHeight
        };

        return {
            left: offset.left - scrollLeft,     //relative to viewport
            top: offset.top - scrollTop,        //relative to viewport
            insideViewport:
                rect_viewport.x1 < rect_element.x2 &&
                rect_viewport.x2 > rect_element.x1 &&
                rect_viewport.y1 < rect_element.y2 &&
                rect_viewport.y2 > rect_element.y1,

            insideViewportTopHalf:
                rect_viewport_lowhalf.y1 > rect_element.y2,

            insideViewportLowHalf:
                rect_viewport_tophalf.y2 < rect_element.y1,

            insideViewportLeftHalf:
                rect_viewport_righthalf.x1 > rect_element.x2,

            insideViewportRightHalf:
                rect_viewport_lefthalf.x2 < rect_element.x1
,
        };
    }

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
        var pos0 = positionStrParts[0];
        var pos1 = positionStrParts[1] || 'center';

        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;

        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');

        var window_width = $window.innerWidth;
        var window_height = $window.innerHeight;

        var scrollLeft = $window.pageXOffset;
        var scrollTop = $window.pageYOffset;

        var xs_window_width = 414;  //iphone6+ = 414, iphone6=375, iphone5=320
        var xs_window_height = 568; //iphone6+=736, iphone6=667, iphone5=568

        var xs_position_left = 15;
        var xs_position_top = 30;   //avoid top banner height

        if(!!$rootScope.bootstrapConfirmWidthXS){
          xs_window_width = $rootScope.bootstrapConfirmWidthXS; //setting can be overriden at $rootscrop
        }
        if(!!$rootScope.bootstrapConfirmHeightXS){
          xs_window_height = $rootScope.bootstrapConfirmHeightXS;
        }

        var shiftWidth = {
          center: function () {
              var x= hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
              if (x <= 0){
                x = xs_position_left;
              }
              return x;
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
              var pos = hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;  //default center position

              if(window_height <= xs_window_height) {
                var viewportOffset = getViewportOffset(hostEl);

                //adjust a little bit when xs
                if(viewportOffset.insideViewportTopHalf){
                  pos = pos + 100;
                }

                //adjust a little bit when xs
                if(viewportOffset.insideViewportLowHalf){
                  pos = pos - 100;
                }
              }


              return pos;
          },
          top: function () {
            if(window_height > xs_window_height)
              return hostElPos.top;
            else{
               return xs_position_top;
            }
          },
          bottom: function () {
            var top;
            var delta;
            if(window_height > xs_window_height){
                top = hostElPos.top + hostElPos.height;
                delta = top + targetElHeight - scrollTop - window_height;
                if(delta > 0){
                  top = top - delta - 10; // top - delta - 10 px more
                }
            }

            else{
                top = xs_position_top;
            }
            return top;
          }
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: window_width > xs_window_width? shiftWidth[pos0](): shiftWidth['left']()
            };

            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: window_width > xs_window_width? hostElPos.left - targetElWidth : shiftWidth['left']()
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: window_width > xs_window_width? hostElPos.left - targetElWidth : shiftWidth['left']()
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
