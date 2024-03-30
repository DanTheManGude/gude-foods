import { PropsWithChildren } from "react";

import Typography from "@mui/material/Typography";

function PageTitle(props: PropsWithChildren) {
  return (
    <Typography
      variant="h4"
      sx={{
        color: "primary.main",
        textAlign: "center",
        paddingTop: 2,
      }}
    >
      {props.children}
    </Typography>
  );
}

export default PageTitle;
