import Button from "@mui/material/Button";

function OfflineCookbook(props) {
  const { cookbook, setRecipe } = props;

  return Object.entries(cookbook).map((name, recipeData) => {
    const fullRecipe = { name, ...recipeData };

    return <Button onClick={setRecipe(fullRecipe)}>{name}</Button>;
  });
}

export default OfflineCookbook;
