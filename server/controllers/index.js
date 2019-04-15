const path = require('path')
const fs = require('fs')

const filename = path.basename(__filename)
const controllers = {}

//dynamic require  of all files in directory
//filters out hidden files and current file, then puts filename:require('./filename') key:val pari in to controllers object
fs.readdirSync(__dirname)
	.filter(file => {
		return (
			file.indexOf('.') !== 0 && file !== filename && file.slice(-3) === '.js'
		)
	})
	.forEach(file => {
		if (file.slice(-3) === '.js') {
			const name = file.slice(0, -3)
			const fileDir = './' + name
			controllers[name] = require(fileDir)
		}
	})

module.exports = controllers
