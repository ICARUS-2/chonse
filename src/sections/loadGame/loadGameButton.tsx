import { Button, Typography } from "@mui/material";
import { useState } from "react";
import NewGameDialog from "./loadGameDialog";
import { Chess } from "chess.js";
import { useSetAtom } from "jotai";
import { pgnFromUrlAtom } from "../analysis/states";

interface Props {
  setGame?: (game: Chess) => Promise<void>;
  label?: string;
  size?: "small" | "medium" | "large";
}

export default function LoadGameButton({ setGame, label, size }: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const setPgnFromUrlAtom = useSetAtom(pgnFromUrlAtom);

  return (
    <>
      <Button
        variant="contained"
        onClick={() => 
        {
          setOpenDialog(true);

          //Prevents re-running analysis if opened from a game link.
          setPgnFromUrlAtom("");
        }}
        size={size}
      >
        <Typography fontSize="0.9em" fontWeight="500" lineHeight="1.4em">
          {label || "Add game"}
        </Typography>
      </Button>

      <NewGameDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        setGame={setGame}
      />
    </>
  );
}
