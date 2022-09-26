from asyncio import constants
import json
import os
from turtle import onclick
from unicodedata import category
import firebase_admin
from firebase_admin import firestore, credentials, storage
# from PyInquirer import prompt, print_json
from urllib import request, parse
# import openpyxl
# dataframe = openpyxl.load_workbook("Book1.xlsx")
# print(dataframe)
# sheet = dataframe.get_sheet_by_name('Sheet1')
# print(sheet)
# data = []
# for row in sheet.rows:
#     # data[row[0].value] = row[1].value
#     data.append(
#         {
#             "name": row[0].value,
#             "quantity": row[1].value
#         }
#     )
# print(data)

# finalData = []
# for i in range(len(dataframe.worksheets)):
#     # print(dataframe.worksheets[i])
#     sheet = dataframe.worksheets[i]
#     for column in sheet.rows:
#         # print(column)
#         counter = 1
#         cellValues = []
#         for cell in column:
#             cellValues.append(cell.value)
#             if (cell.value!=None and counter==4):
#                 # print(cellValues)
#                 finalData.append(cellValues)
#             counter+=1
#             if (counter>4):
#                 break

# # print(finalData)
# mappedIngredients = []
# ingredients = []
# currentDish = ''
# for data in finalData:
#     if (data[2]=='INGRIDIENT'):
#         continue
#     # print(data[0],data[1],data[2],data[3])
#     if (data[1]!=None and data[2]!=None and data[3]!=None):
#         # print('Recipe',ingredients)
#         mappedIngredients.append({"name":currentDish,"ingredients":ingredients}) 
#         ingredients = []
#         currentDish = data[1]
#     ingredients.append({"name":data[2],"quantity":data[3]})

# print(mappedIngredients)

# # dump to json
# with open('mappedIngredients.json', 'w') as outfile:
#     json.dump({"ingr":mappedIngredients}, outfile)

# load from json
# with open('mappedIngredients.json') as json_file:
#     data = json.load(json_file)
#     mappedIngredients = data['ingr']

# Application Default credentials are automatically created.
dosaCred = credentials.Certificate('dosaplaza-cv.json')
fbmsCred = credentials.Certificate('fbms-shreeva.json')
dosaApp = firebase_admin.initialize_app(credential=dosaCred, name='dosa')
fbmsApp = firebase_admin.initialize_app(credential=fbmsCred, name='fbms')
dosaDb = firestore.client(app=dosaApp)
fbmsDb = firestore.client(app=fbmsApp)

dosaBucket = storage.bucket(app=dosaApp,name='dosaplaza-cv.appspot.com')
fbmsBucket = storage.bucket(app=fbmsApp,name='fbms-shreeva-demo.appspot.com')

collections = [
    'business/accounts/b8588uq3swtnwa1t83lla9/discounts/discounts',
    'business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients',
    'business/accounts/b8588uq3swtnwa1t83lla9/recipes/categories',
    'business/accounts/b8588uq3swtnwa1t83lla9/recipes/categoryGroups',
    'business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes',
    'business/accounts/b8588uq3swtnwa1t83lla9/tables/tables',
    'business/accounts/b8588uq3swtnwa1t83lla9/taxes/taxes'
]
projectId= 'triveniSangam' 
for collectionPath in collections:
    for doc in  fbmsDb.collection(collectionPath).stream():
        newCollectionPath = collectionPath.replace('b8588uq3swtnwa1t83lla9',projectId)
        # add the doc to new location
        print('Adding',doc.id,'to',newCollectionPath)
        fbmsDb.collection(newCollectionPath).document(doc.id).set(doc.to_dict())
        # break

