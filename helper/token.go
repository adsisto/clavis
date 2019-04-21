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
			fmt.Fprintln(os.Stderr, err.Message)
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

	if *options.KeyPem == "" {
		key, err := keyring.Get("clavis", *options.Identity)
		if err != nil {
			cmdErr = CommandError{
				Message: fmt.Sprintf("Unable to retrieve key from keyring: %s", err),
				Code:    64,
			}
			return nil, cmdErr
		}

		options.KeyPem = &key
	}

	parsedKey, algName, cmdErr := ParsePrivateKey(*options.KeyPem)
	if cmdErr != (CommandError{}) {
		return nil, cmdErr
	}

	algName = fmt.Sprintf("%vS%d", algName[0], *options.Size)
	alg := jws.GetSigningMethod(algName)
	if alg == nil {
		cmdErr = CommandError{
			Message: "Invalid hash algorithm.",
			Code:    64,
		}
		return nil, cmdErr
	}

	if options.Time == nil {
		now := time.Now()
		options.Time = &now
	}
	claims := jws.Claims{
		"iss": *options.Identity,
		"iat": (*options.Time).Unix(),
		"nbf": (*options.Time).Unix(),
		"exp": (*options.Time).Add(time.Second * 30).Unix(),
	}

	jwt := jws.NewJWT(claims, alg)
	token, err := jwt.Serialize(parsedKey)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to sign authentication token: %s", err),
			Code:    70,
		}
		return nil, cmdErr
	}

	return token, cmdErr
}

func ParsePrivateKey(key string) (interface{}, string, CommandError) {
	var (
		rawKey interface{}
		cipher string
		err    error
		cmdErr CommandError
	)

	block, _ := pem.Decode([]byte(key))

	switch block.Type {
	case "EC PRIVATE KEY":
		cipher = "EC"
		rawKey, err = x509.ParseECPrivateKey(block.Bytes)
		if err != nil {
			cmdErr = CommandError{
				Message: "Unable to parse private key",
				Code:    64,
			}
		}
	case "RSA PRIVATE KEY":
		cipher = "RSA"
		rawKey, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			cmdErr = CommandError{
				Message: "Unable to parse private key",
				Code:    64,
			}
		}
	default:
		cmdErr = CommandError{
			Message: "Invalid private key supplied",
			Code:    64,
		}
	}

	return rawKey, cipher, cmdErr
}
