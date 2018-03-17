from flask import Flask, request
from pymongo import MongoClient
import json
from flask_cors import CORS


# Create a link to our mongo database
client = MongoClient()

app = Flask(__name__)
CORS(app)

@app.route('/hello')
def mainScreen():
    return "Hello, World!"

@app.route('/sendDrawing', methods=['POST'])
def sendDrawing():
    #Store the drawing in mongodb
    #for k in request.form.items():
    #return request.get_json(force=True)
    # data in string format and you have to parse into dictionary
    #data = request.data
    #dataDict = json.loads(data)
    return request.form['paths']
    
        

if __name__ == '__main__':
    app.run(debug=True)