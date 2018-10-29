# Autopug

Watch a directory for changes made to `.pug` files and compile them immediately to HTML.

Good for, if for some reason you *must* work with raw HTML (like templates for hyperHTML or something else), you can still write your page in Pug.

## Usage

``` shell
autopug 
    -s <source directory[./autopug]> 
    -d <destination directory[./]> 
    -p <prettify[true]> &
```

If no `./autopug` directory exists, the script will create one automatically.

