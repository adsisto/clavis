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

import React, { useState, useEffect } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { useIdentity, usePublicKey, useReady } from "../hooks";

function Setup(props) {
  const store = props.store;

  const { ready, setReady } = useReady(store);
  const { identity, setIdentity } = useIdentity(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  const RSAOptions = [ "1024", "2048", "5094" ];
  const ECOptions = [ "224", "256", "384", "521" ];
  const [ keySizeOptions, setKeySizeOptions ] = useState(RSAOptions);

  const [ key, setKey ] = useState("RSA");
  useEffect(() => {
    switch (key) {
      case "RSA":
        setKeySizeOptions(RSAOptions);
        setKeySize("2048");
        break;
      case "EC":
        setKeySizeOptions(ECOptions);
        setKeySize("256");
        break;
      default:
        console.error("Invalid key type \"" + key + "\" selected.");
    }
  }, [ key ]);
  const [ keySize, setKeySize ] = useState("2048");


  const onIdentityChange = (e) => {
    setIdentity(e.target.value);
  };
  const onKeyChange = (e) => {
    setKey(e.target.value);
  };
  const onKeySizeChange = (e) => {
    setKeySize(e.target.value);
  };

  if (ready) {
    return (
      <Redirect to="/home" />
    )
  }

  return (
    <div>
      <header>
        Set-up – Calvis
      </header>
      <div className="content">
        <h3>Set-up Private Keys</h3>
        <div className="form-group">
          <label>Identity</label>
          <input className="form-item" type="text" name="identity"
                 value={ identity } onChange={ onIdentityChange } />
        </div>
        <div className="form-group">
          <label>Key Type</label>
          <select className="form-item" name="key" value={ key }
                  onChange={ onKeyChange }>
            <option value="RSA">RSA</option>
            <option value="EC">Elliptic Curve</option>
          </select>
        </div>
        <div className="form-group">
          <label>Key Size</label>
          <select className="form-item" name="key-size" value={ keySize }
                  onChange={ onKeySizeChange }>
            { keySizeOptions.map((item) =>
              <option key={ item } value={ item }>{ item }</option>
            )}
          </select>
        </div>
        <button className="button">Next</button>
      </div>
    </div>
  )
}

export default withRouter(Setup)