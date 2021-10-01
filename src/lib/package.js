import fs from 'fs-extra';

const { name, version } = fs.readJSONSync(new URL('../../package.json', import.meta.url));

export default { name, version };
export { name, version };
