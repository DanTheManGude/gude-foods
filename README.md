# Gude Foods

Helping individuals catalog, create, and grocery shop for their recipes. The website can be found at https://www.gudefoods.com.

# About

Gude Foods is a website for you to keep your recipes in an online cookbook. Create and edit your own recipes with your own ingredients with your own instructions. Add tags in your own words to recipes. Search for recipes by name, ingredients or tags.

Gude Foods also easily builds a shopping list for you. Select which recipes you want to make, and those ingredients can be added to your shopping list. These can be modified when adding and any item at all can always be added to the shopping list.

The shopping list is grouped by the departments that you decide. You can also order them in the way that you like it. Recently added recipes will be highlighted in your cookbook for easy access for cooking later. When cooking a recipe, a large text version of the instructions can be viewed with classical music playing for ambiance.

Gude Foods integrates with OpenAI to create recipes with your personalized description. The AI integration is free for users. Gude Foods also supports importing recipes from the various websites on the web that feature a recipe. You can share your recipes with a simple link. Anyone can view your recipe with the link, and can save it if they have an account.

# Tech specs

The application is a React app. Persistent storage is done in Google Firebase using its Realtime Database. Authentication is also done through Firebase. Material UI is used as a component library. React Router v6 is used for multi page routing.

#### Vercel

Vercel is used to host the app. Vercel Serverless Functions is used to fetch external sites date for recipe parsing acting as a CORS proxy. Vercel Edge function is used to make the request to OpenAI for recipe generation.

## To run locally

- run `npm install`
- run `npm run start-dev`
- Visit `localhost:3000` in browser
- _Note that unless you are an authorized user on firebase, the app has basically no functionality_

## Deploy
- Publishes to `gudefoods.com` and `foods.dangude.com` by Vercel with commits to `master`.
- Publishes to `qa.gudefoods.com` by Vercel with commits to `qa`
