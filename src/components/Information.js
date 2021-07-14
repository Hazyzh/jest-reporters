import React from "react";
import { Row, Col, Card } from "antd";
import randomColor from "randomcolor";
import { getFormatTime, getFormatData, scrollTo, formatDate } from "@/untils";
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TimeIcon } from "@/untils/icons";
import { Consumer } from "../contexts/expand";
import {
  FileOutlined,
  CheckOutlined,
  CloseOutlined,
  Loading3QuartersOutlined,
  PieChartFilled,
  BoxPlotFilled,
  ClockCircleFilled,
  FolderFilled,
  CompassFilled,
} from "@ant-design/icons";

const colors = [...new Array(40)].map((d) => randomColor());

const CustomTooltip = ({ active, payload, label, rootDir, chartTooltip }) => {
  if (active && Array.isArray(payload) && !!payload[0] && !!payload[0].payload) {
    const {
      time,
      name,
      numFailingTests,
      numPassingTests,
      numPendingTests,
      testResults,
    } = payload[0].payload;
    const relativePath = name.replace(new RegExp("^" + rootDir), "");
    const lists = [
      { icon: <TimeIcon />, title: "Time", content: `${time} S` },
      { icon: <FileOutlined />, title: "Name", content: relativePath },
      {
        icon: <CheckOutlined style={{ color: "green" }} />,
        title: "Passed",
        content: numPassingTests,
      },
      {
        icon: <CloseOutlined style={{ color: "#ff4d4f" }} />,
        title: "Failed",
        content: numFailingTests,
      },
      {
        icon: <Loading3QuartersOutlined style={{ color: "#faad14" }} />,
        title: "Pending",
        content: numPendingTests,
      },
    ];
    if (chartTooltip) {
      return (
        <Card style={{ width: "100%" }}>
          {lists.map((item, i) => (
            <div className="tooltip_box" key={i}>
              <span className="icon">{item.icon}</span>
              <span className="title">{item.title} </span>
              <span className="symbol">:</span>
              <span className="content">{item.content}</span>
            </div>
          ))}
        </Card>
      );
    }
    return (
      <Card style={{ width: 700 }}>
        <Row gutter={12}>
          <Col span={16}>
            {lists.map((item, i) => (
              <div className="tooltip_box" key={i}>
                <span className="icon">{item.icon}</span>
                <span className="title">{item.title} </span>
                <span className="symbol">:</span>
                <span className="content">{item.content}</span>
              </div>
            ))}
          </Col>
          <Col span={8}>
            <p className="chart_title">Duration Ratio</p>
            <ResponsiveContainer width={"100%"} height={100}>
              <PieChart>
                <Pie
                  data={testResults}
                  dataKey="duration"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  animationDuration={500}
                >
                  {testResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % 40]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Col>
        </Row>
      </Card>
    );
  }
  return null;
};

export const SimpleBarChart = ({ data, rootDir }) => {
  return (
    <Consumer>
      {({ toggleExpand }) => (
        <ResponsiveContainer width={"100%"} height={300}>
          <BarChart
            data={getFormatData(data)}
            margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 10" />
            <XAxis hide />
            <YAxis />
            <Tooltip content={<CustomTooltip rootDir={rootDir} />} />
            <Legend verticalAlign="top" wrapperStyle={{ lineHeight: "40px" }} />
            <ReferenceLine y={0} stroke="#000" />
            <Brush height={20} stroke="#8884d8" />
            <Bar
              dataKey="time"
              name="Suite Time"
              fill="#0ebf8c"
              onClick={({ name }) => {
                scrollTo(name, toggleExpand);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Consumer>
  );
};

const LabelInfo = ({ title, icon, context }) => (
  <p>
    <span className="label_title">
      {icon} {title}
    </span>
    <span className="label_value">{context}</span>
  </p>
);

const Information = ({
  config: { rootDir, maxWorkers},
  _reporterOptions: {enableGraph},
  startTime,
  endTime,
  testResults,
}) => (
  <Consumer>
    {({ toggleExpand }) => (
      <Row>
        {enableGraph ? 
        <Col span={18}>
          <SimpleBarChart data={testResults} rootDir={rootDir} />
        </Col> : null}
        { enableGraph ? 
        <Col span={6}>
          <p className="chart_title">
            <PieChartFilled style={{ marginRight: "5px" }} />
            Timing Ratio
          </p>
          <ResponsiveContainer
            className="chart_content_box"
            width={"100%"}
            height={300}
          >
            <PieChart>
              <Pie
                data={getFormatData(testResults)}
                dataKey="time"
                cx="50%"
                cy="50%"
                outerRadius={"90%"}
                onClick={({ name }) => {
                  scrollTo(name, toggleExpand);
                }}
                animationDuration={500}
              >
                {testResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % 40]} />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip rootDir={rootDir} chartTooltip />}
              />
            </PieChart>
          </ResponsiveContainer>
        </Col> : null}
        <Col span={24} className="main_information">
          <Card>
            <Row span={24}>
              <Col span={8}>
                <LabelInfo
                  className="StartTime"
                  title="StartTime"
                  context={formatDate(startTime)}
                  icon={<BoxPlotFilled />}
                />
              </Col>
              <Col span={8}>
                <LabelInfo
                  className="Time"
                  title="Time"
                  context={getFormatTime(startTime, endTime)}
                  icon={<ClockCircleFilled />}
                />
              </Col>
              <Col span={8}>
                <LabelInfo
                  className="MaxWorkers"
                  title="MaxWorkers"
                  context={maxWorkers}
                  icon={<CompassFilled />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    )}
  </Consumer>
);

export default Information;
