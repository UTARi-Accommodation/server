## declare PHONY
.PHONY: build test

## start
start:
	node build/index.js

start-watch:
	./node_modules/.bin/nodemon

start-dev:
	make compile && make start

## build
tsc=./node_modules/.bin/tsc
add-js-extension:
	./node_modules/.bin/ts-add-js-extension add --dir=build

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
jest=./node_modules/.bin/jest
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
pgtyped=./node_modules/.bin/pgtyped
pg-gen:
	$(pgtyped) -w -c pgTyped.json

## format
format-sql:
	node script/sqlFormatter.js

format-ts:
	node script/prettier.js

format:
	make format-sql
	make format-ts

## lint
eslint=./node_modules/.bin/eslint
lint-src:
	${eslint} src/** -f='stylish' --color
