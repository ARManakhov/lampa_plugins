import Utils from "./utils";

function init() {
    let currently_playing = {suitable: false}

    async function sendUserStats() {
        let shikimori_id = await currently_playing.shikimori_id;
        await Utils.setUserRate(currently_playing.episode,
            currently_playing.episode === currently_playing.total_episodes ? "complete" : "watching",
            shikimori_id);
    }

    Lampa.PlayerVideo.listener.follow('timeupdate', function (e) {
        currently_playing.progress = (e.current / e.duration * 100);
    });
    Lampa.Favorite.listener.follow('add,added', function (e) {
        console.log("shikimori_sync: added event ", e);
        if (e.where === 'history' && e.card.keywords.results.some(kw => kw.name = 'anime')) {
            console.log(e.card);
            currently_playing.suitable = true;
            currently_playing.original_title = e.card.original_title;
            currently_playing.shikimori_id = Utils.findAnime(currently_playing.original_title)
                .then(d => d[0].id)
            currently_playing.total_episodes = e.card.number_of_episodes;
        } else {
            currently_playing.suitable = false;
        }
    });
    Lampa.Player.listener.follow('start_shikimori', async function (e) {
        console.log("shikimori_sync: player start ", e);
        if (currently_playing.suitable) {
            currently_playing.season = e.season;
            currently_playing.episode = e.episode - 1;
            await sendUserStats();
        }
    });
    Lampa.Player.listener.follow('destroy', async function (e) {
        console.log("shikimori_sync: player destroy ", e);
        if (currently_playing.suitable && currently_playing.progress > 85) {
            currently_playing.episode += 1;
            await sendUserStats();
        }
        currently_playing = {suitable: false}
    });
}

export default {
    init
}