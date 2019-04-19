/*
 * Clavis
 * Copyright (c) 2019 Andrew Ying
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of version 3 of the GNU General Public License as published by the
 * Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import { withRouter, Redirect } from "react-router-dom";
import { useIdentity, usePublicKey, useReady } from "../hooks";
import { clipboard } from "electron";

function Home(props) {
  const store = props.store;

  const { ready, setReady } = useReady(store);
  const { identity, setIdentity } = useIdentity(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  const copyKey = () => {
    clipboard.writeText(publicKey);
  };

  if (!ready) {
    return (
      <Redirect to="/setup" />
    )
  }

  return (
    <div>
      <header>
        Calvis
      </header>
      <div className="content-container">
      <div className="content">
        <div className="identity">
          <span className="identity-description">Identity</span>
          <h3 className="identity-text">{ identity }</h3>
        </div>
        <div className="public-key" onClick={ copyKey }>
          { publicKey }
        </div>
      </div>
      </div>
    </div>
  )
}

export default withRouter(Home);
