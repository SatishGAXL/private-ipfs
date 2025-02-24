import { useEffect, useState } from "react";
import { MessageInstance } from "antd/es/message/interface";
import { BACKEND_URL, IPFS_GATEWAY } from "./config";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { message, Upload, Table } from "antd";

import { Space } from "antd";
import { NavLink } from "react-router-dom";

import "./App.css";

interface DataType {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  cid: string;
}

const columns = [
  {
    title: "File Name",
    key: "name",
    render: (_: any, record: DataType) => <>{record.name}</>,
  },
  {
    title: "Size",
    dataIndex: "size",
    key: "size",
    render: (text: number) => <>{text} bytes</>,
  },
  {
    title: "Mime Type",
    dataIndex: "mime_type",
    key: "mime_type",
    render: (text: string) => <>{text}</>,
  },
  {
    title: "CID",
    dataIndex: "cid",
    key: "cid",
    render: (text: string) => (
      <a target="_blank" href={`${IPFS_GATEWAY}/${text}`}>
        {text}
      </a>
    ),
  },
  {
    title: "Action",
    key: "action",
    render: (_: any, record: DataType) => (
      <Space size="middle">
        <a
          onClick={async () => {
            const response = await fetch(
              `${BACKEND_URL}/get-private-url/${record.cid}`
            );
            window.open(await response.text(), "_blank");
          }}
        >
          Get Private URL
        </a>
      </Space>
    ),
  },
];

const { Dragger } = Upload;

export const Home = ({ messageApi }: { messageApi: MessageInstance }) => {
  const [data, setData] = useState<DataType[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/get-files`);
      const result = await response.json();
      console.log(result);
      setData(result);
      setLoading(false);
    } catch {
      messageApi.error("Failed to fetch data");
      setLoading(false);
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    action: `${BACKEND_URL}/upload-file`,
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        if (info.file.response.isDuplicate) {
          message.error(`${info.file.name} file is already in IPFS.`);
        } else {
          message.success(`${info.file.name} file uploaded successfully.`);
          fetchFiles();
        }
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="mainWrapper">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div>
          <h1 className="pageTitle">Home</h1>
          <div className="uploadWrapper">
            <Dragger {...props}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from
                uploading company data or other banned files.
              </p>
            </Dragger>
          </div>
          <div className="tableWrapper">
            <Table<DataType> columns={columns} dataSource={data || []} />
          </div>
        </div>
      )}
    </div>
  );
};
