$(function () { 
    module('layoutside');

    window.Layoutside = new Layoutside();
    var container = Layoutside.Container;
    var $container = $('#container');
    container.currentSection = $('#container');
    container.ui = $('#container');
    
    layout = {
        sections: []
    };
    
    function closeLayout() {
        container.ui.empty();
    }        
    
    test('Container.getSectionWidth', function() { 
        var section = $('<div>').addClass('span-3 section ui-resizable ui-resizable-autohide');
        equal(container.getSectionWidth(section), 3, 'Obter largura da section');
    });
    
    test('Container.addSection', function() { 
        closeLayout();
        var curSection = container.currentSection;

        container.addSection();             
        equal(curSection.find('.section').length, 1, 'New section added');
        
        var savedSection = {
            html_id: 'some-id',
            body: '<h2>Some html markup</h2>',
            width: 5, 
            child_of: null
        };
        
        container.addSection(savedSection);             
        var $novaSection = $container.find('.section:last');

        equal(container.getSectionWidth($novaSection), 5, 'Old width');
        equal($novaSection.attr('id'), savedSection.html_id, 'Old id');
        equal($novaSection.find('.section-content').html(), savedSection.body, 'Old content');
    });

    asyncTest('Abrir layout', function () {
        Layoutside.Menubar.open(null, 'data/layout-1.json');
        setTimeout(function () { 
            equal($container.find('.section').length, 18, 'Adicionar todas as sections');
            start();
        }, 25);
    });
     
});
