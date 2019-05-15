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

import './css/app';

import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { render } from 'react-dom';
import Store from 'electron-store';
import Home from './components/Home';
import Setup from './components/Setup';

function App() {
  const storeSchema = {
    ready: { type: 'boolean', default: false },
    startOnBoot: { type: 'boolean', default: true },
    hiddenOnStart: { type: 'boolean', default: true },
    identity: { type: 'string' },
    publicKey: { type: 'string' },
    hotKey: { type: 'string' }
  };
  const store = new Store({
    schema: storeSchema
  });

  return (
    <Router>
      <div>
        <Route exact path="/" render={ (props) => <Home { ...props } store={ store }/> }/>
        <Route path="/home" render={ (props) => <Home { ...props } store={ store }/> }/>
        <Route path="/setup" render={ (props) => <Setup { ...props } store={ store }/> }/>
      </div>
    </Router>
  );
}

const MOUNT_NODE = document.getElementById('app');
render(<App/>, MOUNT_NODE);
