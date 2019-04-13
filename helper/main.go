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
	"fmt"
	flag "github.com/spf13/pflag"
	"os"
)

type KeysOptions struct {
	Identity string
	Type     string
	Size     int
	Help     bool
}

type TokenOptions struct {
	Identity string
	Size     int
	Help     bool
}

var (
	keysCommand  = flag.NewFlagSet("keys", flag.ExitOnError)
	tokenCommand = flag.NewFlagSet("token", flag.ExitOnError)

	keysOptions = &KeysOptions{
		Identity: *keysCommand.StringP(
			"id",
			"i",
			"",
			"identity for the generated keys",
		),
		Type: *keysCommand.StringP(
			"type",
			"t",
			"EC",
			"type of key cryptography of the generated keys",
		),
		Size: *keysCommand.IntP(
			"size",
			"s",
			256,
			"size of the generated keys",
		),
		Help: *keysCommand.BoolP(
			"help",
			"h",
			false,
			"prints help information",
		),
	}
	tokenOptions = &TokenOptions{
		Identity: *tokenCommand.StringP(
			"id",
			"i",
			"",
			"identity for the generated keys",
		),
		Size: *tokenCommand.IntP(
			"size",
			"s",
			256,
			"size of the hash",
		),
		Help: *tokenCommand.BoolP(
			"help",
			"h",
			false,
			"prints help information",
		),
	}

	usage = func() {
		fmt.Printf("Usage: %s [keys|token] [OPTIONS]\n\n", os.Args[0])
		fmt.Println("keys: Generates private key")
		keysCommand.PrintDefaults()
		fmt.Printf("\ntoken: Generates JWT for authentication\n")
		tokenCommand.PrintDefaults()
	}
)

func init() {
	keysCommand.Usage = usage
	tokenCommand.Usage = usage
}

func main() {
	if len(os.Args) < 2 {
		usage()
		os.Exit(64)
	}

	switch os.Args[1] {
	case "keys":
		_ = keysCommand.Parse(os.Args[2:])
	case "token":
		_ = tokenCommand.Parse(os.Args[2:])
	default:
		usage()
		os.Exit(64)
	}

	if keysOptions.Help || tokenOptions.Help {
		usage()
		os.Exit(0)
	}

	switch {
	case keysCommand.Parsed():
		GenerateKeys(keysOptions)
	case tokenCommand.Parsed():
		GenerateToken(tokenOptions)
	default:
		os.Exit(70)
	}
}
