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
        currentSection: null,

        init: function () {
            var self = this;
            this.setEditMode('select');
            this.currentSection = this.ui;
            
            this.ui.click(function () { self.setCurrentSection(this); });
        }, 

        setEditMode: function (mode) {
            if(this.editMode == mode)
                return null;

            this.editMode = mode;
            var isSortable = this.ui.hasClass('ui-sortable'); 
            
            parent.Toolbar.ui.find('a.icon-select, a.icon-sort')
                .removeClass('icon-active');

            switch(mode) {
                case 'sort':
                    $('a.icon-sort').addClass('icon-active');

                    if(!isSortable) {
                        this.ui.sortable({  
                            items: '> div[class^=span]',
                            opacity: 0.6 , 
                            grid: [40, 10]
                        });
                    } else 
                        this.ui.sortable('enable');

                    break;
                case 'select':
                default:
                    if(isSortable)
                        this.ui.sortable('disable');
                    $('a.icon-select').addClass('icon-active');
            }
        },
        
        setCurrentSection: function (node) {
            var currentClass = 'current-section', $n = $(node);
            
            this.ui.find('.' + currentClass).removeClass(currentClass);
            if(!$n.hasClass('container'))
                $n.addClass(currentClass);
            this.currentSection = $n; 
        }, 

        addLast: function () {
            var sections = this.ui.find('> .section');
//            lg(sections.length);
        },
        
        addSection: function () {
            var section = $('<div class="span-3 section"></div>'),
                sectionDialog = parent.Dialogs.initSection(section),
                self = this, hoverClass = 'hover-section', 
                lastResize = 0;

            section.click(function (e) {
                e.stopPropagation();  
                self.setCurrentSection(this);
            }).dblclick(function () { 
                sectionDialog.dialog('open');
            });

            section.mouseover(function (e) {  
                e.stopPropagation();
                section.addClass(hoverClass);
            }).mouseout(function (e) {  
                section.removeClass(hoverClass);
            });

            section.resizable({
                grid: [40, 10],
                distance: 40, 
                maxWidth: 950, 
                autoHide: true, 
                containment: 'parent', 
                resize: function (e, ui) { 
                    var i = ui.originalSize.width, f = ui.size.width;
//                    lg(f / 40);
                }, 
                stop: function (e, ui) {    
   //                 lg('stop');
                }
            });

            this.currentSection.append(section);
        },
        
        toggleGrid: function () {
            parent.Container.ui.toggleClass('showgrid');
        }
    };
    
    Layoutside.prototype.Layout = {
        open: function () { 
            lg('open'); 

            for(var i = 0 ; i < 5; i++)
                parent.Container.addSection();  
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
            $('a.icon-toggle-grid').bind('click', function () { c.toggleGrid(); });
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

    var lg = function (f) { 
        if(!console) return false;
        console.log(f);
        console.log("\n");
    };
})();

