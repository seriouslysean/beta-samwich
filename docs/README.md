# Beta Samwich

Beta Samwich is a tool that utilizes [Puppeteer](https://pptr.dev/) to search for multiple keywords on [beta.sam.gov](https://beta.sam.gov) and dedupe/export all results.

## Requirements

* [Node](https://nodejs.org/) (version `>=10.0.0`)
* [NPM](https://www.npmjs.com/get-npm) (version `>=6.4.0`)

## Installation

* [Windows](https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows)
* [MacOS](https://github.com/tj/n)

## Usage

* Run `npm ci` to install the dependencies
* Run `npm run start -- --keywords "foo"` to do a search

You can also search for multiple keywords instead by seaprating them with a comma:

* Run `npm run start -- --keywords "foo, bar, baz"` to do a search

If exporting is enabled, all files will be saved in the `/output` folder, prefixed with the keyword used.
