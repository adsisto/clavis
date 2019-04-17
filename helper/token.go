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

package main

import (
	"encoding/pem"
	"fmt"
	"github.com/SermoDigital/jose/jws"
	"github.com/zalando/go-keyring"
	"os"
	"time"
)

func GenerateToken(options TokenOptions) {
	if *options.Identity == "" {
		usage()
		os.Exit(64)
	}

	key, err := keyring.Get("calvis", *options.Identity)
	if err != nil {
		fmt.Println(err)
		os.Exit(64)
	}

	var algName string
	block, _ := pem.Decode([]byte(key))

	switch block.Type {
	case "EC PRIVATE KEY":
		algName = "E"
	case "RSA PRIVATE KEY":
		algName = "R"
	default:
		fmt.Println("Invalid private key stored in keyring. Exiting...")
		os.Exit(64)
	}

	algName = fmt.Sprintf("%sS%d", algName, *options.Size)
	alg := jws.GetSigningMethod(algName)
	if alg == nil {
		fmt.Println("Invalid hash size. Exiting...")
		os.Exit(64)
	}

	now := time.Now()
	claims := jws.Claims{
		"iss": *options.Identity,
		"iat": now.String(),
		"nbf": now.String(),
		"exp": now.Add(time.Second * 30).String(),
	}

	jwt := jws.NewJWT(claims, alg)
	token, err := jwt.Serialize(block.Bytes)
	if err != nil {
		fmt.Println(err)
		os.Exit(70)
	}

	fmt.Printf("Token: [[ %s ]]\n", token)
	os.Exit(0)
}
