import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

import { databasePaths } from "../../constants";

import Home from "../Pages/Home";
import Cookbook from "../Pages/Cookbook";
import Recipe from "../Pages/Recipe";
import ShoppingList from "../Pages/ShoppingList";
import Glossary from "../Pages/Glossary";
import Settings from "../Pages/Settings";
import AiRecipe from "../Pages/AiRecipe";

const hackAiGeneratedRecipe = {
  name: "Vegetarian Stuffed Peppers",
  ingredients: [
    "4 bell peppers, halved and seeded",
    "1 tablespoon olive oil",
    "1 onion, diced",
    "2 cloves garlic, minced",
    "1 cup cooked quinoa",
    "1 cup cooked black beans",
    "1 cup corn",
    "1 teaspoon chili powder",
    "1 teaspoon cumin",
    "1/2 teaspoon smoked paprika",
    "1/2 teaspoon salt",
    "1/4 teaspoon black pepper",
    "1/2 cup shredded cheese",
  ],
  instructions: [
    "Preheat oven to 375°F.",
    "Place the bell pepper halves in a baking dish.",
    "Heat the olive oil in a large skillet over medium heat. Add the onion and garlic and cook until softened, about 5 minutes.",
    "Add the quinoa, black beans, corn, chili powder, cumin, smoked paprika, salt, and black pepper. Cook for an additional 5 minutes, stirring occasionally.",
    "Remove from heat and stir in the cheese.",
    "Divide the mixture among the bell pepper halves.",
    "Bake for 25 minutes, or until the peppers are tender and the cheese is melted.",
    "Serve warm. Enjoy!",
  ],
  tags: [],
};

function PagesContainer(props) {
  const { user, addAlert } = props;

  const [database, setDatabase] = useState({});
  const [dataPaths, setDataPaths] = useState({});
  const [filteringOptions, setFilteringOptions] = useState();
  const [aiGeneratedRecipe, setAiGeneratedRecipe] = useState(
    hackAiGeneratedRecipe
  );
  const [openAIKey, setOpenAIKey] = useState();

  useEffect(() => {
    if (!user) {
      return;
    }
    const db = getDatabase();

    Object.keys(databasePaths).forEach((key) => {
      const pathRoot = databasePaths[key];
      const fullPath = `${pathRoot}/${user.uid}`;

      onValue(ref(db, fullPath), (snapshot) => {
        setDatabase((_database) => ({
          ..._database,
          [key]: snapshot.val(),
        }));
        setDataPaths((_dataPaths) => ({
          ..._dataPaths,
          [`${key}Path`]: fullPath,
        }));
      });
    });

    onValue(ref(db, "openAIKey"), (snapshot) => {
      setOpenAIKey(snapshot.val());
    });
  }, [user]);

  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Home database={database} dataPaths={dataPaths} addAlert={addAlert} />
        }
      />
      <Route
        path="cookbook"
        element={
          <Cookbook
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
            filteringOptions={filteringOptions}
            setFilteringOptions={setFilteringOptions}
            setAiGeneratedRecipe={setAiGeneratedRecipe}
            openAIKey={openAIKey}
          />
        }
      />
      <Route
        path="recipe/:recipeId"
        element={
          <Recipe
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="shoppingList"
        element={
          <ShoppingList
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="glossary"
        element={
          <Glossary
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="settings"
        element={
          <Settings
            database={database}
            dataPaths={dataPaths}
            user={user}
            addAlert={addAlert}
          />
        }
      />
      <Route
        path="aiRecipe"
        element={
          <AiRecipe
            database={database}
            dataPaths={dataPaths}
            addAlert={addAlert}
            givenRecipe={aiGeneratedRecipe}
          />
        }
      />
    </Routes>
  );
}

export default PagesContainer;
