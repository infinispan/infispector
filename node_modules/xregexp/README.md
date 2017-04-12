
This is [XRegExp](http://xregexp.com) in a Common JS module. All plugins and
unicode packages are included as well. I'm not affiliated with Steven Levithan,
the author of XRegExp.


Installation
------------

    npm install xregexp


Usage example
-------------

For JavaScripters:

    var XRegExp = require('xregexp');
    
    console.log('Héllö Wôrld'.match(XRegExp('\\p{L}+')));
    
    var date = XRegExp('(?<year>  [0-9]{4})  -?  # year  \n\
                        (?<month> [0-9]{2})  -?  # month \n\
                        (?<day>   [0-9]{2})      # day   ', 'x');
    var match = date.exec('2011-06-30');
    if (match) {
      console.log(match.day);
    }

For CoffeeScripters:

    XRegExp = require 'xregexp'
    
    console.log 'Héllö Wôrld'.match XRegExp '\\p{L}+'
    
    date = XRegExp '''
      (?<year>  [0-9]{4})  -?  # year
      (?<month> [0-9]{2})  -?  # month
      (?<day>   [0-9]{2})      # day
    ''', 'x'
    match = date.exec '2011-06-30'
    console.log match.day if match


Changelog
---------

This is Steven Levithan's own words.

 *  1.5.1: Several bugs fixed and updated to use Unicode 6.1 character database (instead of 5.2).


License
-------

This project includes the software packages:

 *  XRegExp 1.5.1
 *  XRegExp Unicode plugin base 0.6
 *  XRegExp Unicode plugin pack: Categories 1.1
 *  XRegExp Unicode plugin pack: Scripts 1.1
 *  XRegExp Unicode plugin pack: Blocks 1.1
 *  XRegExp Match Recursive plugin 0.1.1

The software is released under the MIT license:

    Copyright (c) 2007-2010 Steven Levithan <http://xregexp.com>
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to
    deal in the Software without restriction, including without limitation the
    rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
    sell copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
    IN THE SOFTWARE.

