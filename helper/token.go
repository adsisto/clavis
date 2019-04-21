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
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"github.com/SermoDigital/jose/jws"
	"github.com/zalando/go-keyring"
	"os"
	"time"
)

func GenerateTokenCommand(options TokenOptions) {
	token, err := GenerateToken(options)

	if err != (CommandError{}) {
		if err.PrintUsage {
			usage()
		}

		if err.Message != "" {
			fmt.Println(err.Message)
		}

		os.Exit(err.Code)
	}

	fmt.Println("Successfully generated authentication token.")
	fmt.Printf("Token: [[ %s ]]\n", token)
	os.Exit(0)
}

func GenerateToken(options TokenOptions) ([]byte, CommandError) {
	var cmdErr CommandError

	if *options.Identity == "" {
		cmdErr = CommandError{
			PrintUsage: true,
			Code:       64,
		}
		return nil, cmdErr
	}

	key, err := keyring.Get("clavis", *options.Identity)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to retrieve key from keyring: %s", err),
			Code:    64,
		}
		return nil, cmdErr
	}

	var algName string
	block, _ := pem.Decode([]byte(key))

	var rawKey interface{}

	switch block.Type {
	case "EC PRIVATE KEY":
		algName = "E"
		rawKey, err = x509.ParseECPrivateKey(block.Bytes)
		if err != nil {
			cmdErr = CommandError{
				Message: "Unable to parse private key",
				Code:    64,
			}
		}
	case "RSA PRIVATE KEY":
		algName = "R"
		rawKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			cmdErr = CommandError{
				Message: "Unable to parse private key",
				Code:    64,
			}
		}
	default:
		cmdErr = CommandError{
			Message: "Invalid private key stored in keyring.",
			Code:    64,
		}
	}

	if cmdErr != (CommandError{}) {
		return nil, cmdErr
	}

	algName = fmt.Sprintf("%sS%d", algName, *options.Size)
	alg := jws.GetSigningMethod(algName)
	if alg == nil {
		cmdErr = CommandError{
			Message: "Invalid hash algorithm.",
			Code:    64,
		}
		return nil, cmdErr
	}

	now := time.Now()
	claims := jws.Claims{
		"iss": *options.Identity,
		"iat": now.String(),
		"nbf": now.String(),
		"exp": now.Add(time.Second * 30).String(),
	}

	jwt := jws.NewJWT(claims, alg)
	token, err := jwt.Serialize(rawKey)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to sign authentication token: %s", err),
			Code:    70,
		}
		return nil, cmdErr
	}

	return token, cmdErr
}
