# MealPrepper
MealPrepper is a digital representation of how my wife and I plan out our meals for the month. We have a collection of recipes, and assign them to days of the month. Then we split this month-long list of recipes into weeks, and use that week-long list to compile a shopping list.

The project has two resources at the moment, recipes and ingredients. The resources have a many-to-many relationship with each other and are connected through a join table that also holds the quantity of an ingredient for a certain recipe. In a sense, ingredients behave like tags, and the frontend is designed to autocomplete the ingredient name as a user types it in.

Current iteration goals is to show a list of recipes ordered by the day of the month. Selecting a recipe will show it full detail. In future iterations this list will be split between recipes that have a day assigned to them and unassigned recipes. Assigned recipes are shown in a calendar view so you can see what recipes are coming up for the month.

A login and registration feature may be implemented in future iterations. This of course requires a new users resource and connecting the recipes resource to the user.

This is the backend for MealPrepper.

Frontend repo: https://github.com/RasyadiAbdoellah/mealprep-frontend

Deployed Heroku App: https://stark-beach-91865.herokuapp.com/

## Tech Stack
- React frontend
- Express and Sequelize backend

## User Stories
### V1
**- Epic: As a user, I want to save a recipe**
- As a user I want to create a new recipe
- As a user I want to see all of my recipes
- As a user I want to update a recipe
- As a user I want to delete a recipe

### V2
**- Epic: As a user, I want to set ingredients for each recipe**
- As a user I want to create a new ingredient and its quantity for a recipe
- As a user I want to see the ingredients in a recipe
- As a user I want to update the ingredients in a recipe
- As a user I want to delete an ingredient in a recipe

### V3
**- Epic: As a user, I want to see recipes sorted by day of the month**
- As a user I want to assign a day for a recipe
- As a user I want the information sorted by this parameter

### Reach Goals
- As a user, I want to see my recipes on a calendar
- As a user I want to share recipes with other users


### ERD

![Entity Relationship](https://i.imgur.com/B4OTHFL.png)

### Dev log

Sequelize is hard. I didn't think I'd have this much trouble getting things to work. The docs are not as detailed as I had hoped, and so progress has been slow because there's a lot of googling and trial-and-error involved.


Finally got the create Recipe route to work. I might be getting ahead of myself though. Would it be better to build the User table first?


**Feb 1 2019**

Lot of milestones reached since this readme has been updated. Successfully created a RecipeIngredient join table stores ingredient quantities for recipes, as well as proper data handling logic for Recipe CRUD. Ingredients are analagous to tags of a blog post, so blog projects using Sequelize were very helpful getting a better understanding.

Also, this app is now operational on Heroku! Setting up Heroku should have been done before even starting this app, but it's a big milestone nonetheless.

### Technical issues/improvements/considerations

**Feb 1 2019**
User login and owned recipes is the next technical improvement goal. Passport.js seems to be the framework with the best support, but Auth0 essentially allows you to outsource the auth process. In terms of speed of development Auth0 looks to be faster, but the level of control provided by Passport.js is really attractive.

Either way, the main challenge would probably be figuring out how to properly store ownership in the data. Using Passport.js as opposed to Auth0 would provide the ability to tie Recipe with User via a Foreign Key since user data will be stored locally, but is that the best way of doing it considering Passport.js also provides user data in the request via req.user? Considering Auth0 takes away user management responsibilities, would it be the safer option?

