"use client";

import { Button } from "@fluentui/react-components";
import { Print20Regular } from "@fluentui/react-icons";

export default function LaunchKitPrintButton() {
  return (
    <Button
      type="button"
      appearance="primary"
      size="large"
      icon={<Print20Regular />}
      className="no-print"
      onClick={() => window.print()}
    >
      Print or save PDF
    </Button>
  );
}
