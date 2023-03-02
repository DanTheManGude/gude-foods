export const generateRecipe = (openAIKey, prompt, onSuccess, onFailure) => {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0,
      max_tokens: 300,
    }),
  };
  fetch("https://api.openai.com/v1/completions", requestOptions)
    .then((resp) => resp.json())
    .then((data) => {
      onSuccess(data.choices[0].text);
    })
    .catch(onFailure);
};

export const parseResponse = (textResponse) => {
  const recipe = { name: "", ingredients: [], instructions: [] };

  const textResponseLines = textResponse.split("\n");
  textResponseLines.forEach((line) => {
    if (!line) {
      return;
    }

    if (!recipe.name) {
      recipe.name = line;
      return;
    }

    const maybeIngredientMatch = line.match(/- (.+)/);
    if (maybeIngredientMatch && maybeIngredientMatch.length === 2) {
      const ingredients = recipe.ingredients;
      recipe.ingredients = ingredients.concat(maybeIngredientMatch[1]);
      return;
    }

    const maybeInstructionMatch = line.match(/\d+\. (.+)/);
    if (maybeInstructionMatch && maybeInstructionMatch.length === 2) {
      const instructions = recipe.instructions;
      recipe.instructions = instructions.concat(maybeInstructionMatch[1]);
      return;
    }
  });

  const errorText = "Error in parsing text";
  if (!recipe.name) {
    throw Error(`${errorText}- no name`);
  }
  if (recipe.ingredients.length === 0) {
    throw Error(`${errorText}- no ingredients`);
  }
  if (recipe.instructions.length === 0) {
    throw Error(`${errorText}- no instructions`);
  }

  return recipe;
};
