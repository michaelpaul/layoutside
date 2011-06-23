from google.appengine.ext import db
from google.appengine.api import users

class AppUser(db.Model): 
    google_account = db.UserProperty()
    google_id = db.StringProperty()
    create_date = db.DateTimeProperty(auto_now_add=True)
    
class Layout(db.Model): 
    # user = db.ReferenceProperty(AppUser, required=True)
    owner = db.StringProperty()
    name = db.StringProperty(default="Untitled")
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

