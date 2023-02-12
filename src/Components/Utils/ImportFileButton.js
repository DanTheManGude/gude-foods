import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function ImportFileButton(props) {
  const {
    handeFileImport,
    buttonProps = {},
    buttonText = "Import",
    typographyProps = {},
    id,
  } = props;
  const inputId = `import-file-button-${id}`;
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
        <Button {...buttonProps}>
          <Typography {...typographyProps}>{buttonText}</Typography>
        </Button>
      </label>
    </>
  );
}

export default ImportFileButton;
