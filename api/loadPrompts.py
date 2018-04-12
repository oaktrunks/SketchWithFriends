'''
This script reads the prompts.txt and puts the prompts into
our database after wiping it of any previous promts
'''

#DEPRECATED IN FAVOR OF LOADING PROMPTS
# IN API ROUTE /CREATEGAME

from pymongo import MongoClient
import json

client = MongoClient()
db = client['sketchwithfriends']

try:
    file = open("prompts.txt", "r")
    document = {}
    promptList = []
    for word in file:
        promptList.append(word)
    document["promptList"] = promptList
    result = db["prompts"].insert_one(document)
    if result.acknowledged is True :
        print("success:True")
    else:
        print("success:False")
except:
    print("Error: file not read")