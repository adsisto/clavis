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

import React, { useState, useEffect } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { validate } from "validate.js";
import { useIdentity, usePublicKey, useReady } from "../hooks";
import log from "electron-log";
import path from "path";
import { execFile } from "child_process";

function Setup(props) {
  const store = props.store;

  const [ redirect, setRedirect ] = useState(undefined);
  const [ loading, setLoading ] = useState(undefined);
  const [ error, setError ] = useState(undefined);

  const RSAOptions = [ "1024", "2048", "5094" ];
  const ECOptions = [ "224", "256", "384", "521" ];
  const [ keySizeOptions, setKeySizeOptions ] = useState(RSAOptions);

  const constraints = {
    identity: {
      presence: {
        allowEmpty: false
      },
      email: true
    },
    key: {
      inclusion: {
        within: [ "RSA", "EC" ]
      }
    },
    keySize: {
      inclusion: {
        within: keySizeOptions
      }
    }
  };

  const { ready, setReady } = useReady(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  const { identity, setIdentity } = useIdentity(store);
  const [ identityError, setIdentityError ] = useState(undefined);

  const [ key, setKey ] = useState("RSA");
  const [ keyError, setKeyError ] = useState(undefined);
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
    }
  }, [ key ]);

  const [ keySize, setKeySize ] = useState("2048");
  const [ keySizeError, setKeySizeError ] = useState(undefined);

  const errorRender = (field, error) => {
    return error
      ? <span className="form-error-message">{ field } { error[0] }</span>
      : "";
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading("Generating keys...");
    log.debug(`Executing command ./bin/helper keys --id ${identity} --type ${key} --size ${keySize}`);
    execFile(
      "./bin/helper",
      ["keys", "--id", identity, "--type", key, "--size", keySize],
      {
        timeout: 10000,
        cwd: path.resolve(__dirname, '../')
      },
      (err, stdout, stderr) => {
        if (err) {
          setLoading(undefined);

          log.error(`Failed to generated key pair. Command failed with exit code ${err.code}.`);
          log.debug(`Command output was:\n${stdout}${stderr}`);
          setError("Failed to generate keys. Please try again.");

          return;
        }

        setLoading("Checking generated keys...");
        const pattern = /Public Key: \[\[ ([A-Za-z0-9+\/=]+) \]\]/m;
        log.debug(`Received console output:\n${stdout}`);
        let match = String(stdout).match(pattern);

        setPublicKey(match[1]);
        log.info("Successfully generated new key pair.");

        setReady(true);
      }
    )
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
      <div className="content-container">
      <div className="content">
        <h3>Set-up Private Keys</h3>
        { error ? <div className="error">{ error }</div> : "" }
        <div className={ identityError ? "form-group form-error" : "form-group" }>
          <label>Identity</label>
          <input className="form-item" type="text" name="identity"
            value={ identity } onChange={ (e) => setIdentity(e.target.value) }
            onBlur={ () => setIdentityError(validate.single(identity, constraints.identity)) } />
        </div>
        { errorRender("Identity", identityError) }
        <div className={ keyError ? "form-group form-error" : "form-group" }>
          <label>Key Type</label>
          <select className="form-item" name="key" value={ key }
            onChange={ (e) => setKey(e.target.value) }
            onBlur={ () => setKeyError(validate.single(key, constraints.key)) }>
            <option value="RSA">RSA</option>
            <option value="EC">Elliptic Curve</option>
          </select>
        </div>
        { errorRender("Key type", keyError) }
        <div className={ keySizeError ? "form-group form-error" : "form-group" }>
          <label>Key Size</label>
          <select className="form-item" name="key-size" value={ keySize }
            onChange={ (e) => setKeySize(e.target.value) }
            onBlur={ () => setKeySizeError(validate.single(keySize, constraints.keySize)) }>
            { keySizeOptions.map((item) =>
              <option key={ item } value={ item }>{ item }</option>
            )}
          </select>
        </div>
        { errorRender("Key size", keySizeError) }
        <button className="button" onClick={ onSubmit }>Next</button>
      </div>
      </div>
      { loading ? <div className="loading-overlay">
        <div className="spinning-loader" />
        <div className="description">{ loading }</div>
      </div> : "" }
    </div>
  )
}

export default withRouter(Setup);
