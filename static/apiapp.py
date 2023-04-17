# Description: This file contains the main application for the API. It is responsible for creating the Flask app and registering the API endpoints.
from flask import Flask, jsonify, render_template
from flask_cors import CORS
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, func
# create the Flask app
app = Flask(__name__)
# enable CORS
CORS(app)
# conect to database
engine = create_engine("sqlite:///data/shipwreck.sqlite")
# reflect an existing database into a new model
base = automap_base()
# reflect the tables
base.prepare(autoload_with=engine, reflect=True)
# Save reference to the table
shipwreck = base.classes.wrecks
# register the API endpoints
@app.route('/')
def index():
    return render_template('app.html')
@app.route('/api/v1.0/shipwreck')
def shipwreck():
    # Create our session (link) from Python to the DB
    session = Session(bind=engine)
    # Query all shipwrecks
    results = session.query(shipwreck.id, shipwreck.name, shipwreck.type, shipwreck.lat, shipwreck.lng, shipwreck.accuracy, shipwreck.year_sunk, shipwreck.history).all()
    session.close()
    return jsonify(results)
# run the app
if __name__ == '__main__':
    app.run(debug=True)