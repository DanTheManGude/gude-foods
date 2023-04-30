import { useContext } from "react";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { DatabaseContext } from "../Contexts";

function DepartmentFormControl(props) {
  const { disabled, id, value, onChange } = props;

  const database = useContext(DatabaseContext);
  const { glossary, basicFoodTagOrder } = database;

  return (
    <FormControl
      size="small"
      variant="standard"
      sx={{ width: "110px" }}
      disabled={disabled}
    >
      {value ? null : (
        <InputLabel id={id} style={{ top: "-11px" }}>
          Dept.
        </InputLabel>
      )}
      <Select
        labelId={id}
        id={id}
        value={value || ""}
        onChange={onChange}
        xs={{ marginTop: 0, paddingTop: "5px" }}
      >
        {(glossary && glossary.basicFoodTags && basicFoodTagOrder
          ? basicFoodTagOrder.map((basicFoodTagKey) => (
              <MenuItem value={basicFoodTagKey} key={basicFoodTagKey}>
                {glossary.basicFoodTags[basicFoodTagKey]}
              </MenuItem>
            ))
          : []
        ).concat(
          <MenuItem value={""} key={"delete"}>
            <em>None</em>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
}

export default DepartmentFormControl;
