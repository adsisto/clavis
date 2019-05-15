/*
 * Clavis
 * Copyright (c) 2019 Andrew Ying
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation. In addition, this program is also subject to certain
 * additional terms available at <SUPPLEMENT.md>.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import log from 'electron-log';
import { execFileSync } from 'child_process';
import path from 'path';

export const generateKey = (options) => {
  log.debug(
    `Executing command ./bin/helper keys --id ${ options.identity } --type ` +
    `${ options.key } --size ${ options.keySize }`
  );

  try {
    let stdout = execFileSync(
      './bin/helper',
      [ 'keys', '--id', options.identity, '--type', options.key, '--size', options.keySize ],
      { timeout: 10000, cwd: path.resolve(__dirname, '../') }
    );

    const pattern = /Public Key: \[\[ ([A-Za-z0-9+/=]+) ]]/m;
    log.debug(`Received console output:\n${ stdout }`);
    let match = String(stdout).match(pattern);
    log.info('Successfully generated new key pair.');

    return { error: false, publicKey: match[1] };
  } catch (error) {
    log.error(`Failed to generated key pair. Command failed with message: ${ error.toString() }.`);
    return { error: error.toString() };
  }
};

export const generateToken = (options) => {
  log.debug(`Executing command ./bin/helper token --id ${ options.identity } --size 256`);

  try {
    let stdout = execFileSync(
      './bin/helper',
      [ 'token', '--id', options.identity, '--size', 256 ],
      {
        timeout: 10000,
        cwd: path.resolve(__dirname, '../')
      }
    );

    const pattern = /Token: \[\[ ([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+) ]]/m;
    log.debug(`Received console output:\n${ stdout }`);
    let match = String(stdout).match(pattern);

    return { error: false, token: match[1] };
  } catch (error) {
    log.error(`Failed to generated token. Command failed with message: ${ error.toString() }.`);
    return { error: error.toString() };
  }
};
