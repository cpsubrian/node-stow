TEST_DIR = ./test
TEST_SPEC =

ifdef test
	TEST_SPEC += $(TEST_DIR)/$(test)
endif

test:
	@./node_modules/.bin/mocha $(TEST_SPEC) \
		--reporter spec \
		--bail \
		--timeout 10s \
		--require test/common.js

.PHONY: test