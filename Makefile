## declare PHONY
.PHONY: build test all

all:
	make lint &&\
		make typecheck &&\
		make format-check &&\
		make test &&\
		make build

NODE_BIN=node_modules/.bin/

## scrap
scrap:
	rm -rf build && node script/esbuild/scrapper.js && node build/scrap.js

## serve
serve:
	node build

## start
start:
	(trap 'kill 0' INT; make typecheck & make build)

## build
pre-build:
	rm -rf build

build: pre-build
	node script/esbuild/server.js

## clean-up:
clean-up:
	rm -rf src test node_modules script sql .github .git

## type-check
typecheck:
	$(NODE_BIN)tsc -p tsconfig.json $(arguments)

typecheck-watch:
	make typecheck arguments=--w

## test
api=test-api
pre-test:
	rm -rf __tests__

test: pre-test
	node script/esbuild/test.js && $(NODE_BIN)jest __tests__ $(arguments)

## code coverage
code-cov:
	make test arguments=--coverage

## pg typed generator
pg-gen:
	node script/pgTyped.js && $(NODE_BIN)pgtyped $(arguments) -c pgTyped.json

pg-gen-watch:
	make pg-gen arguments=-w

## format
format-sql:
	node script/sqlFormatter.js

prettier=$(NODE_BIN)prettier
prettify-src:
	$(prettier) --$(type) src/

prettify-test:
	$(prettier) --$(type) test/

format-check:
	(trap 'kill 0' INT; make prettify-src type=check & make prettify-test type=check)

format-ts:
	(trap 'kill 0' INT; make prettify-src type=write & make prettify-test type=write)

format:
	make format-sql
	make format-ts

## lint
eslint=$(NODE_BIN)eslint
lint-src:
	$(eslint) src/** -f='stylish' --color

lint-test:
	$(eslint) test/**/*.ts -f='stylish' --color

lint:
	(trap 'kill 0' INT; make lint-src & make lint-test)

## postgres setup and installation
install:
	# refer https://www.postgresql.org/download/linux/ubuntu/
	sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(shell lsb_release -cs)-pgdg main"> /etc/apt/sources.list.d/pgdg.list'
	wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
	sudo apt-get update
	sudo apt-get -y install postgresql

setup:
	# start postgresql
	sudo service postgresql start
	# create runner
	sudo -u postgres createuser -s -i -d -r -l -w runner
	# create program db
	sudo -u postgres createdb utari
	# create program test
	sudo -u postgres createdb test
	psql template1 -c "ALTER USER postgres WITH PASSWORD 'postgres'"
	psql utari -c "\i sql/create.sql"
