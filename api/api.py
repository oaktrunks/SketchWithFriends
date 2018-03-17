from flask import Flask, request, jsonify
from pymongo import MongoClient
import json
from flask_cors import CORS


# Create a link to our mongo database
client = MongoClient()
db = client['sketchwithfriends']

app = Flask(__name__)
CORS(app)

@app.route('/hello')
def mainScreen():
    return "Hello, World!"


@app.route('/sendDrawing', methods=['POST'])
def sendDrawing():
    """
    type: POST
    description:
        - Receives a drawing and adds it to the database
        - Uses proper identification from parameters to put it in right collection
    params:
        gamecode
        alias
        paths - JSON data of an array of paperJS paths
    --------------------------------------------
    """
    gamecode = request.form['gamecode']

    #Create the document
    document = {}
    document['alias'] = request.form['alias']
    document['paths'] = request.form['paths']

    #Insert document into MongoDB
    result = db[gamecode].insert_one(document)
    print(result)
    if result.acknowledged is True :
        return jsonify({"success":True})
    else:
        return jsonify({"success":False,"error":"API error when inserting into MongoDB"}) 

    #for k in request.form.items():
    #return request.get_json(force=True)
    # data in string format and you have to parse into dictionary
    #data = request.data
    #dataDict = json.loads(data)
    #return request.form['paths']

#TODO make this a GET request instead?
@app.route('/getDrawing', methods=['POST'])
def getDrawing():
    """
    type: POST
    description:
        - Retrieves and returns a drawing from our MongoDB
    params:
        gamecode
        alias
    returns:
        paths - JSON data of an array of paperJS paths
    --------------------------------------------
    """
    gamecode = request.form['gamecode']
    alias = request.form['alias']
    paths = db[gamecode].find_one({'alias': alias})['paths']

    return paths

if __name__ == '__main__':
    app.run(debug=True)