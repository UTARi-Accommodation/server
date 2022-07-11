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

## install
install:
	yarn install --frozen-lockfile

## scrap
scrap:
	rm -rf build && node script/esbuild/scrapper.js && node build/scrap.js

## serve
serve:
	node build

## start
start:
	(trap 'kill 0' INT; make typecheck-watch & make build)

## build
pre-build:
	rm -rf build

build: pre-build
	node script/esbuild/server.js

## clean-up:
clean-up:
	rm -rf src test node_modules script sql .git* temp

## type-check
typecheck:
	$(NODE_BIN)tsc -p tsconfig.json $(arguments)

typecheck-watch:
	make typecheck arguments=--w

## test
api=test-api
pre-test:
	rm -rf __tests__ && node script/esbuild/test.js 

test: pre-test
	$(NODE_BIN)jest __tests__

## pg typed generator
pg-gen:
	node script/pgTyped.js && $(NODE_BIN)pgtyped $(arguments) -c pgTyped.json

pg-gen-watch:
	make pg-gen arguments=-w

## drop all views and functions
drop:
	node script/sql/viewsAndFunctions.js drop && psql utari -c "\i temp/drop.sql"

## create all views and functions
create:
	node script/sql/viewsAndFunctions.js create && psql utari -c "\i temp/create.sql"

## format
format-sql:
	node script/sql/formatter.js

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
	$(NODE_BIN)eslint src/ test/ -f='stylish' --color

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
	psql utari -c "\i sql/view/create/filterDetailedUnitById.sql"
