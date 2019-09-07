const fs = require('fs')
const path = require('path')
const localTemplatePath = path.resolve(__dirname, './dist/index.html')

function mkdirs(dirpath) {
  if (!fs.existsSync(path.dirname(dirpath))) {
    mkdirs(path.dirname(dirpath))
  }
  fs.mkdirSync(dirpath)
}

// my-custom-reporter.js
class MyCustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig
    this._options = options
  }

  onRunComplete(contexts, results) {
    results.config = this._globalConfig
    results.endTime = Date.now()
    results._reporterOptions = this._options
    let data = JSON.stringify(results)
    const {
      publicPath = process.cwd(),
      filename = 'jest_html_reporters.html',
      hideIcon = false,
      pageTitle = 'Report'
    } = this._options
    fs.existsSync(publicPath) === false && publicPath && mkdirs(publicPath)
    const filePath = path.resolve(publicPath, filename)
    const htmlTemplate = fs.readFileSync(localTemplatePath, 'utf-8')
    data = JSON.stringify({ testResult: results, config: { pageTitle, hideIcon } });
    const outPutContext = htmlTemplate
      .replace('$resultData', JSON.stringify(data))
    fs.writeFileSync(filePath, outPutContext, 'utf-8')
    console.log('📦 reporter is created one:', filePath)
  }
}

module.exports = MyCustomReporter
