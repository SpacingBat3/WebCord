## How to translate?
- fork this project,
- clone (download) it to your computer,
- create new folder for your translation (check [electron docs](https://www.electronjs.org/docs/api/locales) for list of possible codes – names of the folders),
- copy the lang strings you want to translate from (mostly [lang/en-GB/strings.json](lang/en-GB/strings.json)) to the dir with code of your language you want to translate to,
- publish the strings to your GitHub fork,
- do a Pull Request (here's [random youtube tutorial](https://www.youtube.com/watch?v=dSl_qnWO104) how to do that),
- you're done!

## Don't know the JSON syntax?
Here's the basic information about the proper JSON syntax:
- the JSON file should begin from and end on the braces (`{`,`}`),
- JSON file can contain keys, values, arrays and objects – example use of all of these:
```json
{
	"key": "value",
	"array": [ "firstValue", "secondValue" ],
	"object": { "firstKey": "firstValue", "secondKey": "secondValue" }
}
```
- the keys of JSON files must end with the comma (`,`) signs only when there's another key after them – for an example:
```json
{
	"key": "value",
	"anotherKey": "anotherValue"
}
```
Adding the comma sign at the end of `"anotherKey"` or removing it from the end of `"key"` would be a syntax error:
```
{
	"key": "value",
	"anotherKey": "anotherValue",
}
```

## The people that helped me with the app translation:
(add yourself there if you weren't added before/after you do a PR):
- [MrCoolAndroid](https://github.com/MrCoolAndroid) – Spanish translation
