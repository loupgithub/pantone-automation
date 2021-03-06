#
# Create a distributable copy in the builds folder
#

if [ "$JSXP_COMMANDS_DIR" == "" -o ! -d "$JSXP_COMMANDS_DIR" ]; then
	export JSXP_COMMANDS_DIR=`dirname "$0"`/
fi

pushd "$JSXP_COMMANDS_DIR" > /dev/null

export JSXP_COMMANDS_DIR=`pwd`/

. setTarget.command

echo ""
echo Removing directory "$BUILD_DIR"
echo ""

rm -rf "$BUILD_DIR"

echo ""
echo Re-creating directory "$BUILD_DIR"
echo ""

mkdir "$BUILD_DIR"

export BUILD_SCRIPT_ROOT_DIR="${BUILD_DIR}${TARGET_DIRNAME}/"

echo ""
echo Creating directory "$BUILD_SCRIPT_ROOT_DIR"
echo ""

mkdir "$BUILD_SCRIPT_ROOT_DIR"

echo ""
echo Copying script files and readme file
echo ""

cp "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}.${TARGET_FILENAME_EXTENSION}" "$BUILD_SCRIPT_ROOT_DIR"
if [ -f "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}.htm" ]; then
	cp "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}.htm" "$BUILD_SCRIPT_ROOT_DIR"
fi
cp "${PROJECT_ROOT_DIR}ReadMe for ${DESPACED_TARGET_NAME}.md" "$BUILD_SCRIPT_ROOT_DIR"
cp -R "${PROJECT_ROOT_DIR}${DESPACED_TARGET_NAME}_helpers" "${BUILD_SCRIPT_ROOT_DIR}"

cd "$BUILD_DIR"

zip -r ${DESPACED_TARGET_NAME}.${PROJECT_VERSION}.zip "${TARGET_DIRNAME}"

rm -rf "${TARGET_DIRNAME}"

echo ""
echo "Compressed release created: ${BUILD_DIR}${DESPACED_TARGET_NAME}.${PROJECT_VERSION}.zip"
echo ""
echo "You can now close this Terminal window"
echo ""

popd > /dev/null
