export const generateRecipe = (options, onSuccess, onFailure) => {
  const openAIKey = "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";
  const prompt = "Say this is a test";

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIKey}`,
    },
    body: JSON.stringify({
      prompt: prompt,
      temperature: 0.1,
      max_tokens: 7,
    }),
  };
  fetch(
    "https://api.openai.com/v1/engines/code-davinci-001/completions",
    requestOptions
  )
    .then((resp) => resp.json())
    .then((data) => {
      onSuccess(data.choices[0].text);
    })
    .catch((err) => {
      console.log(err);
    });
};
