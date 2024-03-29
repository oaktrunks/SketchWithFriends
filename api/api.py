from flask import Flask, request, jsonify
from pymongo import MongoClient
import json
from flask_cors import CORS
import random


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
        canvasWidth
        canvasHeight
        deviceType
    --------------------------------------------
    """
    gamecode = request.form['gamecode']

    #Create the document
    document = {}
    document['alias'] = request.form['alias']
    document['paths'] = request.form['paths']
    document['canvasWidth'] = int(request.form['canvasWidth'])
    document['canvasHeight'] = int(request.form['canvasHeight'])
    document['deviceType'] = request.form['deviceType']
    document['number'] = db[gamecode].find().count()

    print("received drawing")
    print(document)

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
        number
    returns:
        paths - JSON data of an array of paperJS paths
    --------------------------------------------
    """
    gamecode = request.form['gamecode']
    number = int(request.form['number'])
    #number = 1
    #print(type(number))


    #number = number - (db[gamecode].find().count() - 1) * (number // (db[gamecode].find().count() - 1) -1)

    print(number)

    try:
        result = db[gamecode].find_one({'number': number})
    except:
        return jsonify({"success":False,"error":"API error when retrieving drawing"}) 

    #return paths
    if result is None:
        return jsonify({"success":False,"error":"API error when retrieving drawing"})
    else:
        return jsonify({"success":True,"paths":result['paths'], "canvasWidth":result['canvasWidth'], "canvasHeight":result['canvasHeight'], "deviceType":result['deviceType']}) 

@app.route('/getPrompt', methods=['POST'])
def getPrompt():
    """
    type: POST
    description:
        - returns a prompt from mongoDB, deletes prompt
        - Possible race condition, concurrency issues.
    params:
        gamecode of game to join
    returns:
        result of operation; success true or false
    --------------------------------------------
    """
    #Find random prompt in database, delete it from database
    gamecode = request.form['gamecode']
    if gamecode in db.collection_names():
        result = db[gamecode].find_one({'type': "gameState"})
        if result is not None:
            promptList = result["promptList"]
            prompt = random.choice(promptList)
            promptList.remove(prompt)
            result["promptList"] = promptList
            result2 = db[gamecode].update_one({'type': "gameState"}, {"$set": result}, upsert = False)
            if result2.acknowledged is True:
                return jsonify({"success":True, "prompt": prompt})
            else:
                return jsonify({"success":False,"error":"Error retrieving prompt.\n"})
            

        else:
            return jsonify({"success":False,"error":"Error retrieving prompt.\n"})
    else:
        return jsonify({"success":False,"error":"Game does not exist.\n"})

@app.route('/createGame', methods=['GET'])
def createGame():
    """
    type: GET
    description:
        - Creates a fresh game in our mongoDB
        - Returns game code that will be used to join game
        - Puts the prompts in the database
    params:
    returns:
        gamecode used in joining game
    --------------------------------------------
    """
    #Generate a random unique gamecode consisting of alphabetical characters
    gamecode = generateUniqueGamecode()

    #Create a blank state for game in db.gamecode collection
    document = {"gameState":0, "type": "gameState"}

    try:
        file = open("prompts.txt", "r")
        promptList = []
        for word in file:
            promptList.append(word)
        document["promptList"] = promptList
    except:
        print("Error: prompts file not read")
        return jsonify({"success":False,"error":"Could not read prompts file on server"})

    result = db[gamecode].insert_one(document)

    if result.acknowledged is True :
        return jsonify({"success":True, "gamecode": gamecode})
    else:
        return jsonify({"success":False,"error":"API error when creating gamecode"}) 

@app.route('/joinGame', methods=['POST'])
def joinGame():
    """
    type: POST
    description:
        - checks if gamecode is already in mongoDB
        - checks if game is in the proper gameState to accept players
    params:
        gamecode of game to join
    returns:
        result of operation; success true or false
    --------------------------------------------
    """
    #Generate a random unique gamecode consisting of alphabetical characters
    gamecode = request.form['gamecode']
    print(gamecode)
    print(db.collection_names())
    if gamecode in db.collection_names():
        result = db[gamecode].find_one({'type': "gameState"})
        if result is not None:
            gameState = result["gameState"]
            if(gameState == 0):
                return jsonify({"success":True})
            else:
                return jsonify({"success":False,"error":"Game already in progress.\n"})
    else:
        return jsonify({"success":False,"error":"Game does not exist.\n"})

#Function to be called by /createGame API route
def generateUniqueGamecode():
    alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    gamecodeLength = 5

    #Generate a gamecode with gamecodeLength length
    gamecode = ""
    for i in range(0, gamecodeLength):
        gamecode += random.choice(alphabet)

    #Check if gamecode is in mongoDB already
    while gamecode in db.collection_names():
        #Generate new gamecode
        gamecode = ""
        for i in range(0, gamecodeLength):
            gamecode += random.choice(alphabet)
    
    return gamecode

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)