import Image from "next/image"

interface Props
{
    backgroundColor: string;
    boardSize: number,
    iconSrc: string
}

export default function EndIcon(props: Props) {
  return (
    <>
        {/*background layer */}
        <div
        className="fade-out-bg"
        style={{
            position: "absolute",
            inset: 0,              // fills the entire square
            backgroundColor: props.backgroundColor, 
            zIndex: 90
        }}
        />

        {/* Checkmate icon */}
        <Image 
        className="move-up-right-shrink"
        src={props.iconSrc}
        alt="end icon"
        width={props.boardSize / 8}
        height={props.boardSize / 8}
        style={{
            position: "absolute",
            zIndex: 100
        }}
        />
    </>
  )
}