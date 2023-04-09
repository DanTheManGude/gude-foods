import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import Typography from "@mui/material/Typography";

function Cooking(props) {
  const {
    database: { glossary: _glossary, cookbook: _cookbook },
  } = props;
  const glossary = _glossary || {};
  const cookbook = _cookbook || {};

  const { recipeId } = useParams();

  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    const recipe = cookbook[recipeId];
    if (recipe) {
      const { name: _name, instructions: _instructions } = recipe;
      setName(_name);
      setInstructions(_instructions);
    }
  }, [recipeId]);

  const renderName = () => {
    return (
      <Typography
        key="title"
        variant="h5"
        sx={{
          color: "primary.main",
          textAlign: "left",
          width: "100%",
          marginBottom: 1,
        }}
      >
        {name}
      </Typography>
    );
  };

  return <>{renderName()}</>;
}

export default Cooking;
