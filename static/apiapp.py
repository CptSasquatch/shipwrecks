# Description: This file contains the main application for the API. It is responsible for creating the Flask app and registering the API endpoints.
from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
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
# create session (link) from Python to the DB
session = Session(bind=engine)
# close session
session.close()
# register the API endpoints
@app.route('/')
def index():
    print("Server received request for 'index' page...")
    return {"message": "Hello World"}
@app.route('/api/v1.0/shipwreck')
def shipwrecks():
    # Create our session (link) from Python to the DB
    session = Session(bind=engine)
    # Query all shipwrecks
    results = session.query(shipwreck.name, shipwreck.type, shipwreck.lat, shipwreck.lng, shipwreck.accuracy, shipwreck.year_sunk, shipwreck.history).all()
    # convert rows to list of dictionaries
    wreckdata = []
    # loop through rows and append to list
    for name, type, lat, lng, accuracy, year_sunk, history in results:
        wreck_dict = {}
        wreck_dict["name"] = name
        wreck_dict["type"] = type
        wreck_dict["lat"] = lat
        wreck_dict["lng"] = lng
        wreck_dict["accuracy"] = accuracy
        wreck_dict["year_sunk"] = year_sunk
        wreck_dict["history"] = history
        wreckdata.append(wreck_dict)
    session.close()
    return jsonify(wreckdata)
# run the app
if __name__ == '__main__':
    app.run(debug=True)