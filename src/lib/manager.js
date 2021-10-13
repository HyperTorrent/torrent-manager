import { EventEmitter } from 'events';
import debug from 'debug';
import fs from 'fs-extra';
import got from 'got';
import hat from 'hat';
import pascalcase from 'pascalcase';
import pify from 'pify';
import pAll from 'p-all';
import pIf from 'p-if';
import { ThrottleGroup } from 'stream-throttle';
import { name, version } from '#src/lib/package';
import Torrent from '#src/lib/torrent';

const noop = () => {};

export default class Manager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.debug = debug(`${name}:${this.constructor.name}`);
    this.debug('new');

    const defaultTorrentOptions = typeof options.defaultTorrentOptions === 'object'
      ? options.defaultTorrentOptions
      : {};

    const versionStr = version
      .replace(/\d*./g, (v) => `0${v % 100}`.slice(-2))
      .slice(0, 4);
    defaultTorrentOptions.peerId = (
      defaultTorrentOptions.peerId
      && defaultTorrentOptions.peerId.length === 20
    )
      ? defaultTorrentOptions.peerId
      : `-HT${versionStr}-`.concat(hat(48));
    defaultTorrentOptions.userAgent = `${pascalcase(name)}/${version}`;
    this.defaultTorrentOptions = defaultTorrentOptions;

    this.allowDuplicate = typeof options.allowDuplicate === 'boolean'
      ? options.allowDuplicate
      : false;
    this.downloadRate = (
      typeof options.downloadRate === 'number'
      && options.downloadRate > 0
    )
      ? options.downloadRate
      : Number.MAX_SAFE_INTEGER;
    this.uploadRate = (
      typeof options.uploadRate === 'number'
      && options.uploadRate > 0
    )
      ? options.uploadRate
      : Number.MAX_SAFE_INTEGER;

    this.downloadThrottle = new ThrottleGroup({ rate: this.downloadRate });
    this.uploadThrottle = new ThrottleGroup({ rate: this.uploadRate });

    this.torrents = [];
  }

  get numPeers() {
    return this.torrents.reduce((acc, torrent) => acc + torrent.peers.length, 0);
  }

  get progress() {
    return this.torrents.reduce((acc, torrent) => acc + torrent.progress, 0) / this.torrents.length;
  }

  get ratio() {
    return this.torrents.reduce((acc, torrent) => acc + torrent.ratio, 0) / this.torrents.length;
  }

  async add(source, options = {}) {
    this.debug('add');

    return fs.pathExists(source)
      .then(pIf(
        (exsist) => exsist,
        () => fs.readFile(source),
        () => got(source, { responseType: 'buffer' })
          .then(({ body }) => body),
      ))
      .catch(() => source)
      .then((torrentId) => {
        const torrent = new Torrent(torrentId, {
          ...this.defaultTorrentOptions,
          ...options,
          autostart: false,
        });

        const exists = this.get(torrent.infoHash);
        if (exists) {
          if (this.allowDuplicate) return exists;
          throw new Error(`Duplicate torrent ${torrent.infoHash}`);
        }

        torrent.on('wire', (wire, connection) => {
          const downloadLimit = connection.pipe(this.downloadThrottle.throttle());
          downloadLimit.on('data', noop);

          const uploadThrottle = this.uploadThrottle.throttle();
          uploadThrottle.on('data', noop);
          wire.pipe(uploadThrottle);
        });

        if (options.autostart !== false) torrent.start();

        this.torrents.push(torrent);

        return torrent;
      })
      .catch((err) => { this.emit('error', err); });
  }

  async remove(infoHash) {
    this.debug(`remove ${infoHash}`);
    const torrent = this.get(infoHash);

    if (torrent !== null) {
      return torrent.stop()
        .then(() => {
          this.torrents = this.torrents.filter((t) => t.infoHash !== infoHash);
        });
    }

    return undefined;
  }

  async start(infoHash) {
    this.debug('start');

    const foundTorrent = this.get(infoHash);
    return foundTorrent.start();
  }

  async stop(infoHash) {
    this.debug('stop');

    const foundTorrent = this.get(infoHash);
    return foundTorrent.stop();
  }

  async check(infoHash) {
    this.debug('check');

    const foundTorrent = this.get(infoHash);
    return foundTorrent.check();
  }

  async startAll() {
    this.debug('start all');
    return pAll(this.torrents.map((torrent) => () => torrent.start()));
  }

  async stopAll() {
    this.debug('stop all');
    return pAll(this.torrents.map((torrent) => () => torrent.stop()));
  }

  async checkAll() {
    this.debug('verify all');
    this.torrents.forEach((torrent) => { torrent.check(); });
  }

  get(infoHash) {
    return this.torrents.find((torrent) => torrent.id === infoHash);
  }

  setDownloadRate(rate) {
    this.downloadRate = rate;
    this.downloadThrottle.bucket.bucketSize = rate;
    this.downloadThrottle.bucket.tokensPerInterval = rate;
  }

  setUploadRate(rate) {
    this.uploadRate = rate;
    this.uploadThrottle.bucket.bucketSize = rate;
    this.uploadThrottle.bucket.tokensPerInterval = rate;
  }
}
