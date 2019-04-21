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
	"testing"
)

var (
	err           CommandError
	identity      = "hi@acme.dev"
	EC            = "EC"
	ECSize        = 256
	ECInvalidSize = 1024
	RSA           = "RSA"
	RSASize       = 2048
	emptyString   string
	emptyInt      int
)

func TestGenerateKeys(t *testing.T) {
	ECConfig := KeysOptions{
		Identity: &identity,
		Type:     &EC,
		Size:     &ECSize,
	}

	err = CommandError{}
	testConfig := ECConfig
	testConfig.Identity = &emptyString
	_, err = GenerateKeys(testConfig)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}

	err = CommandError{}
	testConfig = ECConfig
	testConfig.Type = &emptyString
	_, err = GenerateKeys(testConfig)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}
}

func TestGenerateECKeysIndirect(t *testing.T) {
	ECConfig := KeysOptions{
		Identity: &identity,
		Type:     &EC,
		Size:     &ECSize,
	}

	err = CommandError{}
	testConfig := ECConfig
	testConfig.Size = &emptyInt
	_, err = GenerateKeys(testConfig)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}

	err = CommandError{}
	testConfig = ECConfig
	testConfig.Size = &ECInvalidSize
	_, err = GenerateKeys(testConfig)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}
}

func TestGenerateECKeysDirect(t *testing.T) {
	err = CommandError{}
	_, _, err = GenerateECKeys(emptyInt)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}

	err = CommandError{}
	_, _, err = GenerateECKeys(ECInvalidSize)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 65 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}
}

func TestGenerateRSAKeysIndirect(t *testing.T) {
	RSAConfig := KeysOptions{
		Identity: &identity,
		Type:     &RSA,
		Size:     &RSASize,
	}

	err = CommandError{}
	testConfig := RSAConfig
	testConfig.Size = &emptyInt
	_, err = GenerateKeys(testConfig)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 70 {
		t.Errorf("Expected exit code: %d, got: %d", 65, err.Code)
	}
}

func TestGenerateRSAKeysDirect(t *testing.T) {
	err = CommandError{}
	_, _, err = GenerateRSAKeys(emptyInt)
	if err == (CommandError{}) {
		t.Error("Expected error, none reported.")
	}
	if err.Code != 70 {
		t.Errorf("Expected exit code: %d, got: %d", 70, err.Code)
	}
}
