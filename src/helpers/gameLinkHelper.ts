import { BASE_PATH } from "@/globals";

export default class GameLinkHelper
{
    static generateGameUrl(site: string, gameId: string, username: string): string
    {
        const ORIG: string = window.location.origin;

        return `${ORIG}${BASE_PATH}/load-game/${site}/${username}/${gameId}`;
    }
}