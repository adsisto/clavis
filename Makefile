SHELL := /bin/bash

NODE_BIN := node_modules/.bin
NODE_ENV := production

PATH := $(NODE_BIN):$(PATH)

node_modules: package.json yarn.lock
	yarn install

bin/helper:
	go build -o bin/helper helper

dist: node_modules
	cross-env webpack --config webpack.config.js

deps_upgrade: package.json
	yarn upgrade

start: dist
	electron .

build: bin/helper dist
	electron-builder

clean:
	rm -rf bin/helper dist
