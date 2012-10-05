(function( $ ) {
	
	var _defaults = {
		ampm: ['am','pm'],
		ampm_point: [0,12],
		hour_start:0,
		hour_end:23,	
		minute_start:0,
		minute_end:60,
		minute_interval:5 
	};	
	
	var methods = {
		init: function(options) {
			return this.each(function(){
				var self = $(this);
				var settings = $.extend({}, _defaults);

	            if (options) {
	            	settings = $.extend(settings, options);
	            }

                self.data('timepicker-settings', settings);
                self.attr('autocomplete', 'off');
                self.click(methods.show).focus(methods.show);//.blur(_formatValue).keydown(_keyhandler);
                self.addClass('ui-timepicker-input');
                
                // close the dropdown when container loses focus
	            $("body").attr("tabindex", -1).focusin(function(e) {
	            	   if ($(e.target).closest('.ui-timepicker-input').length == 0) {
	                        methods.hide();
	                    }
	            });

	        });
	    }, 
	    show: function(e){
	    	var self = $(this);
            var list = self.data('timepicker-list');
            
            // check if list needs to be rendered
            if (!list || list.length == 0) {
                _render(self);
                list = self.data('timepicker-list');
            }
            
            // check if a flag was set to close this picker
            if (self.hasClass('ui-timepicker-hideme')) {
                self.removeClass('ui-timepicker-hideme');
                list.hide();
                return;
            }
            
            if (list.is(':visible')) {
                return;
            }
            
            // make sure other pickers are hidden
            methods.hide();
            
            var topMargin = parseInt(self.css('marginTop').slice(0, -2));
            if (!topMargin) topMargin = 0; // correct for IE returning "auto"
            
            if ((self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(window).height() + $(window).scrollTop()) {
                // position the dropdown on top
                list.css({ 'left':(self.offset().left), 'top': self.offset().top + topMargin - list.outerHeight() });
            } else {
                // put it under the input
                list.css({ 'left':(self.offset().left), 'top': self.offset().top + topMargin + self.outerHeight() });
            }

            list.show();
            
            var settings = self.data('timepicker-settings');
            // position scrolling
            var selected = list.find('.ui-timepicker-selected');

            if (selected && selected.length) {
                var topOffset = list.scrollTop() + selected.position().top - selected.outerHeight();
                list.scrollTop(topOffset);
            } else {
                list.scrollTop(0);
            }

            self.trigger('showTimepicker');
	    }, 
        hide: function(e){

        }
	};
	
	// private methods

    function _render(self){
        var settings = self.data('timepicker-settings');
        var list = self.data('timepicker-list');

        if (list && list.length) {
            list.remove();
            self.data('timepicker-list', false);
        }

        list = $('<ul />');
        list.attr('tabindex', -1);
        list.addClass('ui-timepicker-list');
        list.css({'display':'none', 'position': 'absolute' });
        
        
        for(i=0; i<settings.ampm.length;i++){     
        	var amPmLi = $('<li />');
        	amPmLi.addClass('ui-state-default ui-corner-all');
        	
        	var amPmA = $('<a />');
        	amPmA.text(settings.ampm[i]);
        	amPmA.addClass(settings.ampm[i]);        	
        	amPmLi.append(amPmA);       	
        	
        	var amPmHoursUl = $('<ul />');
        	for(j=settings.ampm_point[i]; j<(settings.ampm_point[i]+12);j++){
        		
        		var amPmHours = '';                 
                if(j<10) amPmHours = '0'+j;
                else  amPmHours = ''+j;
        		
        		var amPmHoursLi = $('<li />');
        		amPmHoursLi.addClass('ui-state-default ui-corner-all');
        		
        		
        		var amPmHoursA = $('<a />');
        		amPmHoursA.text(amPmHours);    
        		amPmHoursA.data('time', amPmHours+':00');
        		amPmHoursLi.append(amPmHoursA);
        		
        		var amPmMinutesUl = $('<ul />');
        		var k=settings.minute_start;
        		while (k<settings.minute_end){
        			var amPmMinutes = '';               
                    if(k<10) amPmMinutes = '0'+k;
                    else  amPmMinutes = ''+k;
                    
                    var amPmMinutesLi = $('<li />');
                    amPmMinutesLi.addClass('ui-state-default ui-corner-all');
                    
                    
                    var amPmMinutesA = $('<a />');
                    amPmMinutesA.text(amPmMinutes);    
                    amPmMinutesA.data('time', amPmHours+':'+amPmMinutes);
                    amPmMinutesLi.append(amPmMinutesA);
                    
                    amPmMinutesUl.append(amPmMinutesLi);
                    k = k+settings.minute_interval;
        		}
        		
        		amPmHoursLi.append(amPmMinutesUl);
        		amPmHoursUl.append(amPmHoursLi);        		
        	}
        	
        	amPmLi.append(amPmHoursUl);  
        	
        	list.append(amPmLi)
        }

        list.data('timepicker-input', self);
        self.data('timepicker-list', list);

        $('body').append(list);

        list.delegate('a', 'click', { 'timepicker': self }, function(e) {
            self.addClass('ui-timepicker-hideme');
            self[0].focus();

            // make sure only the clicked row is selected
            list.find('a').removeClass('ui-timepicker-selected');
            $(this).addClass('ui-timepicker-selected');

            _selectValue(self);
            list.hide();
        });
    };
    
    function _selectValue(self){
        var settings = self.data('timepicker-settings')
        var list = self.data('timepicker-list');
        var timeValue = null;

        var cursor = list.find('.ui-timepicker-selected');
        
        if (cursor.length) {            
            var timeValue = cursor.data('time');// selected value found
        } else if (self.val()) {            
            var timeValue = self.val(); // no selected value; fall back on input value
        }

        if (timeValue !== null) {
            self.attr('value', timeValue);
        }

        self.trigger('change').trigger('changeTime');
    };
	
	$.fn.timepicker = function(method)
    {
        if(methods[method]) { return methods[method].apply(this, Array.prototype.slice.call(arguments, 1)); }
        else if(typeof method === "object" || !method) { return methods.init.apply(this, arguments); }
        else { $.error("Method "+ method + " does not exist on jQuery.timePicker"); }
    };	
	
  
   
})( jQuery );