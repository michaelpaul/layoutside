# coding=UTF-8

import logging, os, sys, cgi, datetime, re
import zipfile
import StringIO

from google.appengine.api import users
from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson
from datastore.models import *

current_user = None

# limite de sections deletadas ao salvar um novo layout
LIMIT_DELETE_SECTIONS = 50

class BaseRequestHandler(webapp.RequestHandler):
    def write(self, msg):
        self.response.out.write(msg)
    def render(self, path, template_values = {}):
        self.response.out.write(template.render(path, template_values))
        
class Editor(BaseRequestHandler):
    PATH = '/editor/'
    
    def get(self):
        self.render('index.html', {'user_name':current_user.nickname(),
            'logout': users.create_logout_url("/")})

class ListLayouts(BaseRequestHandler):
    def get(self):
        layouts = Layout.gql('WHERE owner = :1', current_user.user_id()) 
        result = []
        
        for l in layouts:
            name = 'Untitled'
            if l.name:
                name = l.name
            result.append({'key': str(l.key()), 'name': unicode(name)})
            
        self.write(simplejson.dumps(result))

class DeleteLayout(BaseRequestHandler):
    def post(self):
        result = {'status': 0}

        layout = Layout.get(self.request.get('key'))

        if(layout.owner != current_user.user_id()):
            logging.error('Usuario (' + current_user.user_id() + 
                ') tentou excluir o layout (' + self.request.get('key') + 
                ') sem permissao')
            result.status = 1
        
        else: 
            sections = Section.gql('WHERE layout = :1', layout)
            db.delete(sections)
            layout.delete()
            logging.info('Layout removido')
        
        result_str = simplejson.dumps(result)
        self.write(result_str)

class OpenLayout(BaseRequestHandler):
    def get(self):
        layout = Layout.get(self.request.get('key'))
        self.response.headers['Content-type'] = 'application/json'
                
        if(layout is None):
            self.write('Layout não encontrado.')
        else:
            config = {
                'key': str(layout.key()), 
                'layout_name' : layout.name, 
                'column_count': layout.column_count,
                'column_width': layout.column_width,
                'gutter_width': layout.gutter_width,
                'totalColWidth': layout.column_width + layout.gutter_width
            }
            
            result = {
                'config': config,
                'sections': []
            }
            # priorizar parentesco sobre ordem, permite reconstrução linear no DOM 
            sections = Section.gql('WHERE layout = :1 ORDER BY child_of, order', layout) 
            
            for s in sections:
                section = {
                    'name': s.name,
                    'tagname': s.tagname, 
                    'body': s.body,
                    'html_id': s.html_id,
                    'css_class': s.css_class,
                    'width': s.width,
                    'child_of': s.child_of,
                    'order': s.order
                }
                
                result['sections'].append(section)
                
            result_str = simplejson.dumps(result)
            self.write(result_str)

class RenderLayout(BaseRequestHandler):
    output = ''  

    def get(self):
        builder = LayoutBuilder()
        tpl = builder.build(self.request.get('key'), '/editor/')
        self.write(tpl)

class SaveLayout(BaseRequestHandler):
    def post(self):
        layout = simplejson.loads(self.request.body)
        config = layout['config']
        
        self.response.headers['Content-type'] = 'application/json'
        
        try:
            if config['key'] != '':
                l = Layout.get(config['key'])
                l.name = config['layout_name']
                l.column_count = config['column_count']
                l.column_width = config['column_width']
                l.gutter_width = config['gutter_width']
            else:
                l = Layout(owner = current_user.user_id(),
                    name = config['layout_name'], 
                    column_count = config['column_count'],
                    column_width = config['column_width'],
                    gutter_width = config['gutter_width'])
        
            l.put()
        except db.BadValueError:
            result_str = simplejson.dumps({'status': 1})
            self.write(result_str)
            return
        
        gql = 'WHERE layout = :1 LIMIT ' + str(LIMIT_DELETE_SECTIONS)
        sections_atuais = Section.gql(gql, l)
        db.delete(sections_atuais)
        
        # criar novas.. 
        new_sections = []
        for s in layout['sections']:
            section = Section(layout = l,
                name = s['name'],
                tagname = s['tagname'].lower(),
                body = s['body'],
                html_id = s['html_id'],
                css_class = s['css_class'],
                width = s['width'],
                order = s['order'],
                child_of = s['child_of'])
            new_sections.append(section)
            # section.put()
        db.put(new_sections)
        result_str = simplejson.dumps({'status': 0, 'key': str(l.key()) })
        self.write(result_str)

class DownloadLayout(BaseRequestHandler):
    def get(self):
        # http://localhost:8080/editor/download-layout
        builder = LayoutBuilder()
        key = self.request.get('key')
        tpl = builder.build(key)

        if tpl == False:
            logging.error('Falha ao construir layout para download: ' + key)
            return 
        
        mimetype = 'text/html'
        downloadname = 'layout.html'
        output = tpl

        if not self.request.get('html-only'):
            zipstream = StringIO.StringIO()
            pacote = zipfile.ZipFile(zipstream, "w")

            esqueleto = '../blueprint-skel'
            for dirpath, dirnames, filenames in os.walk(esqueleto):
                for name in filenames:
	                filename = os.path.join(dirpath, name)
	                pacote.write(filename, filename.replace(esqueleto, ''))

            info = zipfile.ZipInfo('index.html')
            info.date_time =  datetime.datetime.now().timetuple()
            info.external_attr = 0644 << 16L 
            pacote.writestr(info, tpl)

            pacote.close()
            zipstream.seek(0)
            zipcontents = zipstream.getvalue()
            zipstream.close()

            mimetype = 'application/zip'
            downloadname = 'layout.zip'
            output = zipcontents

        self.response.headers['Content-Type'] = mimetype
        self.response.headers['Content-Disposition'] = 'attachment; filename="' + downloadname + '"'	
        self.write(output)

