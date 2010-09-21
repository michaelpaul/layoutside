(function () {
    var config = {
        column_count: 24,
        column_width: 30,
        gutter_width: 10,
        totalColWidth: 40 // column_width + gutter_width
    };   
    
    /* main */
    var Layoutside = function () {
        var self = this;
        lg('loaded...');

        this.Toolbar.init();
        this.Container.init();

        $(document).keydown(function (e) {
            if(e.keyCode == $.ui.keyCode.DELETE) {
                var cs = self.Container.currentSection;
                
                if(!cs.hasClass('container')) {
                    cs.remove();
                    self.Container.currentSection = self.Container.ui;
                }
            }
        });
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
            var isSortable = this.ui.hasClass('ui-sortable'), self = this; 
            
            parent.Toolbar.ui.find('a.icon-select, a.icon-sort')
                .removeClass('icon-active');

            switch(mode) {
                case 'sort':
                    $('a.icon-sort').addClass('icon-active');

                    if(!isSortable) {
                        this.ui.sortable({
                            items: '> div[class^=span]',
                            scroll: false, 
                            opacity: 0.6, 
                            cursor: 'move', 
                            grid: [config.totalColWidth, 10],
                            start: function (e, ui) {   
                                var ch = ui.helper.height();
                                ui.placeholder.height(ch);
                            }, 
                            stop: function () {
                                self.addLast();
                            }
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

        getSectionWidth: function (elm) {
            return parseInt(elm.attr('class').split(' ')[0].split('-')[1]);
        },
 
        addLast: function (context) {
            var gotContext = typeof context !== 'undefined', 
                sections = $('> .section',  gotContext ? context : this.ui), 
                soma = 0, maxWidth = config.column_count, self = this;

            if(gotContext) {
                maxWidth = this.getSectionWidth(context);
                lg(maxWidth);
            }
   
            sections.filter('.last').removeClass('last');

            sections.map(function (i, elm) {
                var curSection = $(elm);

                soma += self.getSectionWidth(curSection);

                if(soma == maxWidth) {
                    curSection.toggleClass('last');
                    soma = 0;
                }
                // tem sub sections
                if(curSection.find('.section').length)
                    self.addLast(curSection);
            });
        },
        
        addSection: function () {
            var section = $('<div class="span-1 section"></div>'),
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
            
            var lastClass = 1;

            section.resizable({
                maxWidth: 950, 
                autoHide: true,
                handles: 'e', 
                grid: [config.totalColWidth, 10],
                containment: 'parent', 
                resize: function (e, ui) { 
                    var elm = ui.helper, nc = Math.round(elm.width() / config.totalColWidth);
                    if(lastClass == nc) 
                        return false;
                    lastClass = nc;
                    var ccls = elm.attr('class');
                    elm.attr('class', ccls.replace(/^span-\d+/, 'span-' + nc));
                    self.addLast();
                }, 

                stop: function () {

                }
            });

            this.currentSection.append(section);
            this.addLast();
        },
        
        toggleGrid: function () {
            parent.Container.ui.toggleClass('showgrid');
        }
    };
    
    Layoutside.prototype.Layout = {
        open: function () { 
            lg('open'); 

            for(var i = 0 ; i < 7; i++)
                parent.Container.addSection();  
            parent.Container.addLast();
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
    };
})();

