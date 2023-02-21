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
