import CircularProgress from "@mui/material/CircularProgress";

function Loading() {
  return (
    <div style={{ textAlign: "center", paddingTop: "100px" }}>
      <CircularProgress
        color="primary"
        size="30%"
        sx={{ margin: "auto", maxWidth: "300px" }}
      />
    </div>
  );
}

export default Loading;
