import React, { Component } from "react";
import * as cp from "child_process";
import { ChildProcess } from "child_process";

interface Props {}

interface State {
  plans: string;
}

export default class WindowsPowerPlan extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      plans: "",
    };
  }

  componentDidMount() {
    let child: ChildProcess = cp.exec("powercfg /l");
    child.on("message", (msg) => {
      this.setState({ plans: msg });
    });
  }
  render() {
    let { plans } = this.state;
    return <div>{plans ? plans : ""}</div>;
  }
}
