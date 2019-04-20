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

import React, { useState } from "react";
import { withRouter, Redirect } from "react-router-dom";
import { useIdentity, usePublicKey, useReady } from "../hooks";
import { clipboard } from "electron";
import log from "electron-log";
import { exec } from "child_process";
import path from "path";

import expand from "../images/expand.svg";
import collapse from "../images/collapse.svg";

function Home(props) {
  const store = props.store;

  const { ready, setReady } = useReady(store);
  const { identity, setIdentity } = useIdentity(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  const [ loading, setLoading ] = useState(false);

  const [ expanded, setExpanded ] = useState(false);
  const [ placeholder, setPlaceholder ] = useState(
    "<small>Click for</small><br />Authentication Token"
  );
  const [ token, setToken ] = useState("");

  const toggleIdentity = () => {
    setExpanded(!expanded);
  };

  const copyKey = () => {
    clipboard.writeText(publicKey);
  };

  const generateToken = (e) => {
    if (loading) {
      return;
    }

    setPlaceholder("Generating keys...");
    setLoading(true);
    log.debug(`Executing command ./bin/helper token --id ${identity} --size 256`);
    exec(
      `./bin/helper token --id ${identity} --size 256`,
      {
        timeout: 10000,
        cwd: path.resolve(__dirname, '../')
      },
      (err, stdout, stderr) => {
        if (err) {
          setPlaceholder("<small>Click for</small><br />Authentication Token");

          log.error(`Failed to generated token. Command failed with exit code ${err.code}.`);
          log.debug(`Command output was:\n${stdout}${stderr}`);

          setLoading(false);
          return;
        }

        setPlaceholder("Checking generated token...");
        const pattern = /Token: \[\[ ([A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+) \]\]/m;
        log.debug(`Received console output:\n${stdout}`);
        let match = String(stdout).match(pattern);

        setToken(match[1]);
        log.info(`Successfully generated authentication token.`);

        setTimeout(() => {
          setToken("");
          setPlaceholder("<small>Click for</small><br />Authentication Token");
        }, 30000);
        setLoading(false);
      }
    )
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
          <div onClick={ toggleIdentity }>
            <span className="identity-description">Identity</span>
            <h3 className="identity-text">{ identity }</h3>
            <object className="identity-button" data={ expanded ? collapse : expand }
                    type="image/svg+xml"></object>
          </div>
          <div className={ expanded ? "public-key-expanded" : "public-key" } onClick={ copyKey }>
            <span className="identity-description">Public Key</span><br />
            <span className="public-key-text">{ publicKey }</span> <small>Click to Copy</small>
          </div>
        </div>
        <div className="token">
          <textarea className="token-field" rows="5" value={ token } readOnly />
          { token !== "" ? "" :
          <div className="token-placeholder" onClick={ generateToken }>
            <span dangerouslySetInnerHTML={{ __html: placeholder }}></span>
          </div>
          }
        </div>
      </div>
      </div>
    </div>
  )
}

export default withRouter(Home);
