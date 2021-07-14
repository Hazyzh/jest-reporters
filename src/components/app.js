import React, { Component } from "react";
// import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { Layout, Avatar } from "antd";
import HomePage from "../pages/HomePage";
import FooterInfo from "./FooterInfo";
import "../styles/app.less";
import "../styles/index.less";
import "../styles/dashBoard.less";
import "../styles/information.less";
import "../styles/footer.less";
import { GithubFilled } from "@ant-design/icons";

// context
import { Provider } from "../contexts/expand";

const getInitData = ({ testResults = [] }) =>
  testResults.reduce((pre, item) => {
    pre[item.testFilePath] = false;
    return pre;
  }, {});
const defaultTitle = "Report";
const { Header, Content, Footer } = Layout;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: getInitData(props.data),
      toggleExpand: this.toggleExpand,
    };
  }

  toggleExpand = ({ key, state }) => {
    this.setState(({ expand }) => ({ expand: { ...expand, [key]: state } }));
  };

  render() {
    const { data } = this.props;
    const { hideIcon, pageTitle = defaultTitle } = data._reporterOptions;
    const { logoImg } = data._reporterOptions;
    const IconComp = hideIcon ? null : (
      <a
        target="_blank"
        className="icon"
        href="https://github.com/cookieps/jest-html-reporters-custom"
      >
        <GithubFilled />
      </a>
    );
    return (
      <Provider value={this.state}>
        <Layout className="layout">
          {(logoImg || pageTitle || IconComp) &&
              <Header className='header'>
                {logoImg && (
                  <Avatar
                    src={logoImg}
                    shape='square'
                    size='large'
                    style={{ marginRight: '1em' }}
                  />
                )}
                <span data-testid='page-title'>{pageTitle}</span>
                {IconComp}
              </Header>}
          <Content style={{ padding: "0 50px" }}>
            <HomePage realData={data} />
          </Content>
          <Footer style={{ marginTop: "50px", background: "#000" }}>
            <FooterInfo />
          </Footer>
        </Layout>
      </Provider>
    );
  }
}

export default App;
