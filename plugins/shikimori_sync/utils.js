function storage_get_anonymously(name, defaults) {
    return Lampa.Storage.get(name, '') || defaults;
}

//todo inject default variables on build with env vars
function get_client_id() {
    return storage_get_anonymously('shikimori_sync_client_id', "sqXB8hHfNwwpikc4Pc6bCtFK57VWAEKddpXyQFR0pag");
}

function get_client_secret() {
    return storage_get_anonymously('shikimori_sync_client_secret', "i7Vl3kKwfO9QvrwTxSr4e3ZAdViZjv-o_hOtVxfu4fs");
}

function get_host() {
    return Lampa.Storage.get("shikimori_sync_host", "https://shikimori.one");
}

async function tokenRequest(form) {
    await fetch(get_host() + '/oauth/token', {
        method: 'POST',
        body: form
    })
        .then(r => {
            if (r.ok) {
                return r.json();
            }
            throw new Error("" + r.status);
        })
        .then(j => {
            Lampa.Storage.set("shikimori_sync_access_token", j["access_token"], false);
            Lampa.Storage.set("shikimori_sync_refresh_token", j['refresh_token'], false);
            Lampa.Storage.set("shikimori_sync_token_expire", j['expires_in'] + j['created_at'], false);
            Lampa.Storage.set("shikimori_sync_auth_error", '', false);
        })
        .catch(e => {
            Lampa.Storage.set("shikimori_sync_auth_error", e.message, false);
        });
}

async function getToken() {
    const form = new FormData();
    form.append('grant_type', 'authorization_code');
    form.append('client_id', get_client_id());
    form.append('client_secret', get_client_secret());
    form.append('code', Lampa.Storage.get('shikimori_sync_auth_code', ""));
    form.append('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob');

    await tokenRequest(form);
}

async function checkAndUpdateToken() {
    if (Math.floor(Date.now() / 1000) > storage_get_anonymously("shikimori_sync_token_expire", 0)) {
        const form = new FormData();
        form.append('grant_type', 'refresh_token');
        form.append('client_id', get_client_id());
        form.append('client_secret', get_client_secret());
        form.append('refresh_token', Lampa.Storage.get("shikimori_sync_access_token", undefined));

        await tokenRequest(form);
    }
}

async function getWhoAmI() {
    await checkAndUpdateToken();
    return fetch(get_host() + '/api/users/whoami', {
        headers: {
            'Authorization': 'Bearer '.concat(Lampa.Storage.get("shikimori_sync_access_token", undefined))
        }
    })
        .then(r => r.json())
}

function findAnime(query) {
    return fetch(get_host() + '/api/animes?limit=1&search='.concat(encodeURIComponent(query)))
        .then(r => r.json())
}

async function setUserRate(episode, status, target) {
    await checkAndUpdateToken();
    let accessToken = Lampa.Storage.get("shikimori_sync_access_token", undefined);

    return fetch(get_host() + '/api/v2/user_rates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer '.concat(accessToken),
        },
        body: JSON.stringify({
            user_rate: {
                episodes: episode,
                status: status,
                target_id: target,
                target_type: "Anime",
                user_id: storage_get_anonymously("shikimori_sync_user_id", ''),
            }
        })
    })
}

function buildAuthUrl() {
    return get_host()
        + "/oauth/authorize?client_id="
        + get_client_id()
        + "&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=user_rates";
}


export default {
    buildAuthUrl,
    storage_get_anonymously,
    getToken,
    getWhoAmI,
    findAnime,
    setUserRate
}