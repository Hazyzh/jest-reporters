const fs = require("fs-extra");
const path = require("path");
const os = require("os");

const tempDirPath = path.resolve(
  process.env.JEST_HTML_REPORTERS_TEMP_DIR_PATH || os.tmpdir(),
  "jest-html-reporters-temp"
);

const dataDirPath = path.resolve(tempDirPath, "./data");
const attachDirPath = path.resolve(tempDirPath, "./images");

const distDirName = `./jest-html-reporters-attach`;

/**
 *
 * @param {Buffer | string} attach
 * @param {string} description
 * @param {object} context. Optional. It contains custom configs
 */
const addAttach = async (attach, description, context) => {
  const { testPath, testName } = getJestGlobalData(context);
  // type check
  if (typeof attach !== "string" && !Buffer.isBuffer(attach)) {
    console.error(
      `[jest-html-reporters]: Param attach error, not a buffer or string, pic ${testName} - ${description} log failed.`
    );
    return;
  }

  const fileName = generateRandomString();
  if (typeof attach === "string") {
    const attachObject = { testPath, testName, filePath: attach, description };
    await fs.writeJSON(`${dataDirPath}/${fileName}.json`, attachObject);
  }

  if (Buffer.isBuffer(attach)) {
    const path = `${attachDirPath}/${fileName}.jpg`;
    try {
      await fs.writeFile(path, attach);
      const attachObject = {
        testPath,
        testName,
        fileName: `${fileName}.jpg`,
        description,
      };
      await fs.writeJSON(`${dataDirPath}/${fileName}.json`, attachObject);
    } catch (err) {
      console.error(err);
      console.error(
        `[jest-html-reporters]: Param attach error, can not save as a image, pic ${testName} - ${description} log failed.`
      );
    }
  }
};

/**
 *
 * @param {string} message
 * @param {object} context. Optional. It contains custom configs
 */
const addMsg = async (message, context) => {
  const { testPath, testName } = getJestGlobalData(context);
  const fileName = generateRandomString();
  const attachObject = { testPath, testName, description: message };
  await fs.writeJSON(`${dataDirPath}/${fileName}.json`, attachObject);
};

const getJestGlobalData = (globalContext) => {
  let testPath = "";
  let currentTestName = "";
  const context = globalContext || global;
  [...Object.getOwnPropertySymbols(context)].forEach((key) => {
    if (context[key].state && context[key].matchers) {
      const state = context[key].state || {};
      testPath = state.testPath;
      currentTestName = state.currentTestName;
    }
  });
  return { testPath, testName: currentTestName };
};

const generateRandomString = () => `${Date.now()}${Math.random()}`;

const readAttachInfos = async (publicPath, multipleReportsUnitePath) => {
  const result = {};
  try {
    const exist = await fs.pathExists(dataDirPath);

    if (!exist) {
      console.info(
        "Temp folder not exist, means that attach Infos may append unsuccessful"
      );
      return result;
    }

    const attachData = await fs.readdir(dataDirPath);
    const dataList = await Promise.all(
      attachData.map((data) =>
        fs.readJSON(`${dataDirPath}/${data}`, { throws: false })
      )
    );
    const outPutDir = !!multipleReportsUnitePath
      ? path.resolve(multipleReportsUnitePath, distDirName)
      : path.resolve(publicPath, distDirName);
    const attachFiles = await fs.readdir(attachDirPath);
    if (attachFiles.length) await fs.copy(attachDirPath, outPutDir);

    dataList.forEach((attachObject) => {
      if (!attachObject) return;

      const {
        testPath,
        testName,
        filePath,
        description,
        fileName,
      } = attachObject;
      let attachMappingName = testName || "jest-html-reporters-file-attach";

      if (!result[testPath]) result[testPath] = {};
      if (!result[testPath][attachMappingName])
        result[testPath][attachMappingName] = [];

      result[testPath][attachMappingName].push({
        filePath: fileName ? `${distDirName}/${fileName}` : filePath,
        description: description || "",
      });
    });
  } catch (err) {
    console.error(err);
    console.error(`[jest-html-reporters]: parse attach failed!`);
  }

  return result;
};

