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

            this.ui.add('body').click(function () {
                lg('from body');
                self.setCurrentSection(self.ui); 
                self.setMeasures(0, 0);
            });
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
            var curClass = 'current-section', $n = $(node);
            
            this.ui.find('.' + curClass).removeClass(curClass);
            if($n.hasClass('section'))
                $n.addClass(curClass);
            this.currentSection = $n; 
        }, 

        getSectionWidth: function (elm) {
            return parseInt(elm[0].className.split(' ')[0].split('-')[1]);
//            return parseInt(elm.attr('class').split(' ')[0].split('-')[1]);
        },
 
        addLast: function (context) {
            var gotContext = typeof context !== 'undefined', 
                sections = $('> .section',  gotContext ? context : this.ui), 
                soma = 0, maxWidth = config.column_count, self = this;

            if(gotContext) 
                maxWidth = this.getSectionWidth(context);
   
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

        setMeasures: function (w, h) {
            parent.Toolbar.widthInput.val(w);
            parent.Toolbar.heightInput.val(h);
        },

        addSection: function () {
            var section = $('<div class="span-3 section"><div id="content"></div></div>'),
                self = this, sectionDialog = parent.Dialogs.initSection(section),
                hoverClass = 'hover-section', nclicks = 0, lastClass = 1;
            
            section.click(function (e) {
                e.stopPropagation();
                nclicks = nclicks + 1;

                if (nclicks < 2) { 
                    self.setCurrentSection(section.get(0));
                    self.setMeasures(section.width(), section.height());
                    window.setTimeout(function () {
                        nclicks = 0;
                    }, 500);
                } else { // handle dblclick
                    sectionDialog.dialog('open');
                    nclicks = 0;
                }
            }); 

            section.mouseover(function (e) {  
                e.stopPropagation();
                section.addClass(hoverClass);
            }).mouseout(function (e) {  
                section.removeClass(hoverClass);
            });

            section.resizable({
                minHeight: 24,
                maxWidth: 950, 
                autoHide: true,
                zIndex: 100, 
                grid: [config.totalColWidth],
                // containment: 'parent', 

                resize: function (e, ui) { 
                    var elm = ui.helper, w = elm.width(), curClass = '', 
                        nc = Math.round(w / config.totalColWidth);

                    parent.Toolbar.heightInput.val(ui.size.height);

                    if(lastClass == nc) 
                        return false;

                    lastClass = nc;
                    curClass = elm[0].className;
//                    curClass = elm.attr('class');
//                    elm.attr('class', curClass.replace(/^span-\d+/, 'span-' + nc));
                    elm[0].className = curClass.replace(/^span-\d+/, 'span-' + nc);
                    self.addLast();
                    parent.Toolbar.widthInput.val(w);
                }
            });

            this.currentSection.append(section);
            this.addLast();
        },
        
        toggleGrid: function () {
            // parent.Container.ui.toggleClass('showgrid');
            $('#containerGrid').toggleClass('togglegrid');
        }
    };
    
    Layoutside.prototype.Layout = {
        open: function () { 
            lg('open layout'); 

            for(var i = 0 ; i < 7; i++)
                parent.Container.addSection();  
//            parent.Container.toggleGrid();
            parent.Container.addLast();
            this.buildGrid();
        },

        save: function () {lg('saving');},        
        saveAs: function () {lg('save as');},        
        getCode: function () {lg('give me the code');},
        download: function () {},
        buildGrid: function () {
            var ui = $('#containerGrid'), i = 0;
            var clm = {};
            
            for(; i < config.column_count; i++){
                clm = $('<div>&nbsp;</div>');
                clm.css({width: config.column_width , 
                    marginRight: config.gutter_width
                })
                ui.append(clm);
            }
                
            ui.find('div:last').css('marginRight', 0);
        }
        
    };
    
    Layoutside.prototype.Toolbar = {
        ui: $('#toolbar'),
        widthInput: $('#section-w').val(0), 
        heightInput: $('#section-h').val(0), 

        init: function () {
            var c = parent.Container, self = this;
            // evitar acao padrão de link e propagacao para o body 
            $('a.icon').click(function (e) { e.stopPropagation(); e.preventDefault(); } );

            $('a.icon-select').bind('click', function () { c.setEditMode('select'); });
            $('a.icon-sort').bind('click', function () { c.setEditMode('sort'); });

            $('a.icon-section').bind('click', function () { c.addSection(); });
            $('a.icon-toggle-grid').bind('click', function () { c.toggleGrid(); });

            this.heightInput.keyup(function () {
                var h = self.heightInput.val(), s = parent.Container.currentSection;
                
                if(/^\d+$/.test(h) && !s.hasClass('container')) {
                    h = parseInt(h);
                    if(h < 24) // min-height
                        return false;
                    s.height(h);
                }
            });
        }
    };
    
    Layoutside.prototype.Dialogs = {
        sectionUi: $(".sectionDialog"), 
        
        initSection: function (section) {
            var nd = this.sectionUi.clone();

            nd.dialog({
                resizable: false, autoOpen: false, width: 300, height: 225, 
                open: function () {
                    lg('section dialog open');
                }
		    });

            $('.space-slider', nd).slider( {
	            min: 1, max: config.column_count,
                start: function () { }
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

