import React, { Component } from "react";
import { Layout } from "antd";
import "./Layout.scss";
import SiderMenu from "./Menu/SiderMenu";
import ContentLayout from "./ContentLayout";
import { MenuInfo } from "rc-menu/lib/interface";
import { MenuListMapper } from "../Utilities/Constants";
const { Sider, Header, Footer } = Layout;

interface Props {}

interface State {
  currentSubMenu:
    | "Processor Boost"
    | "Discrete GPU"
    | "Windows Power Plan"
    | "Auto Power Switching"
    | "Configuration";
}

export default class AppLayout extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentSubMenu: "Processor Boost",
    };
  }

  onChooseSubmenu = (e: MenuInfo) => {
    this.setState({
      currentSubMenu: MenuListMapper[parseInt(e.key.toString())],
    });
  };

  render() {
    let { currentSubMenu } = this.state;
    return (
      <div>
        <Layout>
          <Sider className="sider-main">
            <div className="logo" />
            <Header className="header-main">G14Control</Header>
            <SiderMenu onChooseSubmenu={this.onChooseSubmenu} />
          </Sider>
          <ContentLayout currentPage={currentSubMenu} />
        </Layout>
      </div>
    );
  }
}
