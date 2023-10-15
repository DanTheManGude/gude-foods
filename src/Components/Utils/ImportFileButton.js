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
    shouldUseCustomHandler = false,
    customHandler = () => {},
    isForRecipe = false,
    onFailure,
    buttonProps = {},
    buttonText = "Import",
    typographyProps = {},
    containerProps = {},
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
    if (shouldUseCustomHandler) {
      customHandler(importedData);
      return;
    }

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
        message: <Typography>{reader.error}</Typography>,
        title: <Typography>Error with importing file</Typography>,
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
      <label htmlFor={inputId} {...containerProps}>
        <Button {...buttonProps} component="span">
          <Typography {...typographyProps}>{buttonText}</Typography>
        </Button>
      </label>
    </>
  );
}

export default ImportFileButton;
