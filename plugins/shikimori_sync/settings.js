import Utils from "./utils";

function init() {
    Lampa.SettingsApi.addComponent({
        component: 'shikimori_sync',
        icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>
            <line x1="13.0925" y1="2.34874" x2="16.3487" y2="6.90754" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="1.5" y1="-1.5" x2="9.31665" y2="-1.5" transform="matrix(-0.757816 0.652468 0.652468 0.757816 26.197 2)" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <line x1="9.5" y1="34.5" x2="29.5" y2="34.5" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
        name: 'Shikimori Sync',
    });

    function onUrlDataChange() {
        let auth_url = Utils.buildAuthUrl();
        $('#shikimori_sync_qr_img').attr('src', "https://barcode.orcascan.com/?format=jpg&type=qr&data=".concat(encodeURIComponent(auth_url)));
        $('#shikimori_sync_qr_text').text(auth_url);
    }

    function getUserText() {
        let auth_error = Utils.storage_get_anonymously("shikimori_sync_auth_error", '');
        if (auth_error) {
            return "ошибка авторизации, попробуйте еще раз (" + auth_error + ")";
        }
        let name = Utils.storage_get_anonymously("shikimori_sync_user_name", '');
        let id = Utils.storage_get_anonymously("shikimori_sync_user_id", '');
        if (id !== '' && name !== '') {
            return "авторизован : " + name + " (" + id + ")";
        }
        return "введите код авторизации";
    }

    function onUserChange() {

        $("#shikimori_sync_user_text").text(getUserText());
    }

    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            type: 'button'
        },
        field: {
            name: "QR для авторизации"
        },
        onRender: function onRender(e) {
            let auth_url = Utils.buildAuthUrl();
            e.append("<img id='shikimori_sync_qr_img' style='padding-top: 1.5em; padding-bottom: 0.4em;' src=" + "https://barcode.orcascan.com/?format=jpg&type=qr&data=".concat(encodeURIComponent(auth_url)) + " />");
            e.append("<div id='shikimori_sync_qr_text' style='word-wrap: break-word;'>" + auth_url + "</div>");
        },
    });

    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            name: "shikimori_sync_auth_code",
            type: 'input',
            values: "",
            default: "",
            placeholder: ""
        },
        field: {
            name: "Код авторизации (oauth2)"
        },
        onRender: function onRender(e) {
            e.children().eq(1).remove();
            e.append("<div id='shikimori_sync_user_text'>" + getUserText() + "</div>")
        },
        onChange: async function onChange() {
            await Utils.getToken();
            await Utils.getWhoAmI()
                .then(j => {
                    Lampa.Storage.set("shikimori_sync_user_id", j['id'], false);
                    Lampa.Storage.set("shikimori_sync_user_name", j['nickname'], false);
                });
            onUserChange();
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            type: 'title'
        },
        field: {
            name: "Настройки подключения"
        }
    });
    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            name: "shikimori_sync_host",
            type: 'input',
            values: "https://shikimori.one",
            default: "https://shikimori.one",
            placeholder: "пусто, используется https://shikimori.one"
        },
        field: {
            name: "Host"
        },
        onChange: function onChange() {
            onUrlDataChange();
        }
    });
    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            name: "shikimori_sync_client_id",
            type: 'input',
            values: "",
            default: "",
            placeholder: "пусто, используется значение по умолчанию"
        },
        field: {
            name: "Client ID"
        },
        onChange: function onChange() {
            onUrlDataChange();
        }
    });
    Lampa.SettingsApi.addParam({
        component: 'shikimori_sync',
        param: {
            name: "shikimori_sync_client_secret",
            type: 'input',
            values: "",
            default: "",
            placeholder: "пусто, используется значение по умолчанию"
        },
        field: {
            name: "Client Secret"
        }
    });
}

export default {
    init
}