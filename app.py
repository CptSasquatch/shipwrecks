# import dependencies
from flask import Flask, render_template, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, func
from waitress import serve
serve(wsgiapp, listen='*:8080')

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///shipwreck.sqlite"

db = SQLAlchemy(app)

class Shipwreck(db.Model):
    __tablename__ = 'shipwreck'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30))
    type = db.Column(db.String(50))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    accuracy = db.Column(db.String(4))
    year_sunk = db.Column(db.Integer)
    history = db.Column(db.String(5200))

    def __repr__(self):
        return '<Shipwreck %r>' % self.name
# connect to database
engine = create_engine("sqlite:///shipwreck.sqlite")
# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)
# Save reference to the table
# Shipwreck = Base.classes.shipwreck
# Create our session (link) from Python to the DB
session = Session(engine)
# create route that renders index.html template
@app.route("/")
def home():
    return render_template("app.html")
# create route that returns data for plotting
@app.route("/api/v1.0/shipwreck")
def shipwreck():
    # Query all shipwrecks
    results = session.query(Shipwreck.id, Shipwreck.name, Shipwreck.type, Shipwreck.lat, Shipwreck.lng, Shipwreck.accuracy, Shipwreck.year_sunk, Shipwreck.history).all()
    # Create a dictionary from the row data and append to a list of all_shipwrecks
    all_shipwrecks = []
    for id, name, type, lat, lng, accuracy, year_sunk, history in results:
        shipwreck_dict = {}
        shipwreck_dict["id"] = id
        shipwreck_dict["name"] = name
        shipwreck_dict["type"] = type
        shipwreck_dict["lat"] = lat
        shipwreck_dict["lng"] = lng
        shipwreck_dict["accuracy"] = accuracy
        shipwreck_dict["year_sunk"] = year_sunk
        shipwreck_dict["history"] = history
        all_shipwrecks.append(shipwreck_dict)
    return jsonify(all_shipwrecks)
if __name__ == "__main__":
    app.run(debug=True)
  