import { CurrentPosition } from "@/types/eval";
import { MoveClassification } from "@/types/enums";
import { PrimitiveAtom, atom, useAtomValue } from "jotai";
import Image from "next/image";
import { CSSProperties, forwardRef, useMemo } from "react";
import {
  CustomSquareProps,
  Square,
} from "react-chessboard/dist/chessboard/types";
import { CLASSIFICATION_COLORS } from "@/constants";
import { boardHueAtom } from "./states";

//For game end markers
import { boardAtom } from "@/sections/analysis/states";
import { Piece } from "react-chessboard/dist/chessboard/types";
import { Color } from "@/types/enums";
import EndIcon from "./endIcon";


export interface Props {
  currentPositionAtom: PrimitiveAtom<CurrentPosition>;
  clickedSquaresAtom: PrimitiveAtom<Square[]>;
  playableSquaresAtom: PrimitiveAtom<Square[]>;
  showPlayerMoveIconAtom?: PrimitiveAtom<boolean>;
  boardSize: number;
}

export function getSquareRenderer({
  currentPositionAtom,
  clickedSquaresAtom,
  playableSquaresAtom,
  showPlayerMoveIconAtom = atom(false),
  boardSize,
}: Props) {
  const squareRenderer = forwardRef<HTMLDivElement, CustomSquareProps>(
    (props, ref) => {
      const { children, square, style } = props;
      const showPlayerMoveIcon = useAtomValue(showPlayerMoveIconAtom);
      const position = useAtomValue(currentPositionAtom);
      const clickedSquares = useAtomValue(clickedSquaresAtom);
      const playableSquares = useAtomValue(playableSquaresAtom);
      const boardHue = useAtomValue(boardHueAtom);

      const fromSquare = position.lastMove?.from;
      const toSquare = position.lastMove?.to;
      const moveClassification = position?.eval?.moveClassification;

      const board = useAtomValue(boardAtom);

      const highlightSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          clickedSquares.includes(square)
            ? rightClickSquareStyle
            : fromSquare === square || toSquare === square
              ? previousMoveSquareStyle(moveClassification)
              : undefined,
        [clickedSquares, square, fromSquare, toSquare, moveClassification]
      );

      const playableSquareStyle: CSSProperties | undefined = useMemo(
        () =>
          playableSquares.includes(square) ? playableSquareStyles : undefined,
        [playableSquares, square]
      );

      let whiteKing: Square = board.findPiece({color: "w", type: "k"})[0];
      let blackKing: Square = board.findPiece({color: "b", type: "k"})[0];
      let loser = board.turn();

      return (
        <div
          ref={ref}
          style={{
            ...style,
            position: "relative",
            filter: boardHue ? `hue-rotate(-${boardHue}deg)` : undefined
          }}
        >
          {children}
          {highlightSquareStyle && <div style={highlightSquareStyle} />}
          {playableSquareStyle && <div style={playableSquareStyle} />}
          {moveClassification && showPlayerMoveIcon && square === toSquare && (
            <Image
              src={`icons/${moveClassification}.png`}
              alt="move-icon"
              width={Math.min(40, boardSize * 0.06)}
              height={Math.min(40, boardSize * 0.06)}
              style={{
                position: "absolute",
                top: Math.max(-13.5, boardSize * -0.03) + "px",
                right: Math.max(-13.5, boardSize * -0.03) + "px",
                zIndex: 100,
              }}
            />
          )}


          {/*Renders white king corresponding icon in the event of checkmate*/}
          {board.isCheckmate() && square === whiteKing && (
            <EndIcon 
              iconSrc={loser === Color.White ? "icons/checkmate.webp" : "icons/winner.webp"} 
              backgroundColor={loser === Color.White ? "red" : "limegreen"} 
              boardSize={boardSize} />
          )}

          {/*Renders black king corresponding icon in the event of checkmate*/}
          {board.isCheckmate() && square === blackKing && (
            <EndIcon 
              iconSrc={loser === Color.Black ? "icons/checkmate.webp" : "icons/winner.webp"} 
              backgroundColor={loser === Color.Black ? "red" : "limegreen"} 
              boardSize={boardSize} />
          )}
        </div>
      );
    }
  );

  squareRenderer.displayName = "SquareRenderer";

  return squareRenderer;
}

const rightClickSquareStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "#eb6150",
  opacity: "0.8",
};

const playableSquareStyles: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,.14)",
  padding: "35%",
  backgroundClip: "content-box",
  borderRadius: "50%",
  boxSizing: "border-box",
};

const previousMoveSquareStyle = (
  moveClassification?: MoveClassification
): CSSProperties => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backgroundColor: moveClassification
    ? CLASSIFICATION_COLORS[moveClassification]
    : "#fad541",
  opacity: 0.5,
});
