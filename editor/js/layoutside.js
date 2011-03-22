(function ($) {
    var config = {
        key: '',
        layout_name: null, 
        status: null, 
        column_count: 24,
        column_width: 30,
        gutter_width: 10,
        totalColWidth: 40 // column_width + gutter_width
    };   
    
    // layout status..
    var ST_NEW = 1,
        ST_SAVED = 2,
        ST_MODIFIED = 4;
    
    /* main */
    var Layoutside = function () {
        var self = this;

        this.Menubar.init();
        this.Toolbar.init();
        this.Container.init();
        this.Editor.init();

        $(document).keydown(function (e) {
            if(e.keyCode == $.ui.keyCode.ESCAPE) {
                var cs = self.Container.currentSection;
                // não remover container quando selecionado
                if(cs[0] != self.Container.ui[0]) {
                    cs.remove();
                    self.Container.currentSection = self.Container.ui;
                    self.Container.addLast();
                }
            }
        });
    }, parent = Layoutside.prototype;

    Layoutside.prototype.Layout = {
        setPageTitle: function (newTitle) {
            var title = 'Untitled';
            
            if(typeof newTitle !== 'undefined' && $.trim(newTitle) != '')
                title = newTitle;
            
            document.title = title  + ' - Layoutside';
        }
    };

    Layoutside.prototype.Container = {
        editMode: '', 
        ui: $('#container'),
        grid: $('#containerGrid'), 
        currentSection: null,
        isResizingSection: false, 
        sections: [],
        
        init: function () {
            var self = this;
            this.setEditMode('select');
            this.currentSection = this.ui;

            this.ui.add(this.grid).click(function (e) {
                self.setCurrentSection(self.ui); 
                self.setMeasures();
            });
        }, 
        
        sortableOptions: {
            items: '> div[class^=span]',
            scroll: false, 
            opacity: 0.6, 
            cursor: 'move', 
            grid: [config.totalColWidth, 10],
            start: function (e, ui) {   
                var ch = ui.helper.height();
                ui.placeholder.css('height', ch + 'px !important');
            }, 
            stop: function () {
                parent.Container.addLast();
            },
            change: function () {   
                parent.Container.addLast();
            },
            sort: function (e, ui) {
                var y = e.pageY;
                // child section
                if(ui.placeholder.parent()[0] != parent.Container.ui[0])
                    y = e.pageY - ui.placeholder.parent().position().top;
                    
                ui.helper.css({
                    top: y + 'px'
                });
            }
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
                        this.ui.sortable(this.sortableOptions).disableSelection();
                        this.sortableOptions.containment = 'parent';
                        this.sections = $('div[class^=span]').sortable(this.sortableOptions)
                            .disableSelection();
                    } else {
                        this.ui.sortable('enable');
                        this.sections.sortable('enable');
                    }

                    break;
                case 'select':
                default:
                    if(isSortable) {
                        this.ui.sortable('disable');
                        this.sections.sortable('disable');
                    }
                    
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
            return parseInt(elm[0].className.split(' ')[0].split('-')[1], 10);
        },
 
        addLast: function (context) { 
            var hasContext = typeof context !== 'undefined', 
                sections = $('> .section:not(.ui-sortable-helper)',  hasContext ? context : this.ui), 
                sum = 0, columnCount = config.column_count, i, f;
            
            if(hasContext) 
                columnCount = this.getSectionWidth(context);

            sections.filter('.last').removeClass('last');
            sections.filter('.clear').removeClass('clear');
            
            for(i = 0, f = sections.length; i < f; i = i + 1) {
                var curSection = $(sections[i]), 
                    prevColumnCount = this.getSectionWidth(curSection),
                    nextSection = null;

                if(i < f)
                    nextSection = $(sections[i + 1]);
                sum += prevColumnCount;
                
                if(sum > columnCount) {
                    curSection.toggleClass('clear');
                    sum = prevColumnCount;
                } else if(sum == columnCount) {
                    curSection.toggleClass('last');
                  
                    if(nextSection.length)
                        nextSection.toggleClass('clear');
                    sum = 0;
                } 
                
                // tem sub sections?
                if(curSection.find('.section').length)
                    this.addLast(curSection);
            }
        },

        setMeasures: function (w, h) {
            var container = parent.Container; 
            w = w ? w : container.ui.width();
            h = h ? h : container.ui.height();
            parent.Toolbar.widthInput.val(w);
            parent.Toolbar.heightInput.val(h);
        },
        
        currentSectionId: 1,
        
        addSection: function (edit_section) {
            var section, id = 'section-' + this.currentSectionId, 
                content = '', sec_width = 3;

            this.currentSectionId += 1;
            
            if(typeof edit_section !== 'undefined') {
                id = edit_section.html_id;
                content = edit_section.body;
                sec_width = edit_section.width;
            } 
            
            section = $('<div id="' + id + '" class="span-' + 
                sec_width + ' section"><div class="section-content"></div></div>');
            section.find('.section-content').html(content);
            
            var self = this, hoverClass = 'hover-section', 
                nclicks = 0, lastClass = 1; 
                // sectionDialog = parent.Dialogs.initSection(section);
            
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
                    // sectionDialog.dialog('open');
                    nclicks = 0;
                }
            }); 

            section.mouseover(function (e) {  
                if(self.isResizingSection)
                    return false;
                    
                e.stopPropagation();
                section.addClass(hoverClass);
            }).mouseout(function (e) {  
                section.removeClass(hoverClass);
            });

            var lastResizedParent = null;
            
            section.resizable({
               // minHeight: 24,
                maxWidth: 950, 
                autoHide: true,
                zIndex: 100, 
                grid: [config.totalColWidth],
                handles: 'e', 
                // containment: 'parent', 
                
                start: function (e, ui) { },
                stop: function () { }, 
                
                resize: function (e, ui) { 
                    var elm = ui.helper, sectionWidth = elm.width(), curClass = '', 
                        nc = Math.round(sectionWidth / config.totalColWidth);

                    parent.Toolbar.heightInput.val(ui.size.height);

                    if(lastClass == nc) 
                        return false;

                    var childs = elm.find('> .section');

                    // preservar largura min/max quando ouver 'filhos'                    
                    if(childs.length) {
                        var largSection = self.getSectionWidth(elm), largMaiorFilho = 0;
                        
                        childs.each(function (k, v) {
                            var $c = $(v), cw = self.getSectionWidth($c);

                            lgm('max child w', sectionWidth);
                            $c.resizable("option", "maxWidth", sectionWidth);   
                                
                            if(cw > largMaiorFilho)
                                largMaiorFilho = cw;
                        });                 

                        section.resizable("option", "minWidth", 
                            largMaiorFilho * config.totalColWidth);
                    }
                    
                    lastClass = nc;
                    curClass = elm[0].className;
                    elm[0].className = curClass.replace(/^span-\d+/, 'span-' + nc);
                    self.addLast();
                    parent.Toolbar.widthInput.val(sectionWidth);
                }
            });
            
            if(edit_section && edit_section.child_of !== null) {
                if(!$('#' + edit_section.child_of).length) 
                    throw new Error('Failed to add child section');
                $('#' + edit_section.child_of).append(section);
            } else 
                this.currentSection.append(section);
            
            var sectionParent = section.parent();
            // definir largura maxima da section quando filha
            if(sectionParent[0] != self.ui[0]) {
                section.resizable("option", "maxWidth", 
                    self.getSectionWidth(sectionParent) * config.totalColWidth);         
            }
            
            // if(!edit_section)
               // config.status |= ST_MODIFIED;
                
            this.addLast();  
        }
    };
    
    Layoutside.prototype.Toolbar = {
        ui: $('#toolbar'),
        widthInput: $('#section-w').val(0), 
        heightInput: $('#section-h').val(0), 
        viewMode: 0,
        
        init: function () {
            var c = parent.Container, self = this;

            $('a.icon').click(function (e) { e.preventDefault(); } );

            $('a.icon-select').bind('click', function () { c.setEditMode('select'); });
            $('a.icon-sort').bind('click', function () { c.setEditMode('sort'); });
            $('a.icon-section').bind('click', function () { c.addSection(); });
            $('a.icon-toggle-grid').click(function () { 
                switch(self.viewMode) {
                    case 0:
                        $('.section').addClass('toggle-section');
                        break;
                    case 1:
                        $('#containerGrid').addClass('toggle-grid');
                        break;
                    case 2:
                        $('.section').removeClass('toggle-section');
                        $('#containerGrid').removeClass('toggle-grid');
                        break;
                }
                self.viewMode = (self.viewMode + 1) % 3;
            });

            this.heightInput.keyup(function () {
                var h = self.heightInput.val(), s = parent.Container.currentSection;

                if(!isNaN(h) && !s.hasClass('container')) {
                    h = parseInt(h, 10);
                    if(h < 24) // min-height
                        return false;
                    s.height(h);
                }
            });
        }
    };

    Layoutside.prototype.Menubar = {
        loadingLayout: false,
        newLayoutDialog: null, 
        confirmCloseDialog: null, 
        
        init: function () { 
            var self = this;
            this.buildGrid();

            $('#menu a').bind('click', function (e) { e.preventDefault(); });
            
            $('#new-layout').click(function (e) {
                if(!self.closeLayout()) 
                    return false;
                self.newLayoutDialog.dialog('open');
            });
            
            $('#save-layout').click(function () {
                self.saveLayout();
            });
                            
            $('#open-layout').click(function () {
                $('#my-layouts').dialog('open');
            });
            // new btn
            var createLayout = function () {
                config.key = '';
                config.status = ST_NEW;
                config.layout_name = $('#layout-name').val().trim();
                parent.Layout.setPageTitle(config.layout_name);
                self.newLayoutDialog.dialog('close');
                $(this).find('form')[0].reset();
            }; 
            
            this.newLayoutDialog = $('#new-layout-dialog').dialog({
                resizable: false, autoOpen: false, width: 300,  
                
                buttons: {
                    'Create': createLayout,
                    'Cancel': function () {
                        self.newLayoutDialog.dialog('close');
                        $(this).find('form')[0].reset();
                    }
                }
            }).find('form').submit(function (e) {
                e.preventDefault();
                createLayout.call($(this).parent()[0]);
            }).end();
            //  new btn /
            
            this.confirmCloseDialog = $('#confirm-close-dialog').dialog({
                resizable: false, autoOpen: false, width: 300,  
                
                buttons: {
                    'Close without saving': function () {
                         self.closeLayout(true);                       
                         self.confirmCloseDialog.dialog('close');
                    },
                    'Cancel': function () {
                        self.confirmCloseDialog.dialog('close');
                    }
                }
            });
                     
            $('#my-layouts').dialog({
                resizable: false, autoOpen: false, width: 300, height: 150, 
                open: function () {
                     $.getJSON('/editor/layouts', { }, function(result, status) {
                        if(status != 'success')
                            throw new Error('Failed to load your layouts');
                            
                        $list = $('#my-layouts table tbody').empty();
                        
                        $(result).each(function (k, v) { 
                            $list.append('<tr><td>' + v.name + '</td><td>' + 
                            '<a class="open" lkey="' + v.key + '" href="#' + v.key + '">edit</a> ' + 
                            '<a target="_blank" href="/editor/render-layout?key=' + v.key + '">view</a> ' + 
                            '<a class="delete" href="#' + v.key + '">delete</a>' + 
                            '</td></tr>');                        
                        });
                        
                        $('#my-layouts table a.open').click(function (e) {
                            e.preventDefault();
                            parent.Menubar.open(this.getAttribute('lkey'));
                        });
                        
                        $('#my-layouts table a.delete').click(function (e) {
                            e.preventDefault();
                            var c = window.confirm("Do you really want to delete the selected layout?");
                            if(c) {
                                alert('NotImplemented')                        
                            }
                        });
                        
                    });
                }
	        });
        },
        
        open: function (key) {
            if(this.loadingLayout || !this.closeLayout()) 
                return false;
            
            lg('open layout: ' + key); 
            this.loadingLayout = true;
            
            $.getJSON('/editor/open-layout', { 'key': key }, function (result) {
                parent.Toolbar.viewMode = 0;
                $('#containerGrid').removeClass('toggle-grid');

                config = result.config;
                parent.Layout.setPageTitle(config.layout_name);
                config.status = ST_SAVED;
                parent.Container.currentSection = parent.Container.ui;
                parent.Container.currentSectionId = 1;
                                    
                for(var i = 0, l = result.sections.length; i < l; i++)
                    parent.Container.addSection(result.sections[i]);  
                 
                parent.Menubar.loadingLayout = false;
                $('#my-layouts').dialog('close');
                $(window).scrollTop(0);
            });
            
            this.buildGrid();
            parent.Container.setMeasures();
        },
        
        closeLayout: function (confirm) {
            if(config.status & ST_MODIFIED) {
                if(typeof confirm == 'undefined') {
                    this.confirmCloseDialog.dialog('open');
                    return false;
                }
            }

            parent.Layout.setPageTitle();
            parent.Container.ui.empty();
            parent.Container.currentSectionId = 1;
            config.status = ST_NEW;
            
            return true;
        },
        
        buildGrid: function () {
            var ui = $('#containerGrid').empty(), i = 0;
            var clm = {};
            
            for(; i < config.column_count; i++) {
                clm = $(document.createElement('div'));
                clm.css({ width: config.column_width , 
                    marginRight: config.gutter_width
                })
                ui.append(clm);
            }
                
            ui.find('div:last').css('marginRight', 0);
        }, 
        saveLayout: function () {
            var layout = {
                'config': config,
                'sections': []
            };

            function pushChildSectionsOf(context) {
                $('> .section', context).each(function (k, v) {
                    var $elm = $(v), childs = $elm.children('.section');    
                    
                    var section = {
                        'name': 'section name ' + k,
                        'tagname': v.tagName, 
                        'body': $elm.find('.section-content').html(),
                        'html_id': v.id,
                        'css_class': v.className,
                        'width': parent.Container.getSectionWidth($elm),
                        'child_of': (typeof context == 'object' ? context.id : null),
                        'order': k + 1
                    };
                    
                    layout.sections.push(section);
                    
                    if(childs.length) 
                        pushChildSectionsOf(v);
                });    
            }
            
            pushChildSectionsOf('#container');

            $.ajax({ 
                type: "POST",
                url: '/editor/save-layout',
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify(layout),
                error: function (xhr, textStatus) { 
                    console.log('XhrError: ' + textStatus); 
                }, 
                success: function(result) {
                    if(result.status == 0) {
                        if(config.status & ST_NEW)
                            alert('New layout saved!');
                        if(config.status & ST_SAVED)
                            alert('Layout updated!');
                            
                        config.status = ST_SAVED;
                        config.key = result.key;
                    } else
                        alert('Failed to save layout');
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
    
    Layoutside.prototype.Editor = {
        editor: null,
        dialogUi: null, 
        
        init: function () {
            this.setupDialog();

            $('#openEditor').click(function (e) {
                $('#editor').dialog('open');
                e.preventDefault();
            });
        },
        
        startEditor: function () {
            if(this.editor === null)
                this.editor = $('#sourceEditor');
        },
        
        setupDialog: function () {
            var target = null, self = this;
            this.dialogUi = $('#editor');
            
            this.dialogUi.dialog({
                resizable: true, autoOpen: false, 
                minWidth: 725, width: 725, minHeight: 350, height: 350,
                
                buttons: {
                    'Update': function () {
                        if(target == null)
                            return false;
                        var c = self.editor.val(); // getCode
                        target.find('> .section-content').html(c);        
                    },
                    'Close': function () {
                        self.dialogUi.dialog('close');
                    }
                }, 
                
                open: function () {
                    self.startEditor();
                    $('#sectionview').empty();

                    function buildSectionTree(ctx, list) {
                        var o = null, sections = ctx.find('> .section');
                        
                        if(!sections.length)
                            return false;
                        
                        if(!list) {
                            list = document.createElement('ul');
                            $('#sectionview').append(list);
                        }
                        
                        sections.each(function (i, s) {
                            var $item = $(document.createElement('li')),
                                $section = $(s);
                            
                            $item.html('<a href="#">Section ' + (i + 1) + '</a>');
                            $item.find('a').data('sectionRef', s).click(function (e) {
                                target = $($(this).data('sectionRef'));
                                var $content = target.find('.section-content');
                                e.preventDefault();
                                $('#sectionview li a').removeClass('selected-section');
                                $item.children('a').addClass('selected-section');
                                self.editor.val($content.html()); // setCode
                            });
                                                        
                            $(list).append($item);
                            
                            if($section.find('> .section').length) {
                                var sublist = document.createElement('ul');
                                $item.append(sublist);
                                buildSectionTree($section, sublist);
                            }
                        });
                    }
                    
                    buildSectionTree(parent.Container.ui, null);
                    target = $($('#sectionview li a:first').data('sectionRef'));
                    self.editor.html(target.find('.section-content').html()); // setCode           
                }
            }); 
        }
    };
    
    window.Layoutside = Layoutside;

    var lg = function (f) { 
        if(!console) return false;
        console.log(f);
    }, lgm = function (m, v) {
        lg(m + ': ' + v);
    };
    
})(jQuery);

