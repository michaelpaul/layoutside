# coding=UTF-8

import logging, os, sys, cgi, datetime
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
            result.append({'key': str(l.key()), 'name': str(name)})
            
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
                'column_count': 24,
                'column_width': 30,
                'gutter_width': 10,
                'totalColWidth': 40 
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
    def addList(self, sections):
        sectionTree = []
        for s in sections:
            if(s.child_of is None):
                sectionTree.append(s)
        return sectionTree
    output = ''  
    def get(self):
        layout = Layout.get(self.request.get('key'))
        # self.response.headers['Content-type'] = 'application/json'
                
        if(layout is None):
            self.write('Layout não encontrado.')
        else:
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
                        classe = s.css_class.replace('section ui-resizable', '').replace('ui-resizable-autohide', '')
                        classe = classe.replace('ui-sortable', '').strip()
                        
                        if(s.css_class.find('clear') > -1):
                            self.output += '<div class="clear"></div>'

                        self.output += '\n\t<div id="{0}" myparent="{3}" class="{1}">{2}'.format(s.html_id, classe, 
                            s.body.encode('UTF-8'), s.child_of)
                        addSection(areas, s.html_id)
                        self.output += '</div>'
            
            addSection(sections, None);
            
            self.output += '</div>'
            self.render('render.html', {'title': layout.name, 'html':self.output})
            # result_str = simplejson.dumps(result)
            # self.write(result_str)
          


class SaveLayout(BaseRequestHandler):
    def post(self):
        layout = simplejson.loads(self.request.body)
        config = layout['config']
        
        self.response.headers['Content-type'] = 'application/json'
        
        try:
            if config['key'] != '':
                l = Layout.get(config['key'])
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
        zipstream = StringIO.StringIO()
        pacote = zipfile.ZipFile(zipstream, "w")

        esqueleto = '../blueprint-skel'
        for dirpath, dirnames, filenames in os.walk(esqueleto):
            for name in filenames:
		        filename = os.path.join(dirpath, name)
		        pacote.write(filename, filename.replace(esqueleto, ''))

        tpl = template.render('render.html', {'html': 'Michael Paul!'})
        # pacote.writestr('index.html', tpl)
        info = zipfile.ZipInfo('index.html')
        info.date_time =  datetime.datetime.now().timetuple()
        info.external_attr = 0644 << 16L 
        pacote.writestr(info, tpl)
        
        pacote.close()
        zipstream.seek(0)
        zipcontents = zipstream.getvalue()
        zipstream.close()

        self.response.headers['Content-Type'] = 'application/zip'
        self.response.headers['Content-Disposition'] = 'attachment; filename="layout.zip"'	
        self.write(zipcontents)

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
        (bp + 'download-layout', DownloadLayout)
    ]

    layoutside = webapp.WSGIApplication(rotas, debug=True) 
    run_wsgi_app(layoutside)
    
if __name__ == '__main__':
    main()

