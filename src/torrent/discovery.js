import TorrentDiscovery from 'torrent-discovery';

export default class Discovery extends TorrentDiscovery {
  update() {
    if (this.dht) this._dhtAnnounce(); // eslint-disable-line no-underscore-dangle
    if (this.tracker) this.tracker.update();
  }
}
