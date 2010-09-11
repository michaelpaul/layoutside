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
        init: function () {
            this.ui = $('#edit-container');
        }, 
        reset: function () {
            this.ui.html('');
        }, 
        addSection: function () {
            this.ui.append('<div><p>Helloo</p></div>')
        }    
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
            $('a.icon-section').click(function () {
                parent.Container.addSection();
                return false;    
            });
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
