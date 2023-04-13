import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { AddAlertContext } from "../Contexts";

function ImportFileButton(props) {
  const {
    onSuccess,
    onFailure,
    buttonProps = {},
    buttonText = "Import",
    typographyProps = {},
    id,
  } = props;
  const addAlert = useContext(AddAlertContext);

  const inputId = `import-file-button-${id}`;

  const handeFileImport = (file) => {
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = () => {
      const data = JSON.parse(reader.result);

      onSuccess(data);
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
