from google.appengine.ext import db
from google.appengine.api import users

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
    user = db.ReferenceProperty(User, required=True)
    name = db.StringProperty()
    fluid = db.BooleanProperty(default=False)
    column_count = db.IntegerProperty(default=24)
    column_width = db.IntegerProperty(default=30) 
    gutter_width =  db.IntegerProperty(default=10) 
    output_filename =  db.StringProperty(default="index.html")
    create_date = db.DateTimeProperty(auto_now_add=True)
    update_date =  db.DateTimeProperty(auto_now=True)

class Section(db.Model): 
    layout = db.ReferenceProperty(Layout)
    child_of = db.StringProperty()
    name = db.StringProperty()
    tagname =  db.StringProperty(choices = set(["div", "section"]), default="div")
    body = db.TextProperty()
    html_id =  db.StringProperty()
    css_class =  db.StringProperty()
    width = db.IntegerProperty()
    order = db.IntegerProperty()


