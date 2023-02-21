export const generateRecipe = (openAIKey, prompt, onSuccess, onFailure) => {
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
    .catch(onFailure);
};
