from asyncio import constants
import json
import os
import re
from turtle import onclick
from unicodedata import category
import firebase_admin
from firebase_admin import firestore, credentials, storage
# from PyInquirer import prompt, print_json
from urllib import request, parse
import openpyxl
dosaCred = credentials.Certificate('dosaplaza-cv.json')
fbmsCred = credentials.Certificate('fbms-shreeva.json')
dosaApp = firebase_admin.initialize_app(credential=dosaCred, name='dosa')
fbmsApp = firebase_admin.initialize_app(credential=fbmsCred, name='fbms')
dosaDb = firestore.client(app=dosaApp)
fbmsDb = firestore.client(app=fbmsApp)

dosaBucket = storage.bucket(app=dosaApp,name='dosaplaza-cv.appspot.com')
fbmsBucket = storage.bucket(app=fbmsApp,name='fbms-shreeva-demo.appspot.com')

projectId = "mahajans"

dataframe = openpyxl.load_workbook("Mahajan-Menu.xlsx")
print(dataframe)
sheet = dataframe.get_sheet_by_name('Sheet1')
print(sheet)
data = []
for row in sheet.rows:
    # data[row[0].value] = row[1].value
    # print(row[0].value, row[1].value)
    # if len(data) == 0: continue
    if row[2].value == 'Category': continue 
    print (row[0].value, row[1].value, row[2].value,)
    if (row[1].value):
        data.append(
            {
                "name": row[0].value,
                "dishPrice": row[1].value,
                "category":row[2].value,
            }
        )
# # print(data)
categories = {}
for item in fbmsDb.collection(f"business/accounts/{projectId}/recipes/categories").stream():
    categories[item.to_dict()['name']] = {**item.to_dict(), 'id': item.id}
print(categories)
for recipe in data:
    print(recipe['category'])
    recipeData ={
        'platforms': [
            {'value': 'web', 'checked': True, 'name': 'Web'}, 
            {'value': 'mobile', 'checked': True, 'name': 'Mobile'}, 
            {'value': 'desktop', 'checked': True, 'name': 'Desktop'}, 
            {'value': 'other', 'checked': True, 'name': 'Other'}], 
        'onlinePrice':recipe['dishPrice'], 
        'tags': ['tagOne', 'tagTwo', 'tagThree'], 
        'orderType': None, 
        'dishName': recipe['name'].title(),
        'categories': categories[recipe['category']],
        'thirdPartyPrice': recipe['dishPrice'], 
        'taxes': [], 
        'availableOnQrMenu': True, 
        'images': ['https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food(1).png?alt=media&token=558c361b-00a5-4a1b-b9ae-07ddaf7151ff'], 
        'ingredients': [], 
        'profitMargin': 1, 
        'costPrice': 0, 
        'sellingPrice':0, 
        'shopPrice': recipe['dishPrice'], 
        'additionalInstructions': None
    }
    print(recipeData)
#     fbmsDb.collection("business/accounts/triveniSangam/recipes/roomRecipes").add(recipeData)
    # fbmsDb.collection(f"business/accounts/{projectId}/recipes/recipes").add(recipeData)
    break

# # print(categories)
# # categories = []
# # for i in data:
# #     if i["category"] not in categories:
# #         categories.append(i["category"])
# # print(categories)

# # for i in categories:
# #     if i == "Category": continue
# #     fbmsDb.collection("business/accounts/triveniSangam/recipes/categories").add({ 
# #         "connectedMenu": "baseMenu",
# #         "created": firestore.SERVER_TIMESTAMP,
# #         "discountList": "",
# #         "displayName": i,
# #         "isActive": False,
# #         "modified": firestore.SERVER_TIMESTAMP,
# #         "name": i,
# #     })
