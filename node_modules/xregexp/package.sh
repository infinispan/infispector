#!/bin/sh
rm -f index.js
for jsfile in src/xregexp.js src/xregexp-*.js
do
	echo '' >> index.js
	echo "/***** $jsfile *****/" >> index.js
	echo '' >> index.js
	cat $jsfile >> index.js
done
echo '' >> index.js
echo '/***** Export as Common JS module *****/' >> index.js
echo '' >> index.js
echo 'module.exports = XRegExp;' >> index.js
