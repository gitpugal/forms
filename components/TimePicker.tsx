import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

export default function BasicTimePicker({
  onChange,
  value,
  name,
  disabled,
}: any) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        // label="Basic time picker"
        disabled={disabled}
        value={value}
        name={name}
        onChange={(e: any) => {
          console.log(e);
          onChange({
            target: {
              name: name,
              value: e,
            },
          });
        }}
      />
    </LocalizationProvider>
  );
}
