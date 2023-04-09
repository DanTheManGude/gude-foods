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

const testingText =
  "\n\nAvocado Pesto Pasta\n\nIngredients:\n\n- 8 ounces of your favorite pasta\n- 2 avocados, pitted and peeled\n- 2 cloves garlic, minced\n- 1/4 cup fresh basil leaves\n- 2 tablespoons freshly squeezed lemon juice\n- 1/4 cup olive oil\n- 1/4 teaspoon salt\n- 1/4 teaspoon freshly ground black pepper\n- 2 tomatoes, diced\n\nInstructions:\n\n1. Bring a large pot of salted water to a boil. Add the pasta and cook according to package instructions.\n\n2. Meanwhile, in a food processor, combine the avocados, garlic, basil, lemon juice, olive oil, salt, and pepper. Process until smooth.\n\n3. Drain the cooked pasta and return it to the pot. Add the avocado pesto and diced tomatoes and stir to combine.\n\n4. Serve the pasta warm or at room temperature. Enjoy!";

export const parseResponse = (textResponse) => {
  const recipe = { name: "", ingredientText: [], instructions: [] };
  let lookingFor = "name";

  const textResponseLines = testingText.split("\n");
  textResponseLines.forEach((line) => {
    if (!line) {
      return;
    }

    if (line.includes("Instructions:")) {
      lookingFor = "instructions";
      return;
    }

    if (line.includes("Ingredients:")) {
      lookingFor = "ingredients";
      return;
    }

    if (lookingFor === "name") {
      recipe.name = line;
      return;
    }

    if (lookingFor === "ingredients") {
      recipe.ingredientText.push(line);
      return;
    }

    const maybeInstructionMatch = line.match(/\d+\. (.+)/);
    if (
      lookingFor === "instructions" &&
      maybeInstructionMatch &&
      maybeInstructionMatch.length === 2
    ) {
      recipe.instructions.push(maybeInstructionMatch[1]);
      return;
    }
  });

  const errorText = "Parsing text";
  if (!recipe.name) {
    throw Error(`${errorText}- no name`);
  }
  if (recipe.ingredientText.length === 0) {
    throw Error(`${errorText}- no ingredients`);
  }
  if (recipe.instructions.length === 0) {
    throw Error(`${errorText}- no instructions`);
  }

  return recipe;
};
