jQuery(document).ready(function(){
    function addScroll(wrapper){
        // Defined element
        var wrapper = jQuery(wrapper);
        var target = wrapper.children('.menu_bar');
        wrapper.css({'overflow': 'hidden', 'position': 'relative'});
        target.css({});
        if(wrapper.outerWidth() >= target.outerWidth()) {
            wrapper.children('.scrollbar_container').remove();
            return false;
        }
        if(wrapper.find('.scrollbar_container').length == 0){
            wrapper.append('<div class="scrollbar_container"><div class="scrollbar_thumb"></div></div>');
            jQuery('.scrollbar_container').css({'position': 'absolute', 'bottom': 0, 'left': 0, 'width':'100%', 'height':'10px', 'background':'#666', 'background':'rgba(0,0,0,.3)', 'opacity':.5, 'cursor':'pointer'});
            jQuery('.scrollbar_thumb').css({'position':'absolute', 'top':0, 'left':0, 'height':'10px', 'background':'#212121', 'background':'rgba(0,0,0,.8)'}).width(wrapper.outerWidth() / target.outerWidth() * jQuery('.scrollbar_container').outerWidth());
            jQuery('.scrollbar_container').on({
                mouseenter: function(){
                    jQuery(this).css('opacity', .8);
                    jQuery('.scrollbar_thumb').on('mousedown', function(e){
                        var mouseOfs = e;
                        console.log(e);
                        scrollBodyEvt(target, wrapper, this);
                    });
                }, mouseleave: function(){
                    jQuery(this).css('opacity', .5);
                }, click: function(e){
                    console.log(e);
                }
            });
        }else {
            jQuery('.scrollbar_thumb').width(wrapper.outerWidth() / target.outerWidth() * jQuery('.scrollbar_container').outerWidth());
        }
    }

    function scrollBodyEvt(target, parent, thumb, current){
        jQuery('body').on({
            mousemove: function(e){
                console.log(e);
            }, mouseup: function(){
                jQuery('body').off(mousemove, mouseup);
                jQuery(thumb).off();
            }
        });
    }
});
