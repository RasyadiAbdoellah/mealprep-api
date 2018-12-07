# MealPrepper
MealPrepper is a digital representation of how my wife and I plan out our meals for the month. We have a collection of recipes, and assign them to days of the month. Then we split this month-long list of recipes into weeks, and use that week-long list to compile a shopping list.

The project has two resources at the moment, recipes and ingredients. The resources have a many-to-many relationship with each other and are connected through a join table that also holds the quantity of an ingredient for a certain recipe. In a sense, ingredients behave like tags, and the frontend is designed to autocomplete the ingredient name as a user types it in.

Current iteration goals is to show a list of recipes ordered by the day of the month. Selecting a recipe will show it full detail. In future iterations this list will be split between recipes that have a day assigned to them and unassigned recipes. Assigned recipes are shown in a calendar view so you can see what recipes are coming up for the month.

A login and registration feature may be implemented in future iterations. This of course requires a new users resource and connecting the recipes resource to the user.

This is the backend for MealPrepper.

Frontend repo: https://github.com/RasyadiAbdoellah/mealprep-frontend

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



### Technical issues/improvements



