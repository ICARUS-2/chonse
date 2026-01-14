import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { pgnFromUrlAtom } from "@/sections/analysis/states";
import { getChessComUserRecentGames } from "@/lib/chessCom";
import { LoadedGame } from "@/types/game";
import { GameOrigin } from "@/types/enums";

export default function LoadGameRedirect()
{
    const router = useRouter();
    const { site, gameId, username } = router.query;
    const setPgnAtom = useSetAtom(pgnFromUrlAtom);

    useEffect( () =>
    {
        if (!site || !gameId || !username)
        {
            return;
        }
        
        const normalizedUsername = Array.isArray(username) ? username[0] : username;
        const normalizedGameId = Array.isArray(gameId) ? gameId[0] : gameId;
        const normalizedSite = Array.isArray(site) ? site[0] : site;

        if (normalizedSite === GameOrigin.ChessCom)
        {
            getChessComUserRecentGames(normalizedUsername).then( (result:LoadedGame[]) =>
            {
                result.forEach( item =>
                {
                    const splitUrl = item.url?.split("/");
                    const idFromUrl = splitUrl?.at(-1);

                    if (idFromUrl === normalizedGameId)
                    {
                        setPgnAtom(item.pgn);
                    }
                }
                 )
            } )
        }
        else
        {
            return;
        }

        router.replace(
            {
                pathname: "/"
            }
        )



    }, [site, gameId, router] )
    return <p>Loading game {username}/{gameId} from {site}</p>
}