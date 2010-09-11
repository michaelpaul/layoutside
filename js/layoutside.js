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
        current: {},
        nodes: [], 
        init: function () {
            this.ui = $('.canvas');
            this.addContainer();
            this.current = this.ui.children();
            this.nodes.push(this.current);
        }, 
        reset: function () {
            this.ui.html('');            
            this.nodes = [];
            this.init();
        }, 
        
        addSection: function () {
            var s = $('<div class="span-4" style="background-color: red;"><p>Helloo</p></div>');
            this.current.append(s);
        },
       
        addHorizontalRule: function () {
            var hr = $('<hr>');
            this.current.append(hr);
        },    
        
        addClear: function () {},    
        addContainer: function () {
            var self = this, container = $('<div class="container">');
            container.click(function () { self.current = $(this); });
            this.ui.append(container);
        },    
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
        init: function () {
            var c = parent.Container;
            
            $('a.icon').click(function (e) { e.preventDefault(); } );
            $('a.icon-section').bind('click', function () { c.addSection(); });
            $('a.icon-hr').bind('click', function () { c.addHorizontalRule(); });
            $('a.icon-container').bind('click', function () { c.addContainer(); });
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
