## declare PHONY
.PHONY: build test

## start
start:
	node build/index.js

start-watch:
	node_modules/.bin/nodemon

start-dev:
	make compile && make start

## build
tsc=node_modules/.bin/tsc
add-js-extension:
	node_modules/.bin/ts-add-js-extension add --dir=build

build:
	rm -rf build && $(tsc) -p tsconfig.prod.json && make add-js-extension

compile:
	rm -rf build && $(tsc) -p tsconfig.dev.json && make add-js-extension

## type-check
typecheck:
	$(tsc) --pretty --skipLibCheck --noEmit

typecheck-watch:
	$(tsc) --pretty --skipLibCheck --noEmit --w

## test command
query=test/api/query/* --run-in-band
mutation=test/api/mutation/* --run-in-band
madm=test/api/madm/*
populate=test/api/populate/* --run-in-band
geocode=test/api/geocode/*
scrapper=test/scrapper/*

## test
jest=node_modules/.bin/jest
api=test-api
$(api)-query:
	$(jest) $(query)

$(api)-mutation:
	$(jest) $(mutation)

$(api)-madm:
	$(jest) $(madm)

$(api)-populate:
	$(jest) $(populate)

${api}-geocode:
	${jest} $(geocode)

test-scrapper:
	$(jest) $(populate)

test:
	make $(api)-query
	make $(api)-mutation
	make $(api)-madm
	make $(api)-populate
	make test-scrapper
	echo "All tests passed"

## code coverage
cov=code-cov
cov-api=$(cov)-api
$(cov-api)-query:
	$(jest) $(query) --coverage --coverageDirectory='coverage'

$(cov-api)-mutation:
	$(jest) $(mutation) --coverage --coverageDirectory='coverage'

$(cov-api)-madm:
	$(jest) $(madm) --coverage --coverageDirectory='coverage'

$(cov-api)-populate:
	$(jest) $(populate) --coverage --coverageDirectory='coverage'

$(cov-api)-geocode:
	$(jest) $(geocode) --coverage --coverageDirectory='coverage'

$(cov)-scrapper:
	$(jest) $(scrapper) --coverage --coverageDirectory='coverage'

$(cov):
	make $(cov-api)-query
	make $(cov-api)-mutation
	make $(cov-api)-madm
	make $(cov-api)-populate
	make $(cov-api)-geocode
	make $(cov)-scrapper

## pg typed generator
pgtyped=node_modules/.bin/pgtyped
pg-gen-watch:
	$(pgtyped) -w -c pgTyped.json
pg-gen:
	$(pgtyped) -c pgTyped.json

## format
format-sql:
	node script/sqlFormatter.js

prettier=node_modules/.bin/prettier
format-ts:
	${prettier} --write src/

format-check:
	${prettier} --check src/

format:
	make format-sql
	make format-ts

## lint
eslint=node_modules/.bin/eslint
lint-src:
	${eslint} src/** -f='stylish' --color

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
