#! /bin/sh 

BASE_PATH=../editor/js

MIN_FILES="$BASE_PATH/jquery-ui-1.8.10.custom/js/jquery-1.4.4.min.js"
MIN_FILES="$MIN_FILES $BASE_PATH/jquery-ui-1.8.10.custom/js/jquery-ui-1.8.10.custom.min.js"
# MIN_FILES="$MIN_FILES $BASE_PATH/ace/ace-noconflict.js"
# MIN_FILES="$MIN_FILES $BASE_PATH/ace/theme-cobalt-noconflict.js"
# MIN_FILES="$MIN_FILES $BASE_PATH/ace/mode-html-noconflict.js"

# echo $FILES;
# exit; 

echo "" > bundle.min.js

for js in $MIN_FILES; do
    echo $js;
    echo "\n" >> bundle.min.js;
    cat $js >> bundle.min.js;
done;

FILES="$BASE_PATH/jquery.tipsy.js"
FILES="$FILES $BASE_PATH/layoutside.src.js"

for js in $FILES; do
    echo $js;
    echo "\n" >> bundle.min.js;
    # java -jar compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS --js $js >> bundle.min.js
    java -jar yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar $js >> bundle.min.js;
done;

cp bundle.min.js ../editor/js/;
echo "Done.";

