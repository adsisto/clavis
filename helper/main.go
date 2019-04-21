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
	"fmt"
	flag "github.com/spf13/pflag"
	"os"
)

type KeysOptions struct {
	Identity *string
	Type     *string
	Size     *int
	Help     *bool
}

type TokenOptions struct {
	Identity *string
	Size     *int
	KeyPem   *string
	Time     *time.Time
	Help     *bool
}

type CommandError struct {
	Message    string
	PrintUsage bool
	Code       int
}

var (
	keysCommand  = flag.NewFlagSet("keys", flag.ExitOnError)
	tokenCommand = flag.NewFlagSet("token", flag.ExitOnError)

	keysOptions = KeysOptions{
		Identity: keysCommand.StringP(
			"id",
			"i",
			"",
			"identity for the generated keys",
		),
		Type: keysCommand.StringP(
			"type",
			"t",
			"EC",
			"type of key cryptography of the generated keys",
		),
		Size: keysCommand.IntP(
			"size",
			"s",
			256,
			"size of the generated keys",
		),
		Help: keysCommand.BoolP(
			"help",
			"h",
			false,
			"prints help information",
		),
	}
	tokenOptions = TokenOptions{
		Identity: tokenCommand.StringP(
			"id",
			"i",
			"",
			"identity for the generated keys",
		),
		Size: tokenCommand.IntP(
			"size",
			"s",
			256,
			"size of the hash",
		),
		Help: tokenCommand.BoolP(
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

	if *keysOptions.Help || *tokenOptions.Help {
		usage()
		os.Exit(0)
	}

	switch {
	case keysCommand.Parsed():
		GenerateKeysCommand(keysOptions)
	case tokenCommand.Parsed():
		GenerateTokenCommand(tokenOptions)
	default:
		os.Exit(70)
	}
}
