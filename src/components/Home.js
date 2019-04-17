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

function Home(props) {
  const store = props.store;

  const { ready, setReady } = useReady(store);
  const { identity, setIdentity } = useIdentity(store);
  const { publicKey, setPublicKey } = usePublicKey(store);

  if (!ready) {
    return (
      <Redirect to="/setup" />
    )
  }

  return (
    <div>

    </div>
  )
}

export default withRouter(Home);