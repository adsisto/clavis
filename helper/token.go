/*
 * Copyright (c) Andrew Ying 2019.
 *
 * This file is part of Clavis.
 *
 * Clavis is free software. You can use, share, and build it under the terms of the
 * API Copyleft License. As far as the law allows, this software comes as is, without
 * any warranty or condition, and no contributor will be liable to anyone for any
 * damages related to this software or this license, under any kind of legal claim.
 *
 * A copy of the API Copyleft License is available at <LICENSE.md>.
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

func GenerateToken(options *TokenOptions) {
	if options.Identity == "" {
		usage()
		os.Exit(64)
	}

	key, err := keyring.Get("calvis", options.Identity)
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

	algName = fmt.Sprintf("%sS%d", algName, options.Size)
	alg := jws.GetSigningMethod(algName)
	if alg == nil {
		fmt.Println("Invalid hash size. Exiting...")
		os.Exit(64)
	}

	now := time.Now()
	claims := jws.Claims{
		"iss": options.Identity,
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

	fmt.Println(token)
	os.Exit(0)
}
