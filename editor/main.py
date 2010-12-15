import os
import cgi
import datetime

from google.appengine.api import users
from google.appengine.ext import webapp, db
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app

class BaseRequestHandler(webapp.RequestHandler):
    def write(self, msg):
        self.response.out.write(msg)
    def render(self, path, template_values = {}):
        self.response.out.write(template.render(path, template_values))
        
class Editor(BaseRequestHandler):
    PATH = '/editor/'
    
    def get(self):
        self.render('index.html')
        
class SaveLayout(BaseRequestHandler):
    def post(self):
        self.write('Save the layout!')
        pass

def main():
    rotas = [
        (Editor.PATH, Editor), 
        (Editor.PATH + 'save-layout', SaveLayout),
    ]

    layoutside = webapp.WSGIApplication(rotas, debug=True) 
    run_wsgi_app(layoutside)
    
if __name__ == '__main__':
    main()

