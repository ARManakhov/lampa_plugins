import Settings from './settings'
import Listeners from './listenets'

function startPlugin() {
    window.plugin_shikimori_sync_ready = true

    Settings.init();

    Listeners.init()

    //hook for catching episodes
    let old_func = Lampa.Player.play;
    Lampa.Player.play = function (data){
        Lampa.Player.listener.send('start_shikimori', data);
        old_func(data);
    }
}

if (!window.plugin_shikimori_sync_ready) startPlugin()