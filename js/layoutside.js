var lg = function (m) { console.log(m) };

(function () {
    var config = {
        column_count: 24,
        column_width: 30,
        gutter_width: 10
    };   

    /* main */
    var Layoutside = function () {
        lg('loaded...');

        this.Toolbar.init();
        this.Container.init();
    };
    
    Layoutside.prototype = {
        setOption: function (n, v) {
            config[n] = v;
        },
        getOption: function (n) {
            return config[n];
        }
    }, parent = Layoutside.prototype;

    Layoutside.prototype.Container = {
        editMode: '', 
        ui: $('#container'),

        init: function () {
            this.setEditMode('select');
        }, 

        reset: function () {
            this.ui.html('');            
        }, 

        setEditMode: function (mode) {
            if(this.editMode == mode)
                return null;

            this.editMode = mode;
            parent.Toolbar.ui.find('a.icon-select, a.icon-sort')
                .removeClass('icon-active');

            switch(mode) {
                case 'sort':
                    lg('init sortable');
                    $('a.icon-sort').addClass('icon-active');

                    if(!this.ui.hasClass('ui-sortable')) { 
                        this.ui.sortable({  
                            // tolerance: 'pointer', 
                            // containment: 'parent', 
                            items: 'div[class^=span]',
                            opacity: 0.6 , 
                            grid: [40, 10],  
                        });
                        this.ui.disableSelection();
                    } else 
                        this.ui.sortable('enable');

                    break;
                case 'select':
                default:
                    lg('init selectable');
                    this.ui.sortable('disable');
                    $('a.icon-select').addClass('icon-active');
            }
        },
        addSection: function () {
            var section = $('<div class="span-4 section"><p>Hello World</p></div>'),
                sectionDialog = parent.Dialogs.initSection(section);
            
            section.dblclick(function () { 
                sectionDialog.dialog('open');
            });
            
            this.ui.append(section);
        },
       
        addHorizontalRule: function () {
            var hr = $('<hr>');
            this.ui.append(hr);
        },    
        /* deprecated         
        addClear: function () {
            var dv = $('<div class="clear"></div>');
            this.ui.append(dv);        
        },    

        addContainer: function () {
            var self = this, container = $('<div class="container">');
            container.click(function () { self.current = $(this); });
            this.ui.append(container);
        },    
        */
        toogleGrid: function () {}
    };
    
    Layoutside.prototype.Layout = {
        open: function () { 
            lg('open'); 
            
            parent.Container.reset();
        },
        save: function () {lg('saving');},        
        saveAs: function () {lg('save as');},        
        getCode: function () {lg('give me the code');},
        download: function () {}
    };
    
    Layoutside.prototype.Toolbar = {
        ui: $('#toolbar'),
        init: function () {
            var c = parent.Container;
            $('a.icon').click(function (e) { e.preventDefault(); } );

            $('a.icon-select').bind('click', function () { c.setEditMode('select'); });
            $('a.icon-sort').bind('click', function () { c.setEditMode('sort'); });

            $('a.icon-section').bind('click', function () { c.addSection(); });
            $('a.icon-hr').bind('click', function () { c.addHorizontalRule(); });
            // $('a.icon-clear').bind('click', function () { c.addClear(); });
            // $('a.icon-container').bind('click', function () { c.addContainer(); });
        }
    };
    
    Layoutside.prototype.Dialogs = {
        sectionUi: $("#sectionDialog"), 
        
        initSection: function (section) {
            var nd = this.sectionUi.clone();
            nd.dialog({
                autoOpen: false, width: 300, height: 200, 
                open: function () {
                    lg('section dialog open called from ');
                    lg(section);
                },
		        buttons: {
			        "Update": function() { 
			            alert('Update something...');
				        $(this).dialog("close"); 
			        }, 
			        "Cancel": function() { 
				        $(this).dialog("close"); 
			        } 
		        }
		    });
		    return nd;
        }
    };
    
    window.Layoutside = Layoutside;
})();

/*
grids = [40, 10];
sortOptions = { items: 'div[class^=span]', 
    // tolerance: 'pointer', 
    // containment: 'parent', 
    opacity: 0.6 , 
    grid: grids,  
};

$(function() {
    $('#toolbar ul li a').click(function () { 
                var self = $(this);
                self.parents('ul').find('a').removeClass('icon-active');
                $(this).toggleClass('icon-active');
                return false;
            });
            
    $('#nested ').sortable({items: 'div[class^=span]', tolerance: 'pointer'});
	$(".container").sortable(sortOptions);
	$(".container").disableSelection();

    $("div[class^=span]").resizable({
        grid: grids, 
        maxWidth: 950, 
        autoHide: true, 
        stop: function (e, ui) {
            var f = ui.size.width, i = ui.originalSize.width, elm = ui.element;
            var di = Math.round((f - i) / (40));
            var curClass = elm.attr('class');
            elm.attr('class', curClass.replace(/span-(\d+)/, function (m, l) {
                return 'span-' + (parseInt(l)  + di);
            }));
            addLast();
        } 
    });
});

*/
