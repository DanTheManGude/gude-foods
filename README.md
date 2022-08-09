# Gude Foods
Helping individuals catalog, create, and grocery shop for their recipes.

# What is it? What does it do?
It is a web app that allows users to input Recipes into a Cookbook. A Recipe includes a name, ingredients with amounts, instructions in order, and descriptive labels. The user can select Recipes to add its ingredients to their Shopping List. Recipes can be searched and filtered by name, ingredients, and labels. The Shopping List is divided into sections found at a grocery store. Items in the Shopping List show which recipes it is for and allows a 'total' amount to be entered. Items in the Shoping List can be checked off which moves them into a seperate section on the Shopping List. A Glossary shared by all users is how food  items are added to the system and their specific section. Food sections and Recipe labels are also added in the Glossary.

# How do I use it?
The website can be found at https://gudefoods.com. Your user account is through logging in with Google. To be a registered user, you must contact the owner and be aproved. The site is optimized for mobile devices.

# Tech specs
The application is a React app. Persistent storage is done in Google Firebase using its Realtime Database. Authentication is also done through Firebase. Material UI is used as a component library. React Router v6 is used for multi page routing. Heroku is used to host the app.

## Dev Specs
#### To run locally
- run `npm install`
- run `npm start`
- Visit `localhost:3000` in browser
- _Note that unless you are an authorized user on firebase the app is functionally none_

#### Contributing
Contact the owner if you would like to contribute. We can set you up with a replica Firebase app (or actually spin up a proper QA app). The npm scripts to deploy push the respictive branch to the Heroku repository. To set this up on your machine, designate an remote as `heroku-qa` (or `prod`). The Heroku project uses the buildpack [mars/create-react-app](https://buildpack-registry.s3.amazonaws.com/buildpacks/mars/create-react-app.tgz). The qa url is https://qa.gudefoods.com
