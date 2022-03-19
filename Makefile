## declare PHONY
.PHONY: build test

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
build:
	rm -rf build && node script/esbuild/server.js

## clean-up:
clean-up:
	find . -maxdepth 1 ! -name "build" ! -name "npm" ! -name "yarn" ! -name "node" ! -name "Makefile" ! -name "Procfile" ! -name . -exec rm -r {} \;

## type-check
typecheck:
	node_modules/.bin/tsc -p tsconfig.json $(arguments)

typecheck-watch:
	make typecheck arguments=--w

## test
api=test-api
test:
	node_modules/.bin/jest $(arguments) --runInBand

$(api)-query:
	make test arguments=test/api/query/*

$(api)-mutation:
	make test arguments=test/api/mutation/*

$(api)-madm:
	make test arguments=test/api/madm/*

$(api)-populate:
	make test arguments=test/api/populate/*

$(api)-geocode:
	make test arguments=test/api/geocode/*

test-scrapper:
	make test arguments=test/scrapper/*

## code coverage
code-cov:
	make test arguments=--coverage --coverageDirectory='coverage'

## pg typed generator
pg-gen:
	node script/pgTyped.js && node_modules/.bin/pgtyped $(arguments) -c pgTyped.json
pg-gen-watch:
	make pg-gen arguments=-w

## format
format-sql:
	node script/sqlFormatter.js

prettier=node_modules/.bin/prettier
format-ts:
	$(prettier) --write src/

format-check:
	$(prettier) --check src/

format:
	make format-sql
	make format-ts

## lint
lint-src:
	node_modules/.bin/eslint src/** -f='stylish' --color

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