# ingredientBackup = [{
#       "warningThreshold": 10,
#       "ratePerUnit": 180,
#       "finalPrice": 9.9,
#       "touched": False,
#       "openingBalance": -0.045000000000000005,
#       "newQuantity": 0,
#       "category": "Raw Material",
#       "closingBalance": -0.045000000000000005,
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "issued": 0,
#       "name": "White till",
#       "id": "06aMsb0DMzBDJqeqlFml",
#       "newRatePerUnit": 180,
#       "errorThreshold": 5,
#       "quantity": -0.045000000000000005,
#       "used": 0,
#       "unit": "kg"
#     },
#     {
#       "errorThreshold": 5,
#       "newRatePerUnit": 15,
#       "warningThreshold": 10,
#       "openingBalance": 33,
#       "used": 0,
#       "quantity": 33,
#       "name": "Onion ",
#       "newQuantity": 0,
#       "id": "08X41aFuXVO3CGTw943B",
#       "ratePerUnit": 15,
#       "issued": 0,
#       "closingBalance": 33,
#       "unit": "kg",
#       "touched": False,
#       "category": "Raw Material",
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "finalPrice": 525
#     },
#     {
#       "id": "12aJrDvEvxMrNC4ws93E",
#       "name": "Sambhar masala",
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "quantity": 17.250000000000004,
#       "touched": False,
#       "used": 0,
#       "closingBalance": 17.250000000000004,
#       "ratePerUnit": 283,
#       "errorThreshold": 5,
#       "finalPrice": 5957.150000000001,
#       "category": "Raw Material",
#       "openingBalance": 17.250000000000004,
#       "newQuantity": 0,
#       "newRatePerUnit": 283,
#       "warningThreshold": 10,
#       "issued": 0,
#       "unit": "kg"
#     },
#     {
#       "warningThreshold": 10,
#       "unit": "kg",
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "errorThreshold": 5,
#       "ratePerUnit": 25,
#       "newQuantity": 0,
#       "issued": 0,
#       "touched": False,
#       "openingBalance": 24,
#       "quantity": 24,
#       "name": "Salt tata",
#       "id": "1i8o3A9KWuuAWlBeAJyv",
#       "category": "Raw Material",
#       "finalPrice": 775,
#       "newRatePerUnit": 25,
#       "used": 0,
#       "closingBalance": 24
#     },
#     {
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "id": "2CHouE0qA2oNE6wcXdL2",
#       "warningThreshold": 10,
#       "issued": 0,
#       "ratePerUnit": 0,
#       "unit": "kg",
#       "errorThreshold": 5,
#       "touched": False,
#       "category": "Raw Material",
#       "newRatePerUnit": 0,
#       "finalPrice": 0,
#       "quantity": 0,
#       "openingBalance": 0,
#       "newQuantity": 0,
#       "closingBalance": 0,
#       "name": "Cucumber ",
#       "used": 0
#     },
#     {
#       "newQuantity": 0,
#       "quantity": 1.9,
#       "newRatePerUnit": 60,
#       "images": [
#         "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#       ],
#       "touched": False,
#       "id": "2PwOTuoRAIGqaWTbbSfh",
#       "errorThreshold": 5,
#       "category": "Raw Material",
#       "name": "Ginger ",
#       "closingBalance": 1.9,
#       "issued": 0,
#       "unit": "kg",
#       "ratePerUnit": 60,
#       "warningThreshold": 10,
#       "finalPrice": 150,
#       "openingBalance": 1.9,
#       "used": 0
#     },]
# for i in ingredientBackup:
#     fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients/'+i['id']).update(i)

# newIngredientsRef = fbmsDb.collection('business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients')
# allIngredients = []
# for ingredient in newIngredientsRef.stream():
#     allIngredients.append(ingredient.to_dict())
# counter = 0
# for ingredient in allIngredients:
#     for bkp in data:
#         if (ingredient['name'] and bkp['name']):
#             if (ingredient['name'].strip().lower() == bkp['name'].strip().lower()):
#                 print("FOund updating", ingredient['name'], bkp['name'])
#             #     print({"quantity":bkp['quantity'],"openingBalance":bkp['quantity'],"closingBalance":bkp['quantity']})
#             #     counter +=1 
#             #     fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients/'+ingredient['id']).update({"quantity":bkp['quantity'],"openingBalance":bkp['quantity'],"closingBalance":bkp['quantity']})
#             else:
#                 print("Not Found")
#                 counter +=1 
#         else:
#             counter +=1 
#             print("Not found", ingredient['name'], bkp['name'])
#             # name = input("New Name")
#             # fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients/'+ingredient.id).update({"quantity":bkp['quantity'],"openingBalance":bkp['quantity'],"closingBalance":bkp['quantity']})
# print(counter)
# notfounds = {}
# for data in mappedIngredients:
#     for recipeIngredient in data['ingredients']:
#         found = False
#         for ingredient in allIngredients:
#             if (recipeIngredient['name'] and ingredient['name'].strip().lower()==recipeIngredient['name'].strip().lower()):
#                 # print('Found ',ingredient['name'])
#                 found = True
#                 break
#         if(not found):
#             notfounds[recipeIngredient['name']] = recipeIngredient['name']
#             # print('Not found',recipeIngredient['name'])
# print(notfounds.keys())
# newIngredientsRef.add({
#     "name":ingredient,
#     "ingredients":mappedIngredients[ingredient]
# })
# ingredient_ref = dosaDb.collection(u'stock')
# ingredients = []
# fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/counters').update({
#     "ingredients": len(ingredients)
# })
# for ingredient in ingredient_ref.stream():
#     print(ingredient.to_dict())
#     ingredients.append(ingredient.to_dict())
#     ingredientData = {
#         "category": 'Raw Material',
#         "errorThreshold": 5,
#         "images":[
#             "https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food.png?alt=media&token=4eb3ffc3-895d-4192-b6c0-4b165c0ddcde"
#         ],
#         "name": ingredient.to_dict()['name'],
#         "quantity": ingredient.to_dict()["quantity"],
#         "ratePerUnit":ingredient.to_dict()["rate"],
#         "unit": ingredient.to_dict()["unit"],
#         "warningThreshold":10
#     }
#     print(ingredientData)
#     fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients').add(ingredientData)

# fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/counters').update({
#     "ingredients": len(ingredients)
# })

# categories_ref = fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/recipes/categories')

# for category in categories_ref.stream():
#     print(category.to_dict())

# print(fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/Btzrhwj8ocSVkyT5uIlN').get().to_dict())

# ingredient_ref = fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients')
# ingredients = {}
# # # fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/counters').update({
# # #     "ingredients": len(ingredients)
# # # })
# for ingredient in ingredient_ref.stream():
#     # print(ingredient.to_dict())
#     ingredients[ingredient.to_dict()['name']] = (ingredient.to_dict())

# oldIngredient_ref = dosaDb.collection(u'stock')
# oldIngredients = {}
# # fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/counters').update({
# #     "ingredients": len(ingredients)
# # })
# for oldIngredient in oldIngredient_ref.stream():
#     # print(oldIngredient.to_dict())
#     oldIngredients[oldIngredient.id] = (oldIngredient.to_dict())


# oldCategory_ref = fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/recipes/categories')
# oldCategories = {}
# categoryNames = []
# for oldCategory in oldCategory_ref.stream():
#     # print(oldCategory.to_dict())
#     oldCategories[oldCategory.to_dict()['name']] = (oldCategory.to_dict())
#     categoryNames.append(oldCategory.to_dict()['name'])

# # print(categoryNames)
# doc_ref = fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes')
# allDocs = doc_ref.stream()

# # print(oldCategories)
# docs = []
# cat = oldCategories['Indian Starters']
# print(cat)
# for doc in allDocs:
#     if (doc.to_dict()['categories']['name']=='Starters'):
#         # print("categories",oldCategories['Indian Starters'])
#         fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).update({
#             "categories":cat
#         })
    # print(doc.to_dict(),doc.id)
#     if (doc.to_dict()['onlinePrice']==0):
#         print("Name: "+doc.to_dict()['dishName']+" & Catgeory: "+doc.to_dict()['categories']['name'])
#         price = int(input('Price =>'))
#         print('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id)
#         fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).update({
#             "onlinePrice": price,
#             "sellingPrice": price,
#             "shopPrice": price
#         })
#     docs.append(doc)
# print("Recipes:",len(docs))
# categoryNames.append('SKIP')
# for doc in docs:
#     # print(f'{doc.id} => {doc.to_dict()}')
#     index = 1
#     images=[]
#     print("Dish Name ",doc.to_dict()['name'])
#     if input("Skip ?") == 'y': continue
#     for photo in doc.to_dict()['photos']:
#         completed = False
#         while not completed:
#             try:
#                 file_name = parse.unquote(photo).split('/')[-1].split('?')[0]
#                 # download the file
#                 print(f'Downloading {file_name}')
#                 request.urlretrieve(photo, 'images/'+doc.id + '_' + str(index) + '.' + file_name.split('.')[-1])
#                 blob = fbmsBucket.blob('business/accounts/b8588uq3swtnwa1t83lla9/recipes/images/'+doc.id + '/'+ doc.id + '_' + str(index) + '.' + file_name.split('.')[-1])
#                 blob.upload_from_filename('images/'+doc.id + '_' + str(index) + '.' + file_name.split('.')[-1])
#                 blob.make_public()
#                 print(blob.public_url)
#                 images.append(blob.public_url)
#                 completed = True
#             except Exception as e:
#                 completed = False
#                 print(e)
#                 print("Retrying")
#         index += 1    
#     newIngredients = []
#     # if (len(doc.to_dict()['ingredients']) == 0): continue
#     for ingredient in doc.to_dict()['ingredients']:
#         newIngredients.append(ingredients[oldIngredients[ingredient['id']]['name']])
#     print(newIngredients)
#     questions = [
#         {
#             "type": 'list',
#             "name":"cat",
#             "message": "Select Category for => "+doc.to_dict()['name'],
#             'choices':categoryNames
#         }
#     ]
#     answers = prompt(questions)
#     if (answers['cat'] == 'SKIP'):
#         docs.append(doc)
#         # print(docs)
#         continue
#     print(answers,oldCategories[answers['cat']])
#     dish = {
#         'platforms': [
#             {'value': 'web', 'checked': True, 'name': 'Web'}, 
#             {'value': 'mobile', 'checked': True, 'name': 'Mobile'}, 
#             {'value': 'desktop', 'checked': True, 'name': 'Desktop'}, 
#             {'value': 'other', 'checked': True, 'name': 'Other'}
#             ], 
#         'onlinePrice':doc.to_dict()['sellingPrice'], 
#         'tags': ['tagOne', 'tagTwo', 'tagThree'], 
#         'orderType': None, 
#         'dishName': doc.to_dict()['name'], 
#         'categories': oldCategories[answers['cat']],
#         'thirdPartyPrice': doc.to_dict()['sellingPrice'], 
#         'taxes': [], 
#         'availableOnQrMenu': True, 
#         'images': images, 
#         'ingredients': newIngredients, 
#         'profitMargin': 1, 
#         'costPrice': 0, 
#         'sellingPrice':0, 
#         'shopPrice': doc.to_dict()['sellingPrice'], 
#         'additionalInstructions': None
#     }
#     print('------')
#     print(dish)
#     print('------')
#     fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes').add(dish)

