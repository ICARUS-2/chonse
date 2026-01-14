import { useGameDatabase } from "@/hooks/useGameDatabase";
import { getGameFromPgn } from "@/lib/chess";
import { GameOrigin } from "@/types/enums";
import {
  MenuItem,
  Select,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  OutlinedInput,
  DialogActions,
  Grid2 as Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import { setContext as setSentryContext } from "@sentry/react";
import { Chess } from "chess.js";
import { useEffect, useRef, useState } from "react";
import GamePgnInput from "./gamePgnInput";
import ChessComInput from "./chessComInput";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import LichessInput from "./lichessInput";
import { useSetAtom } from "jotai";
import { boardOrientationAtom } from "../analysis/states";
import { useRouter } from "next/router";
import { getChessComUserRecentGames } from "@/lib/chessCom";
import { LoadedGame } from "@/types/game";

interface Props {
  open: boolean;
  onClose: () => void;
  setGame?: (game: Chess) => Promise<void>;
}

export default function NewGameDialog({ open, onClose, setGame }: Props) {
  const [pgn, setPgn] = useState("");
  const [gameOrigin, setGameOrigin] = useLocalStorage(
    "preferred-game-origin",
    GameOrigin.ChessCom
  );
  const [parsingError, setParsingError] = useState("");
  const parsingErrorTimeout = useRef<NodeJS.Timeout | null>(null);
  const setBoardOrientation = useSetAtom(boardOrientationAtom);
  const { addGame } = useGameDatabase();
  const router = useRouter();

  const handleAddGame = async (pgn: string, boardOrientation?: boolean) => {
    if (!pgn) return;

    try {
      const gameToAdd = getGameFromPgn(pgn);
      setSentryContext("loadedGame", { pgn });

      if (setGame) {
        await setGame(gameToAdd);
      } else {
        await addGame(gameToAdd);
      }

      setBoardOrientation(boardOrientation ?? true);
      handleClose();
    } catch (error) {
      console.error(error);

      if (parsingErrorTimeout.current) {
        clearTimeout(parsingErrorTimeout.current);
      }

      setParsingError(
        error instanceof Error
          ? `${error.message} !`
          : "Invalid PGN: unknown error !"
      );

      parsingErrorTimeout.current = setTimeout(() => {
        setParsingError("");
      }, 3000);
    }
  };

  const handleClose = () => {
    setPgn("");
    setParsingError("");
    if (parsingErrorTimeout.current) {
      clearTimeout(parsingErrorTimeout.current);
    }
    onClose();
  };

  //HACK TO GET THE GAME TO LOAD FROM URL
  useEffect( () =>
  {
    const { site, gameId, username } = router.query;
    
    if (!site || !gameId || !username)
    {
        return;
    }

    const normalizedUsername = Array.isArray(username) ? username[0] : username;
    const normalizedGameId = Array.isArray(gameId) ? gameId[0] : gameId;
    const normalizedSite = Array.isArray(site) ? site[0] : site;
    let pgnFromUrl = "";
    if (normalizedSite === "chesscom")
    {
        getChessComUserRecentGames(normalizedUsername).then( (result:LoadedGame[]) =>
        {
            result.forEach( item =>
            {
                const splitUrl = item.url?.split("/");
                const idFromUrl = splitUrl?.at(-1);

                if (idFromUrl === normalizedGameId)
                {
                  pgnFromUrl = item.pgn;
                  setPgn(pgnFromUrl);
                  handleAddGame(pgnFromUrl);
                }
            }
              )
        } )
    }
    else
    {
        return;
    }
  }, [router.isReady] )
  //

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            position: "fixed",
            top: 0,
            width: "calc(100% - 10px)",
            marginY: { xs: "3vh", sm: 5 },
            maxHeight: { xs: "calc(100% - 5vh)", sm: "calc(100% - 64px)" },
          },
        },
      }}
    >
      <DialogTitle marginY={1} variant="h5">
        {setGame ? "Load a game" : "Add a game to your database"}
      </DialogTitle>
      <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
        <Grid
          container
          marginTop={1}
          alignItems="center"
          justifyContent="start"
          rowGap={2}
        >
          <FormControl sx={{ my: 1, mr: 2, width: 150 }}>
            <InputLabel id="dialog-select-label">Game origin</InputLabel>
            <Select
              labelId="dialog-select-label"
              id="dialog-select"
              displayEmpty
              input={<OutlinedInput label="Game origin" />}
              value={gameOrigin ?? ""}
              onChange={(e) => {
                setGameOrigin(e.target.value as GameOrigin);
                setParsingError("");
              }}
            >
              {Object.entries(gameOriginLabel).map(([origin, label]) => (
                <MenuItem key={origin} value={origin}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {gameOrigin === GameOrigin.Pgn && (
            <GamePgnInput pgn={pgn} setPgn={setPgn} />
          )}

          {gameOrigin === GameOrigin.ChessCom && (
            <ChessComInput onSelect={handleAddGame} />
          )}

          {gameOrigin === GameOrigin.Lichess && (
            <LichessInput onSelect={handleAddGame} />
          )}

          <Snackbar open={!!parsingError}>
            <Alert
              onClose={() => setParsingError("")}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {parsingError}
            </Alert>
          </Snackbar>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ m: 2 }}>
        <Button variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        {gameOrigin === GameOrigin.Pgn && (
          <Button
            variant="contained"
            sx={{ marginLeft: 2 }}
            onClick={() => {
              handleAddGame(pgn);
            }}
          >
            Add
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

const gameOriginLabel: Record<GameOrigin, string> = {
  [GameOrigin.ChessCom]: "Chess.com",
  [GameOrigin.Lichess]: "Lichess.org",
  [GameOrigin.Pgn]: "PGN",
};