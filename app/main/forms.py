from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, RadioField
from wtforms.validators import DataRequired, Optional

class LocationForm(FlaskForm):
    input_type = RadioField('Input Type', 
                           choices=[('gps', 'GPS Coordinates'), ('erf', 'ERF Number')],
                           default='gps')
    
    coordinates = StringField('GPS Coordinates', 
                         validators=[Optional()],
                         render_kw={"placeholder": "e.g., -33.919578, 18.432544 or DMS format"})
    
    erf_number = StringField('ERF Number', 
                            validators=[Optional()],
                            render_kw={"placeholder": "e.g., 12345"})
    
    submit = SubmitField('Get Information')
