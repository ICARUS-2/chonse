import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { loadGameIdAtom, loadGameSiteAtom } from "@/sections/analysis/states";

export default function LoadGameRedirect()
{
    const router = useRouter();

    //load game site (URL)
    const [lgSite, setLgSite] = useAtom(loadGameSiteAtom);

    //load game ID (URL)
    const [lgId, setLgId] = useAtom(loadGameIdAtom)

    const { site, gameId } = router.query;
    const normalizedSite = Array.isArray(site) ? site[0] : site;
    const normalizedGameId = Array.isArray(gameId) ? gameId[0] : gameId;

    useEffect( () =>
    {
        if (!normalizedSite || !normalizedGameId)
        {
            return;
        }

        setLgSite(normalizedSite);
        setLgId(normalizedGameId);

        router.replace(
            {
                pathname: "/"
            }
        )



    }, [site, gameId, router] )

    return <p>Loading game {gameId} from {site}</p>
}