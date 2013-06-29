(function($, window, document, undefined) {
    var settings;
    var glob = {
        lastSwipe: 0,
        app: $('#app'),
        views: {
            view1: $('.view1'),
            view2: $('.view2'),
            view3: $('.view3')
        },
        currView: {},
        nextView: {},
        prevView: {},
        currIndex: 0
    };

    var viewStack = [];
    
    var LEFT = '-100%';
    var CENTER = 0;
    var RIGHT = '100%';

    var publicMethods = {
        init: function(options) {
            return this.each(function() {
                /* setting default settings */
                settings = $.extend({
                    duration: 600,
                    startView: ''
                }, options);
                
                privateMethods.start();
            });
        }
    };

    var privateMethods = {
        start: function() {
            glob.prevView = glob.views.view1;
            glob.currView = glob.views.view2;
            glob.nextView = glob.views.view3;
             
            privateMethods.loadView(glob.currView, settings.startView);
            
            $(document).click(function(e) {
                var $elem = $(e.target);
                if (($elem.prop('tagName').toLowerCase() === 'a') && $elem.attr('href')) {
                    var link = $elem.attr('href');
                    if (!privateMethods.isExternal(link)) {
                        e.preventDefault();
                        if(link === 'back'){
                            privateMethods.prevView();
                        }
                        else{
                            privateMethods.nextView(link);
                        }
                    }
                }
            });
        },
        isExternal: function(link) {
            if (link.indexOf('http') !== -1 || link.indexOf('https') !== -1) {
                return true;
            }
            return false;
        },
        loadView:function(view, url){      
            $.ajax({
                url: 'views/'+url,
                dateType: 'html',
                success: function(data) {
                    console.log(data);
                    var $data = $(data);
                    var bodyContent = $data.find('body'); 
                    if(bodyContent.length > 0){
                        $data = bodyContent.children();
                    }
                    view.append($('<div>',{
                        class: 'view-item'
                    }).append($data));
                },
                error: function(jqXHR, errorText, errorThrown){
                    console.error(jqXHR + ' ' + errorText + ' ' + errorThrown);
                }
            });
        },
        saveView: function(view){
            var viewItem = view.children();
            if(viewItem.length > 0){
                viewStack.push(viewItem);
                setTimeout(function(){
                    viewItem.detach();
                }, settings.duration)
                
            }
        },
        removeView: function(view){
            view.children().detach();
        },
        showLoader: function() {
            setTimeout(function() {
                glob.loader.show();
            }, 10);
        },
        hideLoader: function() {
            setTimeout(function() {
                glob.loader.hide();
            }, 10);
        },
        setTransform: function($element, x, y, duration) {
            if (typeof duration === 'undefined') {
                duration = settings.duration;
            }

            privateMethods.setTransitionDuration($element, duration);

            if (typeof x === 'undefined') {
                x = 0;
            } else if (typeof y === 'undefined') {
                y = 0;
            }

            if (Modernizr.csstransforms3d) {
                $element.css("-webkit-transform", "translate3d(" + x + ", " + y + ", " + 0 + "px)");
                $element.css("-moz-transform", "translate3d(" + x + ", " + y + ", " + 0 + "px)");
                $element.css("-ie-transform", "translate3d(" + x + ", " + y + ", " + 0 + "px)");
                $element.css("transform", "translate3d(" + x + ", " + y + ", " + 0 + "px)");
            } else {
                $element.css("-webkit-transform", "translate(" + x + ", " + y + ")");
                $element.css("-moz-transform", "translate(" + x + ", " + y + ")");
                $element.css("-ie-transform", "translate(" + x + ", " + y + ")");
                $element.css("transform", "translate(" + x + ", " + y + ")");
            }
        },
        setTransitionDuration: function($element, duration) {
            if (typeof duration === 'undefined') {
                duration = settings.duration;
            }
            $element.css("-webkit-transition", "-webkit-transform " + (duration / 1000).toFixed(1) + "s");
            $element.css("-moz-transition", "-moz-transform " + (duration / 1000).toFixed(1) + "s");
            $element.css("-ie-transition", "-ie-transform " + (duration / 1000).toFixed(1) + "s");
            $element.css("transition", "transform " + (duration / 1000).toFixed(1) + "s");
        },
        nextView: function(url) {
            /* transfrom views to the new position */
            privateMethods.setTransform(glob.prevView, RIGHT, undefined, 0);
            privateMethods.setTransform(glob.currView, LEFT);
            privateMethods.setTransform(glob.nextView, CENTER);

            /* assign views to the new vars */
            var tempView = glob.prevView;
            glob.prevView = glob.currView;
            glob.currView = glob.nextView;
            glob.nextView = tempView;
            
            
            privateMethods.saveView(glob.prevView);
            //privateMethods.removeView(glob.currView);
            privateMethods.loadView(glob.currView, url);
            
        },
        prevView: function() {
            if(viewStack.length > 0){
                glob.prevView.empty();
                glob.prevView.append(viewStack[viewStack.length-1]);
                viewStack.splice(viewStack.length-1, 1);
            }
            
            /* transfrom views to the new position */
            privateMethods.setTransform(glob.nextView, LEFT, undefined, 0);
            privateMethods.setTransform(glob.currView, RIGHT);
            privateMethods.setTransform(glob.prevView, CENTER);

            /* assign views to the new vars */
            var tempView = glob.prevView;
            glob.prevView = glob.nextView;
            glob.nextView = glob.currView;
            glob.currView = tempView;

                   
        }
    };

    $.fn.transitionManager = function(method) {
        // Method calling logic
        if (publicMethods[method]) {
            return publicMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return publicMethods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.transitionManager');
        }
    };

})(jQuery, window, document);

