.DEFAULT_GOAL := build

COMMIT_HASH = `git rev-parse --short HEAD 2>/dev/null`
BUILD_DATE = `date +%FT%T%z`

GO = go
BINARY_DIR=bin

BUILD_DEPS:= github.com/alecthomas/gometalinter
GODIRS_NOVENDOR = $(shell go list ./... | grep -v /vendor/)
GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*")
PACKAGE_COMMONS=github.com/reportportal/go-commons

UI_BUILD_ROOT=src/main/resources/public/
BUILD_INFO_LDFLAGS=-ldflags "-X ${PACKAGE_COMMONS}/commons.Branch=${COMMIT_HASH} -X ${PACKAGE_COMMONS}/commons.BuildDate=${BUILD_DATE} -X ${PACKAGE_COMMONS}/commons.Version=${v}"
IMAGE_NAME=reportportal/service-ui$(IMAGE_POSTFIX)

.PHONY: vendor test build

help:
	@echo "build      - go build"
	@echo "test       - go test"
	@echo "checkstyle - gofmt+golint+misspell"

vendor: ## Install govendor and sync vendored dependencies
	go get -u github.com/kardianos/govendor
	govendor sync

get-build-deps: vendor
	$(GO) get $(BUILD_DEPS)
	gometalinter --install

test: vendor
	govendor test +local

checkstyle: get-build-deps
	gometalinter --vendor ./... --fast --disable=gas --disable=errcheck --disable=gotype --deadline 10m

fmt:
	gofmt -l -w -s ${GOFILES_NOVENDOR}


# Builds server
build-server: checkstyle test
	CGO_ENABLED=0 GOOS=linux $(GO) build ${BUILD_INFO_LDFLAGS} -o ${BINARY_DIR}/service-ui ./

# Builds the project
build-statics:
	npm --prefix $(UI_BUILD_ROOT) install
	npm --prefix $(UI_BUILD_ROOT) run build

# Builds the project
build: build-statics build-server

# Builds the container
build-image:
	docker build -t "$(IMAGE_NAME)" -f docker/Dockerfile .


# Builds the container and pushes to private registry
pushDev:
	echo "Registry is not provided"
	if [ -d ${REGISTRY} ] ; then echo "Provide registry"; exit 1 ; fi
	docker tag "$(IMAGE_NAME)" "$(REGISTRY)/$(IMAGE_NAME):latest"
	docker push "$(REGISTRY)/$(IMAGE_NAME):latest"

clean:
	if [ -d ${BINARY_DIR} ] ; then rm -r ${BINARY_DIR} ; fi
	if [ -d 'node_modules' ] ; then rm -r 'node_modules' ; fi
	if [ -d 'build' ] ; then rm -r 'build' ; fi
