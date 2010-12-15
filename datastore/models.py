from google.appengine.ext import db
from google.appengine.api import users
from datastore.real_models import * 
'''
l = Layout(user = User.get_by_id(93),
    fluid = False,
    column_count = 12,
    column_width = 23,
    gutter_width =  30,
    output_filename =  'index.html')

l.put()

s = Section(layout = Layout.get_by_id(94),
    title = 'Trolha',
    tagname =  'div',
    body = 'corpinho',
    html_id =  'header',
    css_class =  'lightbox',
    width = '400px',
    order = '3')

print s.layout.column_count
s.put()
'''

class User(db.Model): 
    name = db.StringProperty()
    email = db.EmailProperty(required=True)
    login = db.StringProperty(required=True)
    pwd = db.StringProperty(required=True)
    create_date = db.DateTimeProperty(auto_now_add=True)
    
class Layout(db.Model): 
    user = db.ReferenceProperty(User)
    fluid = db.BooleanProperty()
    column_count = db.IntegerProperty()
    column_width = db.IntegerProperty() 
    gutter_width =  db.IntegerProperty() 
    output_filename =  db.StringProperty()
    create_date = db.DateTimeProperty(auto_now_add=True)
    update_date =  db.DateTimeProperty(auto_now=True)

class Section(db.Model): 
    layout = db.ReferenceProperty(Layout)
    name = db.StringProperty()
    tagname =  db.StringProperty(choices = set(["div", "section"]))
    body = db.TextProperty()
    html_id =  db.StringProperty()
    css_class =  db.StringProperty()
    width = db.IntegerProperty()
    order = db.IntegerProperty()

