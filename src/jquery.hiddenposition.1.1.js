/*	jQuery HiddenPosition Plugin - easily position any DOM element, even if it's hidden
 *  Examples and documentation at: http://www.garralab.com/hiddenposition.php
 *  Copyright (C) 2012  garralab@gmail.com
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(function($) {
    /*
     * TODO:
     * consider margin
     */
    var DEBUG = false;
    var version = '1.1';
    $.fn.hiddenPosition = function(options) {
        var opts = $.extend({}, $.fn.hiddenPosition.defaults, options);
        return this.each(function() {
            var $this = $(this);
            var o = $.metadata ? $.extend({}, opts, $this.metadata()) : opts;
            position($this,o);
        });
    };
    function position(element,options) {
        var dims = getHiddenDims(element);
        var ofDims = getHiddenDims($(options.of));
        var my = getDirections(options.my);
        var at = getDirections(options.at);
        var offset = getOffset(options.offset);
        debugObject('my',my);
        debugObject('at',at);
        debugObject('myDims',dims);
        debugObject('targetDims',ofDims);
        
        var coord = getCoordinates(ofDims);
        
        switch (at.h) {
            case 'center':
                coord.left += ofDims.width/2
                break;
            case 'right':
                coord.left += ofDims.width
                break;
            default:
                break;
        }
        switch (at.v) {
            case 'center':
                coord.top += ofDims.height/2
                break;
            case 'bottom':
                coord.top += ofDims.height
                break;
            default:
                break;
        }
        switch (my.h) {
            case 'center':
                coord.left -= dims.width/2
                break;
            case 'right':
                coord.left -= dims.width
                break;
            default:
                break;
        }
        switch (my.v) {
            case 'center':
                coord.top -= dims.height/2
                break;
            case 'bottom':
                coord.top -= dims.height
                break;
            default:
                break;
        }
        coord.top += offset.v;
        coord.left += offset.h;
        coord = checkCollisions(element,coord,dims,my,at,options);
        if (dims.position=='relative') {
            coord = transformToRelative(element,coord,dims)
        }
        if (options.using) {
            options.using(coord,element);
        } else {
            move(element,coord);
        }
    };
    function move(element,coord) {
        element.css('left',coord.left+'px')
        .css('top',coord.top+'px');
    };
    function transformToRelative(element,coord,dims) {
        debugObject("to coordinates",coord);
        debugObject("dims",dims);
        coord.top -= dims.offsetTop-dims.top;
        coord.left -= dims.offsetLeft-dims.left;
        debugObject("transformed coordinates",coord);
        return coord;
    };
    function checkCollisions(element,coord,dims,my,at,options) {
        if (options.collision.match(/flip|fit/g)) {
            debug('CHECK COLLISION!',options.collision);
            var collisions = {h:'none',v:'none'};
            var opts = options.collision.split(' ');
            if (opts.length == 1) {
                collisions.h = opts[0];
                collisions.v = opts[0];
            } else if (opts.length > 1) {
                collisions.h = opts[0];
                collisions.v = opts[1];
            }
            var viewport = null;
            if (options.viewport) {
                viewport = getHiddenDims($(options.viewport));
            } else {
                viewport = {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    offsetTop: 0,
                    offsetLeft: 0,
                    width: $(window).width(),
                    height: $(window).height(),
                    innerWidth: $(window).width(),
                    innerHeight: $(window).height()
                }
            }
            debugObject('viewport',viewport);
            
            coord = checkCollision(collisions.h,'h',element,coord,dims,viewport,my,at);
            coord = checkCollision(collisions.v,'v',element,coord,dims,viewport,my,at);
        }
        return coord;
    };
    function checkCollision(method,dir,element,coord,dims,viewport,my,at) {
        if (method != 'none') {
            var vcoord = getCoordinates(viewport);
            if (dir == 'h') {
                if (coord.left < vcoord.left) {
                    if (method == 'fit') {
                        coord.left = vcoord.left;
                    } else if (method == 'flip') {
                        if (my.h=='right' && (coord.left+dims.width>=vcoord.left)) {
                            coord.left += dims.width;
                        }
                    } 
                } else if (coord.left + dims.width > vcoord.left + viewport.innerWidth) {
                    if (method == 'fit') {
                        coord.left -= ((coord.left + dims.width) - (vcoord.left + viewport.innerWidth));
                    } else if (method == 'flip') {
                        if (my.h=='left' && (coord.left <= vcoord.left+viewport.innerWidth)) {
                            coord.left -= dims.width;
                        }
                    }
                }
            } else if (dir == 'v') {
                if (coord.top < vcoord.top) {
                    if (method == 'fit') {
                        coord.top = vcoord.top;
                    } else if (method == 'flip') {
                        if (my.v=='bottom' && (coord.top+dims.height>=vcoord.top)) {
                            coord.top += dims.height;
                        }
                    } 
                } else if (coord.top + dims.height > vcoord.top + viewport.innerHeight) {
                    if (method == 'fit') {
                        coord.top -= ((coord.top + dims.height) - (vcoord.top + viewport.innerHeight));
                    } else if (method == 'flip') {
                        if (my.v=='top' && (coord.top <= vcoord.top+viewport.innerHeight)) {
                            coord.top -= dims.height;
                        }
                    }
                }
            }
        }
        return coord;
    };
    function getCoordinates(dims) {
        var coord = {top:dims.offsetTop,left:dims.offsetLeft};
        if (dims.position=='absolute' || dims.position=='fixed') {
            if (dims.top) coord.top = dims.top;
            if (dims.left) coord.left = dims.left;
        }
        return coord;
    };
    function getOffset(option) {
        var off = {
            h:0,
            v:0
        };
        if (option) {
            var opts = option.split(' ');
            if (opts.length > 0) {
                off.h = Number(opts[0]);
            }
            if (opts.length > 1) {
                off.v = Number(opts[1]);
            }
        }
        return off;
    };
    function getDirections(option) {
        var dir = {
            h:'center',
            v:'center'
        };
        if (option) {
            var opts = option.split(' ');
            if (opts.length > 0) {
                dir = getDirection(opts[0],dir);
            }
            if (opts.length > 1) {
                dir = getDirection(opts[1],dir);
            }
        }
        return dir;
    };
    function getDirection(str,d) {
        switch (str) {
            case 'top':
                d.v = 'top';
                break;
            case 'bottom':
                d.v = 'bottom';
                break;
            case 'left':
                d.h = 'left';
                break;
            case 'right':
                d.h = 'right';
                break;
            default:
                break;
        }
        return d;
    };
    function getDims(elem) {
        var offset = $(elem).position();
        return {
            position: $(elem).css('position'),
            top: Number($(elem).css('top').replace(/[^\d\.-]/g,'')),
            left: Number($(elem).css('left').replace(/[^\d\.-]/g,'')),
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: $(elem).outerWidth(),
            height: $(elem).outerHeight(),
            innerWidth: $(elem).innerWidth(),
            innerHeight: $(elem).innerHeight()
        };
    };
    function getHiddenDims(elems) {
        var dims = null, i = 0, offset, elem;

        while ((elem = elems[i++])) {
            var hiddenElems = $(elem).parents().andSelf().filter(':hidden');
            if ( ! hiddenElems.length ) {
                dims = getDims(elem);
            } else {
                debug('hidden');
                var backupStyle = [];
                hiddenElems.each( function() {
                    var style = $(this).attr('style');
                    style = typeof style == 'undefined'? '': style;
                    debug('style',style);
                    backupStyle.push( style );
                    $(this).attr( 'style', style + ' ; display: block !important;' );
                    debug('style',$(this).attr( 'style' ));
                });
                var left = hiddenElems.eq(0).css( 'left' );
                debug('left',left);
                hiddenElems.eq(0).css( 'left', -10000 );
                dims = getDims(elem);
                hiddenElems.eq(0).css( 'top', -10000 ).css('left',left);
                dims.offsetLeft = getDims(elem).offsetLeft;
                dims.left = getDims(elem).left;
                
                hiddenElems.each( function() {
                    $(this).attr( 'style', backupStyle.shift() );
                });
            }
            
        }

        return dims;
    };
    $.fn.hiddenPosition.defaults = {
        my: "center",
        at: "center",
        of: null,
        offset: null,
        using: null,
        collision: "flip",
        viewport: null
    };
    $.fn.hiddenPosition.getHiddenDimensions = function(element) {
        return getHiddenDims(element);
    };
    $.fn.hiddenPosition.toggleDebug = function() {
        DEBUG = !DEBUG;
    };
    function debug(log, jQueryobj) {
        try {
            if (DEBUG && window.console && window.console.log)
                window.console.log(log + ': ' + jQueryobj);
        } catch(ex) {}
    };
    function debugObject(log, jQueryobj) {
        try {
            if (!jQueryobj) jQueryobj=log;
            debug(log, jQueryobj);
            if ( DEBUG && window.console && window.console.log && ($.browser.msie || $.browser.opera) ) {
                window.console.log($.param(jQueryobj));
            } else if (DEBUG && window.console && window.console.debug) {
                window.console.debug(jQueryobj);
            }
        } catch(ex) {}
    };
})(jQuery);
