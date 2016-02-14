JS := $(shell find src/js -name '*.js')

all: public/css/app.css public/js/app.js

public/css/app.css: src/scss/main.scss
	mkdir -p public/css/
	sass $< $@ --sourcemap=none

public/js/app.js: $(JS)
	mkdir -p public/js/
	./node_modules/.bin/uglifyjs $(JS) --output $@

run: all
	./node_modules/.bin/http-server
