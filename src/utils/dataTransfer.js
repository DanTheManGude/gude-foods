export const downloadData = (dataJSON) => {
  const dataString = JSON.stringify(dataJSON, null, 2);

  const element = document.createElement("a");
  element.download = `gudefoods-download.json`;
  element.href = `data:text/json;charset=utf-8,${encodeURIComponent(
    dataString
  )}`;
  element.click();
};

export const transformRecipeForExport = (recipeEntry, glossary) => {
  const { basicFoods, recipeTags } = glossary;
  const { ingredients, tags = [] } = recipeEntry;

  const ingredientsAsNames = Object.keys(ingredients).reduce(
    (acc, ingredientKey) => ({
      ...acc,
      [basicFoods[ingredientKey]]: ingredients[ingredientKey],
    }),
    {}
  );

  const tagsAsNames = tags.map((tagKey) => recipeTags[tagKey], {});

  const recipeData = {
    ...recipeEntry,
    ingredients: ingredientsAsNames,
    tags: tagsAsNames,
  };

  return recipeData;
};
