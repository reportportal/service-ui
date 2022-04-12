.DEFAULT_GOAL := build

COMMIT_HASH = $(shell git rev-parse HEAD | git hash-object --stdin)
BUILD_DATE = $(shell date +%FT%T%z)

RELEASE_DIR := release

REPO_NAME := reportportal/service-ui

UI_BUILD_REACT=app/

BUILD_INFO_FILE := buildInfo.json

IMAGE_NAME=reportportal-dev-5/service-ui$(IMAGE_POSTFIX)

.PHONY: build

# Generates a json file with build info
generate-build-info:
	echo '{"build": { "version": "${v}", "branch": "${COMMIT_HASH}", "build_date": "${BUILD_DATE}", "name": "Service UI", "repo": "${REPO_NAME}"}}' > ./${UI_BUILD_REACT}build/${BUILD_INFO_FILE}

# Builds the project
build-statics:
	npm --prefix $(UI_BUILD_REACT) ci
	npm --prefix $(UI_BUILD_REACT) run lint
	npm --prefix $(UI_BUILD_REACT) run test:coverage
	npm --prefix $(UI_BUILD_REACT) run build

# Builds the project
build: build-statics generate-build-info

# Builds server
build-release:
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
	if [ -d ${RELEASE_DIR} ] ; then rm -r ${RELEASE_DIR} ; fi
	if [ -d 'node_modules' ] ; then rm -r 'node_modules' ; fi
	if [ -d 'build' ] ; then rm -r 'build' ; fi

# Builds the container
build-image-dev:
	docker build -t "$(IMAGE_NAME)" --build-arg version=${v} -f Dockerfile-full .
