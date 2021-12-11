.DEFAULT_GOAL := build

COMMIT_HASH = `git rev-parse --short HEAD 2>/dev/null`
BUILD_DATE = `date +%FT%T%z`

BINARY_DIR=bin
RELEASE_DIR=release

REPO_NAME=reportportal/service-ui

UI_BUILD_REACT=app/

IMAGE_NAME=reportportal-dev-5/service-ui$(IMAGE_POSTFIX)

.PHONY: get-build-deps test checkstyle lint build

# Builds the project
build-statics:
	npm --prefix $(UI_BUILD_REACT) ci
	npm --prefix $(UI_BUILD_REACT) run lint
	npm --prefix $(UI_BUILD_REACT) run test:coverage
	npm --prefix $(UI_BUILD_REACT) run build

# Builds the project
build: build-statics build-server

# Builds server
build-release: get-build-deps test
	$(eval v := $(or $(v),$(shell releaser bump)))
	# make sure latest version is bumped to file
	releaser bump --version ${v}

	$(eval wd := $(shell pwd))
	cd ${UI_BUILD_REACT}/build && tar -czvf "${wd}/${RELEASE_DIR}/ui.tar.gz" ./

# Builds the image
build-image:
	docker build -t "$(IMAGE_NAME_REACT)" -f Dockerfile-full .

release: build-release
	releaser release --bintray.token ${BINTRAY_TOKEN}

# Builds the container and pushes to private registry
pushDev:
	echo "Registry is not provided"
	if [ -d ${REGISTRY} ] ; then echo "Provide registry"; exit 1 ; fi
	docker tag "$(IMAGE_NAME)" "$(REGISTRY)/$(IMAGE_NAME):latest"
	docker push "$(REGISTRY)/$(IMAGE_NAME):latest"

clean:
	if [ -d ${BINARY_DIR} ] ; then rm -r ${BINARY_DIR} ; fi
	if [ -d ${RELEASE_DIR} ] ; then rm -r ${RELEASE_DIR} ; fi
	if [ -d 'node_modules' ] ; then rm -r 'node_modules' ; fi
	if [ -d 'build' ] ; then rm -r 'build' ; fi

# Builds the container
build-image-dev:
	docker build -t "$(IMAGE_NAME)" --build-arg version=${v} -f Dockerfile-full .
