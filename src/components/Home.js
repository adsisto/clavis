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

import React, { useState } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useIdentity, usePublicKey, useReady } from '../hooks';
import { clipboard, ipcRenderer } from 'electron';
import log from 'electron-log';

import Collapse from './icons/Collapse';
import Expand from './icons/Expand';
import Copy from './icons/Copy';

function Home(props) {
  const store = props.store;

  const { ready, setReady } = useReady(store);
  const { identity, setIdentity } = useIdentity(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  const [ loading, setLoading ] = useState(false);

  const [ expanded, setExpanded ] = useState(false);
  const [ placeholder, setPlaceholder ] = useState(
    '<small>Click for</small><br />Authentication Token'
  );
  const [ token, setToken ] = useState('');

  const toggleIdentity = () => {
    setExpanded(!expanded);
  };

  const copyKey = () => {
    clipboard.writeText(publicKey);
  };

  const generateToken = (e) => {
    e.preventDefault();
    if (loading) {
      return;
    }

    setPlaceholder('Generating token...');
    setLoading(true);

    ipcRenderer.send('token-request', {
      identity: identity
    });
  };

  ipcRenderer.on('token-receive', (event, message) => {
    if (message.error) {
      setPlaceholder('<small>Click for</small><br />Authentication Token');
      setLoading(false);
      return;
    }

    setToken(message.token);
    setTimeout(() => {
      log.info('Authentication token expired.');
      setToken('');
      setPlaceholder('<small>Click for</small><br />Authentication Token');
    }, 30000);
    setLoading(false);
  });

  if (!ready) {
    return (
      <Redirect to="/setup"/>
    );
  }

  return (
    <div>
      <header>
        Clavis
      </header>
      <div className="content-container">
        <div className="content">
          <div className="identity">
            <div onClick={ toggleIdentity }>
              <span className="identity-description">Identity</span>
              <h3 className="identity-text">{ identity }</h3>
              { expanded ? <Collapse className="identity-button" fill="#124a4e"/>
                : <Expand className="identity-button" fill="#124a4e"/> }
            </div>
            <div className={ expanded ? 'public-key-expanded' : 'public-key' } onClick={ copyKey }>
              <span className="identity-description">Public Key</span><br/>
              <span className="public-key-text">{ publicKey }</span>
              <Copy className="public-key-button" fill="#124a4e"/>
            </div>
          </div>
          <div className="token">
            <textarea className="token-field" rows="5" value={ token } readOnly/>
            { token !== '' ? '' : <div className="token-placeholder" onClick={ generateToken }>
              <span dangerouslySetInnerHTML={ { __html: placeholder } }/>
            </div> }
          </div>
        </div>
      </div>
    </div>
  );
}

Home.propTypes = {
  store: PropTypes.object.isRequired
};

export default withRouter(Home);
