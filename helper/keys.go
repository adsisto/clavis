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
	"bufio"
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"github.com/zalando/go-keyring"
	"os"
)

var (
	ECCurveMap = map[int]elliptic.Curve{
		224: elliptic.P224(),
		256: elliptic.P256(),
		384: elliptic.P384(),
		521: elliptic.P521(),
	}
)

func GenerateKeysCommand(options KeysOptions) {
	key, err := GenerateKeys(options)

	if err != (CommandError{}) {
		if err.PrintUsage {
			usage()
		}

		if err.Message != "" {
			fmt.Fprintln(os.Stderr, err.Message)
		}

		os.Exit(err.Code)
	}

	fmt.Println("Successfully generated private key.")
	fmt.Printf("Public Key: [[ %s ]]\n", key)
	os.Exit(0)
}

func GenerateKeys(options KeysOptions) (string, CommandError) {
	var cmdErr CommandError

	if *options.Identity == "" {
		cmdErr = CommandError{
			PrintUsage: true,
			Code:       65,
		}

		return "", cmdErr
	}

	var key []byte
	var pubKey []byte

	switch *options.Type {
	case "EC":
		key, pubKey, cmdErr = GenerateECKeys(*options.Size)
	case "RSA":
		key, pubKey, cmdErr = GenerateRSAKeys(*options.Size)
	default:
		cmdErr = CommandError{
			Message: "Invalid cryptographic mechanism. Exiting...",
			Code:    65,
		}
	}

	if cmdErr != (CommandError{}) {
		return "", cmdErr
	}

	var b bytes.Buffer
	writer := bufio.NewWriter(&b)

	pemBlock := &pem.Block{
		Type:  fmt.Sprintf("%s PRIVATE KEY", *options.Type),
		Bytes: key,
	}

	err := pem.Encode(writer, pemBlock)
	if err != nil {
		cmdErr = CommandError{
			Message: err.Error(),
			Code:    70,
		}

		return "", cmdErr
	}

	_ = writer.Flush()
	err = keyring.Set("clavis", *options.Identity, b.String())
	if err != nil {
		cmdErr = CommandError{
			Message: err.Error(),
			Code:    77,
		}

		return "", cmdErr
	}

	return base64.StdEncoding.EncodeToString(pubKey), cmdErr
}

func GenerateECKeys(size int) ([]byte, []byte, CommandError) {
	var cmdErr CommandError

	curve, ok := ECCurveMap[size]
	if !ok {
		cmdErr = CommandError{
			Message: "Size of the keys are invalid.",
			Code:    65,
		}

		return nil, nil, cmdErr
	}

	key, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		cmdErr = CommandError{
			Message: err.Error(),
			Code:    70,
		}

		return nil, nil, cmdErr
	}

	encoded, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to generate private key: %s", err),
			Code:    70,
		}

		return nil, nil, cmdErr
	}

	encodedPub, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to generate pubic key: %s", err),
			Code:    70,
		}

		return nil, nil, cmdErr
	}

	return encoded, encodedPub, cmdErr
}

func GenerateRSAKeys(size int) ([]byte, []byte, CommandError) {
	var cmdErr CommandError

	key, err := rsa.GenerateKey(rand.Reader, size)
	if err != nil {
		cmdErr = CommandError{
			Message: fmt.Sprintf("Unable to generate private key: %s", err),
			Code:    70,
		}

		return nil, nil, cmdErr
	}

	return x509.MarshalPKCS1PrivateKey(key),
		x509.MarshalPKCS1PublicKey(&key.PublicKey),
		cmdErr
}
