.PHONY: all

all: clean push

SHELL := /bin/bash
CWD := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

clean: 
	{ \
		cd schemas/; \
		glib-compile-schemas .; \
		cd ..; \
	}

push:
	git push -u origin master:master
