.PHONY: all

all: clean push

SHELL := /bin/bash
CWD := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

clean: 
	rm -f tado-gnome-shell-extension.zip
	{ \
		cd schemas/; \
		rm gschemas.compiled; \
		glib-compile-schemas .; \
		cd ..; \
	}

push: clean
	git push -u origin main:main

zip:
	zip tado-gnome-shell-extension.zip icons/ schemas/ metadata.json *.js *.css