# ingredientsRef = fbmsDb.collection(u'business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients')
# for ingredient in ingredientsRef.stream():
#     print(ingredient.to_dict(),ingredient.id)
#     fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/ingredients/ingredients/'+ingredient.id).update({"quantity":0,"ratePerUnit":0,"openingBalance":0,"closingBalance":0,"newRatePerUnit":0,"finalPrice":0})

# for doc in allDocs:
#     print("Dish Name ",doc.to_dict()['dishName'], doc.to_dict()['onlinePrice'], doc.id)
#     price = input("New Price => ")

    # try:
    #     int(price)
    #     if( int(price)> 0 ):
    #         fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).update({
    #         "onlinePrice": price,
    #         'thirdPartyPrice': price,
    #         "shopPrice": price, 
    #         })
    #         print("Updated")
    #         # break
    # except:
    #     print("Skipped")
        # break
    # fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).update({
    #         "images": ['https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food(1).png?alt=media&token=558c361b-00a5-4a1b-b9ae-07ddaf7151ff']
    # })
    # print(doc.id)
    # try:
    #     cat = doc.to_dict()['category']['name']
    #     # if doc.to_dict()['categories'] == 'Salad /Papad':
    #     #     print('Matched')
    #     #     print(doc.to_dict())
    #     #     cat = 'Salad/Papad'
    #     #     print(oldCategories[cat])    
    #     # elif doc.to_dict()['categories'] == 'Main Course':
    #     #     cat = 'Main Course/Curries'
    #     # else:
    #     #     cat = doc.to_dict()['categories']
    #     # if (cat == ''):
    #     #     # delete doc
    #     #     print('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id)
    #     #     fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).delete()
    #     #     continue
    #     # cat = doc.to_dict()['category']['name']
    #     print(cat,doc.id)
    #     print(oldCategories[cat])
    #     fbmsDb.document('business/accounts/b8588uq3swtnwa1t83lla9/recipes/recipes/'+doc.id).update({
    #         "categories": oldCategories[cat]
    #     })
    # except:
    #     print("Fine",doc.id)


# import csv
# file = open('dishes.csv','r+')
# reader = csv.reader(file,delimiter=',')
# for row in reader:
    # print(row)
    # if (row[0]!='0'):
    #     dish = {
    #         'platforms': [
    #             {'value': 'web', 'checked': True, 'name': 'Web'}, 
    #             {'value': 'mobile', 'checked': True, 'name': 'Mobile'}, 
    #             {'value': 'desktop', 'checked': True, 'name': 'Desktop'}, 
    #             {'value': 'other', 'checked': True, 'name': 'Other'}
    #             ], 
    #         'onlinePrice':row[1], 
    #         'tags': ['tagOne', 'tagTwo', 'tagThree'], 
    #         'orderType': None, 
    #         'dishName': row[0], 
    #         'categories': row[2],
    #         'thirdPartyPrice': row[1], 
    #         'taxes': [], 
    #         'availableOnQrMenu': True, 
    #         'images': ["https://firebasestorage.googleapis.com/v0/b/fbms-shreeva-demo.appspot.com/o/food(1).png?alt=media&token=558c361b-00a5-4a1b-b9ae-07ddaf7151ff"], 
    #         'ingredients': [], 
    #         'profitMargin': 1, 
    #         'costPrice': 0, 
    #         'sellingPrice':0, 
    #         'shopPrice': row[1], 
    #         'additionalInstructions': None
    #     }
    #     doc_ref.add(dish)
        # print(dish)