function randomString(num) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = num;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }

    return randomstring;
}

function getTimeStamp() {
    var d = new Date();
    var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

    return s;
}

function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (var i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}

/* scroll event */
function addScroll(wrapper, targetWidth, windowWidth){
    // Defined element
    var wrapper = jQuery(wrapper);
    var target = wrapper.children('.menu_bar');
    wrapper.css({'overflow': 'hidden', 'position': 'relative'});
    target.css({'position':'relative'});
    // 화면 크기가 스크롤 필요 영역보다 클 경우 이벤트
    if(windowWidth >= targetWidth) {
        if(wrapper.children('.scrollbar_container').length > -1){
            wrapper.off('mousewheel DOMMouseScroll');
            target.css('left', 0);
            wrapper.children('.scrollbar_container').remove();
        }
        return false;
    }
    if(wrapper.find('.scrollbar_container').length == 0){
        wrapper.append('<div class="scrollbar_container"><div class="scrollbar_thumb"></div></div>');
        jQuery('.scrollbar_container').css({'position': 'absolute', 'bottom': 0, 'left': 0, 'width':'100%', 'height':'10px', 'background':'#666', 'background':'rgba(0,0,0,.5)', 'opacity':.5, 'cursor':'pointer'});
        jQuery('.scrollbar_thumb').css({'position':'absolute', 'top':0, 'left':0, 'height':'10px', 'background':'#212121', 'background':'rgba(255,255,255,.8)'}).width(windowWidth / targetWidth * windowWidth);
        jQuery('.scrollbar_container').on({
            mouseenter: function(){
                jQuery(this).css('opacity', .8);
                jQuery('.scrollbar_thumb').on('mousedown', function(e){
                    var mouseOfs = e.offsetX;
                    scrollBodyEvt(target, wrapper, jQuery('.scrollbar_container'), jQuery(this), mouseOfs, wrapper);
                });
            }, mouseleave: function(){
                jQuery(this).css('opacity', .5);
                jQuery('.scrollbar_thumb').off();
            }, click: function(e){
                if(e.target.className.indexOf('scrollbar_container') > -1){
                    var mouseOfs = e.offsetX;
                    if(mouseOfs < jQuery('.scrollbar_thumb').css('left').split('px')[0] * 1){
                        jQuery('.scrollbar_thumb').css('left', mouseOfs);
                        target.css('left', -1 * mouseOfs / jQuery('.scrollbar_container').outerWidth() * target.outerWidth());
                    }else if(mouseOfs > jQuery('.scrollbar_thumb').css('left').split('px')[0] * 1 + jQuery('.scrollbar_thumb').outerWidth()){
                        jQuery('.scrollbar_thumb').css('left', mouseOfs - jQuery('.scrollbar_thumb').outerWidth());
                        target.css('left', -1 * (mouseOfs - jQuery('.scrollbar_thumb').outerWidth()) / jQuery('.scrollbar_container').outerWidth() * target.outerWidth());
                    }
                }
            }
        });
        wrapper.on('mousewheel DOMMouseScroll', function(e){
            e.preventDefault();
            var events = e.originalEvent;
            var tL = jQuery('.scrollbar_thumb').css('left').split('px')[0] * 1;
            var sL = target.css('left').split('px')[0] * 1;
            if(events.wheelDeltaY != 0 && events.wheelDeltaY != -0 && tL - events.wheelDeltaY > 0 && tL - events.wheelDeltaY <= jQuery('.scrollbar_container').outerWidth() - jQuery('.scrollbar_thumb').outerWidth()){
                var getGap = events.wheelDeltaY;
                var getPer = events.wheelDeltaY / jQuery('.scrollbar_container').outerWidth() * target.outerWidth();
                jQuery('.scrollbar_thumb').css('left', tL - getGap);
                target.css('left', sL + getPer);
            }else if(tL - events.wheelDeltaX > 0 && tL - events.wheelDeltaX <= jQuery('.scrollbar_container').outerWidth() - jQuery('.scrollbar_thumb').outerWidth()){
                var getGap = events.wheelDeltaX;
                var getPer = events.wheelDeltaX / jQuery('.scrollbar_container').outerWidth() * target.outerWidth();
                jQuery('.scrollbar_thumb').css('left', tL - getGap);
                target.css('left', sL + getPer);
            }
        });
    }else {
        jQuery('.scrollbar_thumb').width(wrapper.outerWidth() / target.outerWidth() * jQuery('.scrollbar_container').outerWidth());
    }
}

var curOffsetX = 0;
function scrollBodyEvt(target, parent, rail, thumb, current){
    curOffsetX = current;
    var tL = thumb.css('left').split('px')[0] * 1;
    var sL = target.css('left').split('px')[0] * 1;
    jQuery('body').find('[role="button"]').css('pointer-events', 'none');
    jQuery('body').find('button').css('pointer-events', 'none');
    jQuery('.scrollbar_container').css('pointer-events', 'none');
    jQuery('body').css({'cursor': 'pointer', '-webkit-touch-callout':'none', '-webkit-user-select':'none', '-khtml-user-select':'none', '-moz-user-select':'none', '-ms-user-select':'none', 'user-select':'none'});
    jQuery('body').on({
        mousemove: function(e){
            var getGap = e.offsetX - curOffsetX;
            var gapPer = getGap / rail.outerWidth() * target.outerWidth();
            if(thumb.offset().left + getGap <= rail.outerWidth() - thumb.outerWidth() && thumb.offset().left + getGap >= 0){
                tL = tL + getGap;
                sL = sL - gapPer;
                thumb.css('left', tL + getGap);
                target.css('left', sL - gapPer);
                curOffsetX = e.offsetX;
            }else if(thumb.offset().left + getGap < 0){
                thumb.css('left', 0);
                target.css('left', 0);
            }else if(thumb.offset().left + getGap > rail.outerWidth() - thumb.outerWidth()){
                thumb.css('left', rail.outerWidth() - thumb.outerWidth());
                target.css('left', parent.outerWidth() - target.outerWidth());
            }
        }, mouseup: function(){
            jQuery('body').find('[role="button"]').css('pointer-events', '');
            jQuery('body').find('button').css('pointer-events', '');
            jQuery('.scrollbar_container').css('pointer-events', '');
            jQuery('body').css({'cursor': '', '-webkit-touch-callout':'', '-webkit-user-select':'', '-khtml-user-select':'', '-moz-user-select':'', '-ms-user-select':'', 'user-select':''});
            jQuery('body').off();
        }
    });
}
