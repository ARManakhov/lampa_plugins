import Settings from './settings'
import Listeners from './listenets'

function startPlugin() {
    window.plugin_shikimori_sync_ready = true

    Settings.init();

    Listeners.init()
}

if (!window.plugin_shikimori_sync_ready) startPlugin()