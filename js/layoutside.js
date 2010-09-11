var lg = function (m) { console.log(m) };

(function () {
    var grides = [40, 10];

    var Layoutside = function () {
        lg('loaded...');
    }; 
    
    Layoutside.prototype = {
        open: function () {lg('open ');},
        save: function () {lg('saving');},        
        saveAs: function () {lg('save as');},        
        getCode: function () {lg('give me the code');}        
    };
    
    Layoutside.prototype.Layout = {
        init: function () {lg('iniciar layout'); }
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
