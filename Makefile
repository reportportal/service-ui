.DEFAULT_GOAL := build

COMMIT_HASH = `git rev-parse --short HEAD 2>/dev/null`
BUILD_DATE = `date +%FT%T%z`

GO = go
BINARY_DIR=bin
RELEASE_DIR=release

BUILD_DEPS:= github.com/alecthomas/gometalinter github.com/avarabyeu/releaser
GODIRS_NOVENDOR = $(shell go list ./... | grep -v /vendor/)
GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*")
PACKAGE_COMMONS=github.com/reportportal/service-ui/vendor/gopkg.in/reportportal/commons-go.v1
REPO_NAME=reportportal/service-ui

UI_BUILD_ROOT=src/main/resources/public/
BUILD_INFO_LDFLAGS=-ldflags "-extldflags '"-static"' -X ${PACKAGE_COMMONS}/commons.repo=${REPO_NAME} -X ${PACKAGE_COMMONS}/commons.branch=${COMMIT_HASH} -X ${PACKAGE_COMMONS}/commons.buildDate=${BUILD_DATE} -X ${PACKAGE_COMMONS}/commons.version=${v}"
IMAGE_NAME=reportportal/service-ui$(IMAGE_POSTFIX)

.PHONY: vendor test build

help:
	@echo "build      - go build"
	@echo "test       - go test"
	@echo "checkstyle - gofmt+golint+misspell"

vendor: ## Install glide and sync vendored dependencies
	$(if $(shell which glide 2>/dev/null),$(echo "Glide is already installed..."),$(shell go get github.com/Masterminds/glide))
	glide install

get-build-deps: vendor
	$(GO) get $(BUILD_DEPS)
	gometalinter --install

test: vendor
	$(GO) test $(glide novendor)

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
	npm --prefix $(UI_BUILD_ROOT) run test


# Builds the project
build: build-statics build-server

# Builds server
build-release: checkstyle test
	$(eval v := $(or $(v),$(shell releaser bump)))
	# make sure latest version is bumped to file
	releaser bump --version ${v}

	CGO_ENABLED=0 GOARCH=amd64 GOOS=linux $(GO) build ${BUILD_INFO_LDFLAGS} -o ${RELEASE_DIR}/service-ui_linux_amd64 ./
	CGO_ENABLED=0 GOARCH=amd64 GOOS=windows $(GO) build ${BUILD_INFO_LDFLAGS} -o ${RELEASE_DIR}/service-ui_win_amd64.exe ./
	#gox -output "release/{{.Dir}}_{{.OS}}_{{.Arch}}" -os "linux windows" -arch "amd64" ${BUILD_INFO_LDFLAGS}

	$(eval wd := $(shell pwd))
	cd build/resources/main && tar -czvf "${wd}/${RELEASE_DIR}/ui.tar.gz" ./

# Builds the container
build-image:
	docker build -t "$(IMAGE_NAME)" -f docker/Dockerfile .

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
