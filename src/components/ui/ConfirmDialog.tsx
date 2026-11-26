"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  makeStyles,
  Spinner,
  tokens,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  danger: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: "#ffffff",
    ":hover": {
      backgroundColor: tokens.colorPaletteRedForeground1,
      color: "#ffffff",
    },
    ":hover:active": {
      backgroundColor: tokens.colorPaletteRedForeground1,
      color: "#ffffff",
    },
  },
});

export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Delete",
  danger = true,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const s = useStyles();
  return (
    <Dialog
      open={open}
      modalType="alert"
      onOpenChange={(_, data) => {
        if (!data.open && !busy) onCancel();
      }}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{children}</DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onConfirm}
              disabled={busy}
              icon={busy ? <Spinner size="tiny" /> : undefined}
              className={danger ? s.danger : undefined}
            >
              {confirmLabel}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
