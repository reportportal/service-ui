.DEFAULT_GOAL := build

COMMIT_HASH = `git rev-parse --short HEAD 2>/dev/null`
BUILD_DATE = `date +%FT%T%z`

GO = go
BINARY_DIR=bin
RELEASE_DIR=release

BUILD_DEPS:= github.com/avarabyeu/releaser mvdan.cc/gofumpt/gofumports
GODIRS_NOVENDOR = $(shell go list ./... | grep -v /vendor/)
GOFILES_NOVENDOR = $(shell find . -type f -name '*.go' -not -path "./vendor/*")
PACKAGE_COMMONS=github.com/reportportal/commons-go
REPO_NAME=reportportal/service-ui

UI_BUILD_REACT=app/

BUILD_INFO_LDFLAGS=-ldflags "-extldflags '"-static"' -X ${PACKAGE_COMMONS}/commons.repo=${REPO_NAME} -X ${PACKAGE_COMMONS}/commons.branch=${COMMIT_HASH} -X ${PACKAGE_COMMONS}/commons.buildDate=${BUILD_DATE} -X ${PACKAGE_COMMONS}/commons.version=${v}"
IMAGE_NAME=reportportal-dev-5/service-ui$(IMAGE_POSTFIX)

.PHONY: get-build-deps test build

help:
	@echo "build      - go build"
	@echo "test       - go test"
	@echo "checkstyle - gofmt+golint+misspell"

get-build-deps:
	curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b "$(shell go env GOPATH)/bin" v1.28.0
	$(GO) get $(BUILD_DEPS)

test:
	$(GO) test ${GODIRS_NOVENDOR}


checkstyle:
	golangci-lint run --deadline 10m

fmt:
	gofmt -l -w -s ${GOFILES_NOVENDOR}
#	gofumpt -l -w -s ${GOFILES_NOVENDOR}
#	gofumports -l -w ${GOFILES_NOVENDOR}

# Builds server
build-server: checkstyle test
	CGO_ENABLED=0 GOOS=linux $(GO) build ${BUILD_INFO_LDFLAGS} -o ${BINARY_DIR}/service-ui ./

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

	CGO_ENABLED=0 GOARCH=amd64 GOOS=linux $(GO) build ${BUILD_INFO_LDFLAGS} -o ${RELEASE_DIR}/service-ui_linux_amd64 ./
	CGO_ENABLED=0 GOARCH=amd64 GOOS=windows $(GO) build ${BUILD_INFO_LDFLAGS} -o ${RELEASE_DIR}/service-ui_win_amd64.exe ./
	#gox -output "release/{{.Dir}}_{{.OS}}_{{.Arch}}" -os "linux windows" -arch "amd64" ${BUILD_INFO_LDFLAGS}

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