// For options
const PUBLIC_PATH = "publicPath";
const FILE_NAME = "filename";
const EXPAND = "expand";
const PAGE_TITLE = "pageTitle";
const LOGO_IMG_PATH = "logoImgPath";
const HIDE_ICON = "hideIcon";
const CUSTOM_INFOS = "customInfos";
const TEST_COMMAND = "testCommand";
const OPEN_REPORT = "openReport";
const MULTIPLE_REPORTS_UNITE_PATH = "multipleReportsUnitePath";
const FAILURE_MESSAGE_ONLY = "failureMessageOnly";
const ENABLE_MERGE_DATA = "enableMergeData";
const DATA_MERGE_LEVEL = "dataMergeLevel";
const ENABLE_GRAPH = "enableGraph";

const constants = {
  ENVIRONMENT_CONFIG_MAP: {
    JEST_HTML_REPORTERS_PUBLIC_PATH: PUBLIC_PATH,
    JEST_HTML_REPORTERS_FILE_NAME: FILE_NAME,
    JEST_HTML_REPORTERS_EXPAND: EXPAND,
    JEST_HTML_REPORTERS_PAGE_TITLE: PAGE_TITLE,
    JEST_HTML_REPORTERS_LOGO_IMG_PATH: LOGO_IMG_PATH,
    JEST_HTML_REPORTERS_HIDE_ICON: HIDE_ICON,
    JEST_HTML_REPORTERS_CUSTOM_INFOS: CUSTOM_INFOS,
    JEST_HTML_REPORTERS_TEST_COMMAND: TEST_COMMAND,
    JEST_HTML_REPORTERS_OPEN_REPORT: OPEN_REPORT,
    JEST_HTML_REPORTERS_MULTIPLE_REPORTS_UNITE_PATH: MULTIPLE_REPORTS_UNITE_PATH,
    JEST_HTML_REPORTERS_FAILURE_MESSAGE_ONLY: FAILURE_MESSAGE_ONLY,
    JEST_HTML_REPORTERS_ENABLE_MERGE_DATA: ENABLE_MERGE_DATA,
    JEST_HTML_REPORTERS_DATA_MERGE_LEVEL: DATA_MERGE_LEVEL,
    JEST_HTML_REPORTERS_ENABLE_GRAPH: ENABLE_GRAPH,
  },
  DEFAULT_OPTIONS: {
    [PUBLIC_PATH]: process.cwd(),
    [FILE_NAME]: "jest_html_reporters.html",
    [EXPAND]: false,
    [PAGE_TITLE]: "",
    [LOGO_IMG_PATH]: undefined,
    [HIDE_ICON]: false,
    [CUSTOM_INFOS]: undefined,
    [TEST_COMMAND]: "npx jest",
    [OPEN_REPORT]: process.env.NODE_ENV === "development",
    [MULTIPLE_REPORTS_UNITE_PATH]: "",
    [FAILURE_MESSAGE_ONLY]: false,
    [ENABLE_MERGE_DATA]: false,
    [DATA_MERGE_LEVEL]: 1,
    [ENABLE_GRAPH]: false,
  },
};

function getEnvOptions() {
  const options = {};
  for (const name in constants.ENVIRONMENT_CONFIG_MAP) {
    if (process.env[name]) {
      options[constants.ENVIRONMENT_CONFIG_MAP[name]] = process.env[name];
    }
  }
  return options;
}

const getOptions = (reporterOptions = {}) =>
  Object.assign(
    {},
    constants.DEFAULT_OPTIONS,
    reporterOptions,
    getEnvOptions()
  );

module.exports = {
  getOptions,
  addAttach,
  addMsg,
  readAttachInfos,
  dataDirPath,
  attachDirPath,
  distDirName,
  tempDirPath,
};