class LayoutBuilder(object):
    output = ''

    def build(self, key, css_base = ''):
        layout = Layout.get(key)
                
        if(layout is None):
            return False

        config = {
            'key': str(layout.key()), 
            'layout_name' : layout.name, 
            'column_count': 24,
            'column_width': 30,
            'gutter_width': 10,
            'totalColWidth': 40 
        }
        
        result = {
            'config': config,
            'sections': []
        }
        
        sections = Section.gql('WHERE layout = :1 ORDER BY order', layout) 
        self.output = '<div class="container">'

        def addSection(areas, child_of=None):
            for k, s in enumerate(areas):
                if(s.child_of == child_of):
                    # @TODO fazer um replace melhor..
                    classe = s.css_class.replace('section ui-resizable', '').replace('ui-resizable-autohide', '')
                    classe = classe.replace('current', '')
                    classe = classe.replace('--autohide', '')
                    classe = classe.replace('ui-sortable', '').strip()
                    
                    if(s.css_class.find('clear') > -1):
                        self.output += '<div class="clear"></div>'

                    if (s.body == '&nbsp;' and child_of is None):
                        s.body = ''
                    
                    self.output += '\n\t<div id="%s" class="%s">%s' % (
                        s.html_id, 
                        re.sub(r' +', ' ', classe), 
                        unicode(s.body)
                    )
                    
                    addSection(areas, s.html_id)
                    self.output += '</div>'
        
        addSection(sections, None);
        self.output += '\n</div>'
        
        return template.render('render.html', {
            'title': layout.name, 
            'css_basepath' : css_base,
            'html': self.output
        })

class BuildGrid(BaseRequestHandler):
	def get(self):
		output = ''
		
		try:
			key = self.request.get('key')
			layout = Layout.get(key)
			builder = BuildGridCss()
			output = builder.build(layout)
		except Exception:
			pass
		
		self.response.headers['Content-Type'] = 'text/css'
		self.write(output)

class BuildGridCss(BaseRequestHandler):
	def build(self, layout):
		column_count = 24
		columns = range(1, column_count + 1)
		selector_list = lambda format: ", ".join(map(lambda x: format % x, columns))

		data = {
			'page_width': 950,
			'column_count': column_count,
			'column_width': 30,
			'gutter_width': 10,
			'input_padding': 5,
			'input_border': 1,
			'span_list': selector_list('.span-%d'),
			'pull_list': selector_list(".pull-%d"),
			'push_list': selector_list(".push-%d"),
			'input_list': ", ".join(map(
				lambda x: "input.span-%d, textarea.span-%d" % (x, x), columns))
		}

		span_range = [] 
		
		for column in range(2, data['column_count']):
			span_range.append({
				'number': column,
				'width' : int(data['column_width'] + ((column - 1) * 
							(data['column_width'] + data['gutter_width'])))
			})
		
		input_range = map(lambda column: int(
			(data['column_width'] + data['gutter_width']) * (column - 1) + 
			data['column_width'] - 2 * (data['input_padding'] + data['input_border'])
		), columns)
		
		pull_push_range = map(lambda column: 
			int(column * (data['column_width'] + data['gutter_width']))
		, columns)

		append_prepend = map(lambda column: (
			int(column * (data['column_width'] + data['gutter_width']))
		), columns[:-1])

		data.update({ 
			'span_range' : span_range,
			'input_range' : input_range,
			'append_prepend': append_prepend,
			'pull_push_range': pull_push_range,
			'border_padding' : int(data['gutter_width'] * 0.5 - 1),
			'border_margin' : int(data['gutter_width'] * 0.5),
			'colborder_padding': int((data['column_width'] + 2 * data['gutter_width'] - 1) / 2), 
			'colborder_margin': int((data['column_width'] + 2 * data['gutter_width']) / 2)
		})
		
		return template.render('grid.css', data)

def main():
    global current_user
    logging.getLogger().setLevel(logging.DEBUG)
    
    current_user = users.get_current_user()
    ga = AppUser.gql('WHERE google_account = :1', current_user) 
    # verificar se usuário já tem cadastro, se não criar usuario no storage 
    if(ga.get() == None):
        nova_conta = AppUser(google_account=current_user, google_id=current_user.user_id())
        nova_conta.put()
        
    # basepath 
    bp = Editor.PATH
    rotas = [
        (bp, Editor), 
        (bp + 'layouts', ListLayouts),
        (bp + 'save-layout', SaveLayout),
        (bp + 'open-layout', OpenLayout),
        (bp + 'delete-layout', DeleteLayout),        
        (bp + 'render-layout', RenderLayout),
        (bp + 'download-layout', DownloadLayout),
        (bp + 'custom-layout/grid.css', BuildGrid)
    ]

    layoutside = webapp.WSGIApplication(rotas, debug=True) 
    run_wsgi_app(layoutside)
    
if __name__ == '__main__':
    main()

