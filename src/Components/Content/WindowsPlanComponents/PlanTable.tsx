import React, { Component } from "react";
import { Table } from "antd";

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "GUID",
    dataIndex: "guid",
    key: "guid",
  },
];

interface Props {
  data: Array<{ name: string; guid: string }>;
}

interface State {
  top: string;
  bottom: string;
}

export default class PlanTable extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      top: "topLeft",
      bottom: "bottomRight",
    };
  }

  render() {
    let { data } = this.props;
    return (
      <div>
        <Table pagination={false} columns={columns} dataSource={data} />
      </div>
    );
  }
}
