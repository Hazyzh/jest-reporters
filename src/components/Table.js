import React from "react";
import { Table, Tag, message } from "antd";
import copy from "copy-to-clipboard";
import { renderRootRowClass, getFormatTime, getExistKeys } from "@/untils";
import DetailTable from "./DetailTable";
import ErrorButton from "./ErrorButton";
import { CloseOutlined, CheckOutlined, FileTwoTone } from "@ant-design/icons";
// export const file = '/Users/harry.hou/Desktop/harry/salesforce/salesforce-cti-widget/'
import { Consumer } from "../contexts/expand";

export const renderStatus = ({
  numPassingTests,
  numFailingTests,
  numPendingTests,
  numTodoTests,
  testExecError,
}) => {
  let tagsInfo;
  if (testExecError) {
    tagsInfo = (
      <span style={{ color: "#52c41a" }}>
        <Tag color="#cf1322" className="one_tag">
          Exec Error
          <span />
          <CloseOutlined />
        </Tag>
      </span>
    );
  } else if (numFailingTests === 0 && numPendingTests === 0) {
    tagsInfo = (
      <span style={{ color: "#52c41a" }}>
        <Tag color="#52c41a" className="one_tag">
          All Passed
          <span>{numPassingTests}</span>
          <CheckOutlined />
        </Tag>
      </span>
    );
  } else {
    tagsInfo = (
      <span>
        <Tag color="#52c41a">{numPassingTests}</Tag>
        {!!numFailingTests && <Tag color="#cf1322">{numFailingTests}</Tag>}
        {!!numPendingTests && <Tag color="#faad14">{numPendingTests}</Tag>}
        {!!numTodoTests && <Tag color="#d466d6">{numTodoTests}</Tag>}
      </span>
    );
  }

  return <div className="mian_table_tags">{tagsInfo}</div>;
};

const renderTime = ({ perfStats: { start, end } }) => getFormatTime(start, end);

const getColumns = (rootDir, execCommand, attachInfos) => [
  {
    title: "File",
    dataIndex: "testFilePath",
    key: "name",
    render: (text, results) => {
      let caseTitle = `Test title not found. Path: ${text}`
      if(results.testResults.length && results.testResults[0].ancestorTitles.length) {
          caseTitle = results.testResults[0].ancestorTitles[0] || 'Title error'
      }
      const relativePath = text
      return (
        <span>
          <span className="copy_icon" title="click to copy path to clipborad">
            <FileTwoTone
              onClick={() => {
                const command = `${execCommand} .${relativePath}`;
                copy(command);
                message.success(
                  "Copy succeed! The command has been copied to the clipboard."
                );
              }}
            />
          </span>
          <span className="path_text" id={text}>
            {" "}
            {caseTitle}
          </span>
        </span>
      );
    },
  },
  {
    title: "UseTime",
    key: "UseTime",
    render: renderTime,
    width: "150px",
    sorter: (a, b) =>
      a.perfStats.end -
      a.perfStats.start -
      (b.perfStats.end - b.perfStats.start),
  },
  {
    title: "Status",
    key: "status",
    render: renderStatus,
    width: "150px",
    filters: [
      { text: "Passed", value: "passed" },
      { text: "Failed", value: "failed" },
      { text: "Pending", value: "pending" },
      { text: "Todo", value: "todo" },
      { text: "Not Passed", value: "noPass" },
    ],
    filterMultiple: false,
    onFilter: (
      value,
      { numFailingTests, numPendingTests, testExecError, numTodoTests }
    ) => {
      switch (value) {
        case "passed":
          return !(testExecError || numFailingTests > 0 || numPendingTests > 0);
        case "failed":
          return testExecError || numFailingTests > 0;
        case "pending":
          return numPendingTests > 0;
        case "todo":
          return numTodoTests > 0;
        case "noPass":
          return testExecError || numFailingTests > 0 || numPendingTests > 0;
      }
    },
  },
  {
    width: "100px",
    title: "Action",
    key: "operation",
    render: ({ testFilePath = "", failureMessage }) => (
      <ErrorButton
        failureMessage={failureMessage}
        testFilePath={testFilePath.replace(new RegExp("^" + rootDir), "")}
        caseAttachInfos={
          (attachInfos[testFilePath] &&
            attachInfos[testFilePath]["jest-html-reporters-file-attach"]) ||
          []
        }
      />
    ),
  },
];

const TableItem = ({
  _reporterOptions,
  testResults,
  config: { rootDir },
  globalExpandState,
  attachInfos,
}) => (
  <Consumer>
    {({ expand, toggleExpand }) => (
      <Table
        size="small"
        pagination={false}
        rowKey="testFilePath"
        rowClassName={renderRootRowClass}
        expandedRowRender={({ testResults, testFilePath }) => (
          <DetailTable
            data={testResults.map((item) => ({
              ...item,
              fileAttachInfos: attachInfos[testFilePath] || {},
            }))}
            defaultMerge={_reporterOptions.enableMergeData}
            defaultMergeLevel={_reporterOptions.dataMergeLevel}
          />
        )}
        expandedRowKeys={getExistKeys(expand, globalExpandState)}
        onExpand={(state, { testFilePath }) =>
          toggleExpand({ key: testFilePath, state })
        }
        columns={getColumns(rootDir, _reporterOptions.testCommand, attachInfos, testResults)}
        dataSource={testResults}
      />
    )}
  </Consumer>
);

export default TableItem;
