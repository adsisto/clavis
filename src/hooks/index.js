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

import { useState, useEffect } from 'react';

export function useReady(store) {
  const [ ready, setReady ] = useState(store.get('ready', false));
  useEffect(() => {
    store.set('ready', ready);
  });

  return { ready, setReady };
}

export function useIdentity(store) {
  const [ identity, setIdentity ] = useState(store.get('identity', ''));
  useEffect(() => {
    if (identity !== '') {
      store.set('identity', identity);
    }
  });

  return { identity, setIdentity };
}

export function usePublicKey(store) {
  const [ publicKey, setPublicKey ] = useState(store.get('publicKey', ''));
  useEffect(() => {
    store.set('publicKey', publicKey);
  });

  return { publicKey, setPublicKey };
}
