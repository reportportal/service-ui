$VERSION=$1
$IMAGE_NAME=$2
BRANCH='git branch --show-current'
COMMIT_SHA='git rev-parse HEAD | git hash-object --stdin'
BUILD_DATE='date +%FT%T%z'
docker build -t \$IMAGE_NAME --build-arg version=\$VERSION --build-arg build_date=\$BUILD_DATE --build-arg branch=\$BRANCH-\$COMMIT_SHA -f Dockerfile-full .