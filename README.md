etml
===
**E**nhanced **T**ext **M**arkup **L**anguage

etml is a NodeJS-built HTML enhancer. It was inspired by the way that [SCSS](http://sass-lang.com/documentation/file.SCSS_FOR_SASS_USERS.html) maintains all the syntax from vanilla CSS, yet enhances the way you are able to work with it. etml allows you to work with the HTML syntax you know and love, but provides some enhanced functionality to make development quicker and more efficient.

I built this processor out of my own necessity, and I personally use it on most of my projects. It's the perfect tool for me, but if it's not for you, feel free to [create an issue](https://github.com/chrisdothtml/node-etml/issues) and I'll be happy to consider any changes or additions.

**NOTE: I am somewhat new to the Node/npm community, and this is only my second published module. I am open to any collaborators who'd like to help with this project in any way (whether it be maintaining or offering better code solutions).**

Syntax
===

Much like the idea behind etml, the syntax was also inspired by [SCSS](http://sass-lang.com/documentation/file.SCSS_FOR_SASS_USERS.html) (with a hint of Javascript).

---

### Comments

One of my biggest gripes with HTML is the comments. They don't look very good, and you can't just quickly add them in. In etml, inline and block comments are supported. You can still use regular html comments if you want.

````
<button>Submit</button>//Submit btn

//<b>Bold Text</b>
<strong>Bold Text</strong>

/* Removing nonsense
<marquee>Welcome to my site</marquee>
<blink>I hope you like it</blink>
*/

<!-- Business as usual -->
````

compiles to

````
<button>Submit</button>

<strong>Bold Text</strong>

<!-- Removing nonsense
<marquee>Welcome to my site</marquee>
<blink>I hope you like it</blink>
-->

<!-- Business as usual -->
````

---

### Variables

````
$variable = '';
{$variable}
````

---

### File Includes

Files that are included to etml must use the `_file.etml` format. Files in this format can only be used in includes and will not be picked up by the compiler.

````
<!DOCTYPE html>
<html>
<head>
	@include 'inc/_global-head.etml';
</head>
<body>
...
````

Providing the leading underscore and file extension are optional in file imports, but the actual file still needs them.

````
@include '_filename.etml';
@include 'filename.etml';
@include 'filename';
````
---

### Escaping

If you need to escape an expression in etml, it's as simple as putting a `\` in front of it. Example:

````
\$variable: 'value';
\{$variable}
\@include 'file';
\// Not a comment
\/* Also not a comment \*/
````

outputs:

````
$variable: 'value';
@include 'file';
// Not a comment
/* Also not a comment */
````

---

### Short Tags

etml comes with some custom tags that are shortcuts for other tags. These are optional, but can make code more readable. Also, all short tags will honor any additional attributes you have on them.

````
<css id="ie-css" url="core.css">
<js url="core.js">
````

compiles to

````
<link id="ie-css" rel="stylesheet" type="text/css" href="core.css" />
<script type="text/javascript" src="core.js"></script>
````

etml Development
===

etml is built with CoffeeScript and is compiled using Grunt. Development is best suited in the /src/ directory. To work on etml, clone the repo and run:

```
npm install
```

### Debugging

etml also comes with an option to use [better-fs-errors](https://github.com/chrisdothtml/better-fs-errors) for its fs error reporting. This can be enabled by passing the option `bfe: true`. The option is set to `false` by default.

### Modules used

- [async](https://github.com/caolan/async)
- [better-fs-errors](https://github.com/chrisdothtml/better-fs-errors)
- [JS Beautifier](https://github.com/beautify-web/js-beautify)

### Text Editor Syntax Highlighting

I am currently working on a package for Sublime, but am open to any syntax highlighting help (including Sublime :blush:).