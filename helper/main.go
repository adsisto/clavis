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

package helper

import (
	"flag"
	"os"
)

type KeysOptions struct {
	Type     string
	Size     int
	Identity string
}

type TokenOptions struct {
	Size int
}

func main() {
	keysCommand := flag.NewFlagSet("keys", flag.ExitOnError)
	tokenCommand := flag.NewFlagSet("token", flag.ExitOnError)

	keysOptions := &KeysOptions{
		Type: *keysCommand.String(
			"type",
			"EC",
			"type of key cryptography of the generated keys",
		),
		Size: *keysCommand.Int(
			"size",
			256,
			"size of the generated keys",
		),
		Identity: *keysCommand.String(
			"id",
			"",
			"identity for the generated keys",
		),
	}

	tokenOptions := &TokenOptions{
		Size: *tokenCommand.Int(
			"size",
			256,
			"size of the hash",
		),
	}

	mode := os.Args[1]

	switch mode {
	case "keys":
		keysCommand.Parse(os.Args[2:])
	case "token":
		tokenCommand.Parse(os.Args[2:])
	default:
		flag.PrintDefaults()
		os.Exit(1)
	}

	switch {
	case keysCommand.Parsed():
		GenerateKeys(keysOptions)
	case tokenCommand.Parsed():

	}
}
