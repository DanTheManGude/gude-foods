import CircularProgress from "@mui/material/CircularProgress";

function Loading() {
  return (
    <div style={{ textAlign: "center", paddingTop: "20%" }}>
      <CircularProgress color="primary" size="30%" sx={{ margin: "auto" }} />
    </div>
  );
}

export default Loading;
