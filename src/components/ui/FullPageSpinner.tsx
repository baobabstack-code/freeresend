"use client";

import { makeStyles, Spinner } from "@fluentui/react-components";
import { site } from "@/config/site";

const useStyles = makeStyles({
  root: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function FullPageSpinner({ label = `Loading ${site.name}…` }: { label?: string }) {
  const s = useStyles();
  return (
    <div className={s.root}>
      <Spinner size="large" label={label} labelPosition="below" />
    </div>
  );
}
