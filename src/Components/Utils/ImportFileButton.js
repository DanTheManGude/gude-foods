import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { transformCookbookFromImport } from "../../utils/dataTransfer";
import { updateFromCookbookImport } from "../../utils/requests";

import {
  DatabaseContext,
  DataPathsContext,
  AddAlertContext,
} from "../Contexts";

function ImportFileButton(props) {
  const {
    isForRecipe = false,
    onFailure,
    buttonProps = {},
    buttonText = "Import",
    typographyProps = {},
    id,
  } = props;
  const inputId = `import-file-button-${id}`;

  let navigate = useNavigate();

  const addAlert = useContext(AddAlertContext);

  const database = useContext(DatabaseContext);
  const { glossary: _glossary, recipeOrder: _recipeOrder } = database;
  const glossary = _glossary || { basicFoods: {}, recipeTags: {} };
  const recipeOrder = _recipeOrder || [];

  const dataPaths = useContext(DataPathsContext);
  const { glossaryPath, cookbookPath } = dataPaths;

  const handleImportedData = (importedData) => {
    const importedCookbook = isForRecipe
      ? { recipe: importedData }
      : importedData;

    const transformedData = transformCookbookFromImport(
      importedCookbook,
      glossary,
      glossaryPath,
      cookbookPath
    );

    const updateHandler = (alert) => {
      if (isForRecipe) {
        navigate(
          `/recipe/${Object.keys(transformedData.formattedCookbook)[0]}`
        );
      }

      addAlert(alert);
    };

    updateFromCookbookImport(
      transformedData,
      dataPaths,
      recipeOrder,
      updateHandler
    );
  };

  const handeFileImport = (file) => {
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      const data = JSON.parse(reader.result);

      handleImportedData(data);
    };

    reader.onerror = () => {
      if (onFailure) {
        onFailure();
        return;
      }

      addAlert({
        message: reader.error,
        title: "Error with importing file",
        alertProps: { severity: "error" },
      });
    };
  };
  return (
    <>
      <input
        accept=".json"
        style={{ display: "none" }}
        id={inputId}
        type="file"
        onChange={(event) => {
          handeFileImport(event.target.files[0]);
        }}
      />
      <label htmlFor={inputId}>
        <Button {...buttonProps} component="span">
          <Typography {...typographyProps}>{buttonText}</Typography>
        </Button>
      </label>
    </>
  );
}

export default ImportFileButton;
