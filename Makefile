doc:
	node bin/make.js doc

publish:
	 node bin/make.js build -a && npm publish

test:
	@./node_modules/.bin/mocha

.PHONY: test
