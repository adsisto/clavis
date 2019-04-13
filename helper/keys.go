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
	"bufio"
	"bytes"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
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

func GenerateKeys(options *KeysOptions) {
	if options.Identity == "" {
		usage()
		os.Exit(65)
	}

	var key []byte

	switch options.Type {
	case "EC":
		key = GenerateECKeys(options.Size)
	case "RSA":
		key = GenerateRSAKey(options.Size)
	default:
		fmt.Println("Invalid cryptographic mechanism. Exiting...")
		os.Exit(65)
	}

	var b bytes.Buffer
	writer := bufio.NewWriter(&b)

	pemBlock := &pem.Block{
		Type:  fmt.Sprintf("%s PRIVATE KEY", options.Type),
		Bytes: key,
	}

	err := pem.Encode(writer, pemBlock)
	if err != nil {
		fmt.Sprintln(err)
		os.Exit(70)
	}

	_ = writer.Flush()
	err = keyring.Set("clavis", options.Identity, b.String())
	if err != nil {
		fmt.Sprintln(err)
		os.Exit(77)
	}

	os.Exit(0)
}

func GenerateECKeys(size int) []byte {
	curve, ok := ECCurveMap[size]
	if !ok {
		fmt.Println("Size of the keys are invalid. Exiting...")
		os.Exit(65)
	}

	key, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		fmt.Println(err)
		os.Exit(70)
	}

	encoded, err := x509.MarshalECPrivateKey(key)
	if err != nil {
		fmt.Println(err)
		os.Exit(70)
	}

	return encoded
}

func GenerateRSAKey(size int) []byte {
	key, err := rsa.GenerateKey(rand.Reader, size)
	if err != nil {
		fmt.Println(err)
		os.Exit(70)
	}

	return x509.MarshalPKCS1PrivateKey(key)
}
