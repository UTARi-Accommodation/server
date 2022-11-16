## declare PHONY
.PHONY: build test all
MAKEFLAGS += --silent

all:
	make lint &&\
		make typecheck &&\
		make format-check &&\
		make test &&\
		make build

NODE_BIN=node_modules/.bin/
vite-node=$(NODE_BIN)vite-node

tally-pgtyped-file-function-name:
	$(NODE_BIN)esbuild script/tally-pgtyped-file-function-name/index.ts --sourcemap --bundle --minify --target=node16.3.1 --platform=node --outfile=script/tally-pgtyped-file-function-name/index.js &&\
		node --enable-source-maps script/tally-pgtyped-file-function-name

## install
install:
	pnpm i --frozen-lockfile

## scrap
scrap: pre-build
	$(vite-node) script/esbuild/scrapper.ts && node --enable-source-maps build/scrap.js

## serve
serve:
	node --enable-source-maps build

## start
start:
	(trap 'kill 0' INT; make typecheck-watch & make build)

## build
pre-build:
	rm -rf build

build: pre-build
	$(vite-node) script/esbuild/server.ts

## clean-up:
clean-up:
	rm -rf src test node_modules script sql .git* temp

## type-check
typecheck:
	$(NODE_BIN)tsc -p tsconfig.json $(arguments)

typecheck-watch:
	make typecheck arguments=--w

## test
test:
	$(NODE_BIN)vitest

## pg typed generator
pg-gen:
	$(vite-node) script/pgTyped.ts && $(NODE_BIN)pgtyped $(arguments) -c pgTyped.json

pg-gen-watch:
	make pg-gen arguments=-w

## drop all views and functions
drop:
	$(vite-node) script/sql/viewsAndFunctions.ts -- drop && psql utari -c "\i temp/drop.sql"

## create all views and functions
create:
	$(vite-node) script/sql/viewsAndFunctions.ts -- create && psql utari -c "\i temp/create.sql"

## format
format-sql:
	$(vite-node) script/sql/formatter.ts

prettier=$(NODE_BIN)prettier
prettify:
	$(prettier) --$(type) src/ test/

format-check:
	make prettify type=check

format-ts:
	make prettify type=write

format:
	make format-sql
	make format-ts

## lint
lint:
	$(NODE_BIN)eslint src/ test/ -f='stylish' --color &&\
		make find-unused-exports &&\
		make find-unimported-files

## find unused exports
find-unused-exports:
	$(NODE_BIN)find-unused-exports

## find unimported files
find-unimported-files:
	$(NODE_BIN)unimported

## postgres setup and installation
install-postgresql:
	# refer https://www.postgresql.org/download/linux/ubuntu/
	sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(shell lsb_release -cs)-pgdg main"> /etc/apt/sources.list.d/pgdg.list'
	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
	sudo apt-get update
	sudo apt-get -y install postgresql

setup-postgresql:
	# start postgresql
	sudo service postgresql start
	# create runner
	sudo -u postgres createuser -s -i -d -r -l -w runner
	# create program db
	sudo -u postgres createdb utari
	# create program test
	sudo -u postgres createdb test
	psql template1 -c "ALTER USER postgres WITH PASSWORD 'postgres'"
	psql utari -c "\i sql/migration/create.sql"

puppeteer-prerequisite:
	sudo apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release xdg-utils wget
