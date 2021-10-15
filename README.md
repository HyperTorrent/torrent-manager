# Torrent Manager

## Install
```bash
npm install torrent-manager
```

## Usage :
```javascript
import { Manager, Torrent } from 'torrent-manager';

// Managed
const torrentManager = new Manager();
torrentManager
  .add('magnet:?xt=urn:btih:7c312dd630e216b10e87c82a9624e38eac4bac4b&dn=archlinux-2019.11.01-x86_64.iso&tr=udp://tracker.archlinux.org:6969&tr=http://tracker.archlinux.org:6969/announce');

// Standalone
const torrent = new Torrent('magnet:?xt=urn:btih:7c312dd630e216b10e87c82a9624e38eac4bac4b&dn=archlinux-2019.11.01-x86_64.iso&tr=udp://tracker.archlinux.org:6969&tr=http://tracker.archlinux.org:6969/announce');
```

## API
### Manager
#### Manager(options?)
##### options
###### allowDuplicate
Type : `boolean`
Default: `false`

Throw exception if torrent already exists

###### downloadRate
Type : `number`
Default : `Infinity`

Define the download rate (in bytes), affects all downloads managed by this manager

###### uploadRate
Type : `number`
Default : `Infinity`

Define upload rate (in bytes), affects all uploads managed by this manager

###### retry
Type : `object`
Default :
```json
{
  limit: 0,
}
```

See [got retry options](https://github.com/sindresorhus/got/blob/main/documentation/7-retry.md)
###### timeout
Type : `object`
Default :
```json
{
  request: 5000,
}
```

See [got timeout options](https://github.com/sindresorhus/got/blob/main/documentation/6-timeout.md)

###### defaultTorrentOptions
Type : `object`
Default :
```javascript
{
  peerId: '-HTXXXX-YYYYYYYYYYYY',
  userAgent: 'torrent-manager/${version}'
}
```

Define default torrent options (see [torrent options](#torrentoptions))

#### Properties
##### numPeers
Number of peers for managed torrents

##### progress
Average progression for managed torrents

##### ratio
Average ratio for managed torrents

##### torrents
Return an `array` of managed torrent

#### Methods
##### add(source, options?)
###### source
Type : `Torrent uri <string> | Magnet uri <string> | File path <String>`

###### options
Type : `object`
Default: `{}`

See [torrent options](#torrentoptions)

##### remove(torrentHash)
###### torrentHash
Type : `string`

Stop and remove torrent from manager

##### start(torrentHash)
###### torrentHash
Type : `string`

Start/Resume torrent download

##### Stop(torrentHash)
###### torrentHash
Type : `string`

Stop torrent download

##### check(torrentHash)
###### torrentHash
Type : `string`

Check torrent pieces

##### startAll()
Start/Resume all managed torrents

##### stopAll()
Stop all torrents

##### checkAll()
Check all managed torrents pieces

##### get(torrentHash)
Return a `Torrent` if exists else `undefined`

### Torrent
#### Torrent(source, options?)
##### source
Type : `File content <buffer> | Magnet uri <string> | Torrent parse <object>`

##### options
###### peerId
Type : `string`
Length :`20`
Default: `-TMXXXX-YYYYYYYYYYYY`
`XXXX` base on version
`YYYYYYYYYYYY` randomized

Define peer identifier

###### name
Type : `string`
Default : `torrent-manager`

Define torrent client name (used in [user agent](#useragent))

###### port
Type : `number`
Default : `4242`

Define listening port

###### userAgent
Type : `string`
Default : `${name}/${version}`

Define user agent use to request trackers

###### maxPeers
Type : `number`
Default: `50`

Define maximum peers

###### complete
Type : `boolean`
Default : `false`

Define state ready to share, skip pieces check and set progress to 100%

###### verify
Type : `boolean`
Default : `true`

Skip pieces check, download will start from 0% (unused when set `complete` to `true`)

###### dht
Type : `boolean`
Default: `true`

Use DHT to discover peers

###### dhtPort
Type : `number`
Default: `0`

Define DHT port

###### LSD
Type : `boolean`
Default: `true`

Use local service discovery to discover peers

###### tracker
Type : `boolean`
Default : `true`

Use trackers to discover peers

###### trackers
Type : `Array<string>`
Default : `[]`

Override the list of trackers to announce

###### announce
Type : `Array<string>`
Default : `[]`

Add tracker to existing trackers list to announce

###### speed
Type : `number`
Default : `5`

Define the length of buffer for speed measurement (in seconds)

###### path
Type : `string`
Default : `${torrentPath}/${infoHash}`

Set download path

###### torrentPath
Type : `string`
Default : `${tmpdir}/torrent-manager`

Set download path

###### cache
Type : `boolean`
Default : `true`

Save metadata to torrent file named `${infoHash}.torrent` in `${torrentPath}`

###### downloadRate
Type : `number`
Default : `Infinity`

Set maximum download rate (in bytes)

###### uploadRate
Type : `number`
Default : `Infinity`

Set maximum upload rate (in bytes)

###### blocklist
Type : `Array<string>`
Default : `[]`

Define a blocked ip list

###### autostart
Type : `boolean`
Default : `true`

Define whether torrent will start immediatly

#### Properties
##### infoHash
Type : `string`

Return torrent hash

##### id
Return `infoHash`

##### shortId
Return first `ìnfohash` 8 characters

##### debugId
Return `shortId`

##### metadata
Type : `Object`

Return torrent metadata

##### wires
Type : `Array<Object>`

Return wires known in swarm

##### peers
Type : `Array<Object>`

Return connected peers

##### numPeers
Type : `number`

Return number of connected peers

##### downloaded
Type : `number`

Return downloaded data length (in bytes)

##### downloadSpeed
Type : `number`

Return download speed

##### received
Type : `number`

Return received data length (in bytes)

##### uploaded
Type : `number`

Return uploaded data length (in bytes)

##### uploadSpeed
Type : `number`

Return upload speed

##### progress
Type : `number`

Return progression (between 0 and 1)

##### timeRemaining
Type : `number`

Return remaining time in seconds

##### ratio
Type : `number`

Return ratio downloaded/uploaded

#### Methods
##### check
Check pieces integrity

##### start
Start download

##### stop
Stop Download

##### connect
Add a peer

##### diconnect
Remove a peer

##### reannounce
Force annoucement to tracker outside interval period

##### block(ip)
###### ip
Type : `String`

Block specified ip

##### setDownloadRate(rate)
###### rate
Type : `number`

Set download max speed to `rate` (in bytes)

##### setUploadRate(rate)
###### rate
Type : `number`

Set upload max speed to `rate` (in bytes)