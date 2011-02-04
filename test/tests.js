$(function () { 
    module('layoutside');

    window.Layoutside = new Layoutside();
    var container = Layoutside.Container;
    var $container = $('#container');
    container.currentSection = $('#container');
    container.ui = $('#container');
    
    layout = {
        config: {},
        sections: []
    };
    
    function closeLayout() {
        container.ui.empty();
    }        

    function openLayout(file, callback) {
        $.ajax({
            url: 'data/' + file,
            dataType: 'json',
            async: false, 
            success: function (result) {
                for(var i = 0, l = result.sections.length; i < l; i++)
                    container.addSection(result.sections[i]);
                callback(result);
            }   
        });
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

        equal(container.getSectionWidth($novaSection), 5, 'Set width');
        equal($novaSection.attr('id'), savedSection.html_id, 'Set id');
        equal($novaSection.find('.section-content').html(), savedSection.body, 'Set content');
    });

    test('Abrir layout', function () {
        closeLayout();
        openLayout('layout-1.json', function () {
            equal($container.find('.section').length, 18, 'Adicionar todas as sections');
            
        });
    });
     
});
