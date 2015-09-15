etml
===

> A preprocessor that enhances HTML

### Usage

This is the core api module and is not meant to be used on its own. etml is available for use as [node-etml](https://github.com/chrisdothtml/node-etml) or [grunt-etml](https://github.com/chrisdothtml/grunt-etml).

### About etml

**E**nhanced **T**ext **M**arkup **L**anguage

etml is a Node-built HTML enhancer. It was inspired by the way that [SCSS](http://sass-lang.com/documentation/file.SCSS_FOR_SASS_USERS.html) works with vanilla CSS syntax, yet extends it to allow you to do more programmatic things. etml allows you to work with the HTML syntax you know and love, but provides some enhanced functionality to make development quicker and more efficient.

I built this processor out of my own necessity as a front end developer who frequently needs to build out standalone project mockups. It's the perfect tool for me; if it's not for you, feel free to send an [issue/request](https://github.com/chrisdothtml/etml-api/issues) and I'll be happy to consider any changes or additions.

### Syntax

#### Comments

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

#### Variables

````
$variable = '';
{$variable}
````

---

#### File Includes

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

#### Escaping

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

#### Short Tags

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

### etml Development

etml is built with CoffeeScript and is compiled using Grunt. The source files can be found in the /src/ directory. To work on etml, clone the repo and run:

```
npm install
```

I am open to collaborators who are interested in helping with this project in any way. If you're interested in getting involved, just shoot me an [email](mailto:chris@deacy.io). I am currently working on a syntax highlighting package for Sublime, but am open to any syntax highlighting help (including Sublime :blush:).

### Dependencies

- [async](https://github.com/caolan/async)
- [defaults](https://github.com/tmpvar/defaults)
- [JS Beautifier](https://github.com/beautify-web/js-beautify)