import { Container, CoditColor } from "./components/background";
import React, { useState } from "react";
import styled from "styled-components";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs"; //에러해결 단비 문장..
import PdfViewer from "./pages/pdf/PdfViewer";
import PdfParser from "./pages/pdf/PdfParser";
import { IoArrowBackOutline } from "@react-icons/all-files/io5/IoArrowBackOutline";
import { IoDocumentAttachOutline } from "@react-icons/all-files/io5/IoDocumentAttachOutline";

function App() {
  const [isTabOpen, setIsTabOpen] = useState(false);

  const closeTab = () => {
    setIsTabOpen(false);
  };
  const [fileInfo, setFileInfo] = useState(null);
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 네임 설정

      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = async function (event) {
        const pdfPath = event.target.result;
        const loadingTask = pdfjs.getDocument(pdfPath);
        const doc = await loadingTask.promise;

        setFileInfo({ fileName: file.name, fileDoc: doc });
      };
    }
  };

  return (
    <Container>
      <InputBoxLabel>
        <IoDocumentAttachOutline size={70} />
        {fileInfo ? <div> {fileInfo.fileName} </div> : <div>파일 업로드</div>}

        <input
          style={{ display: "none" }}
          id="pdf-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </InputBoxLabel>

      {fileInfo ? (
        <>
          {" "}
          <TabBox>
            <TabItem
              onClick={() => setIsTabOpen(1)}
              style={
                isTabOpen === 1
                  ? {
                      color: "white",
                      background: `${CoditColor.coditLighterBlue}`,
                    }
                  : {}
              }
            >
              PDF 원문보기
            </TabItem>
            <TabItem
              onClick={() => setIsTabOpen(2)}
              style={
                isTabOpen === 2
                  ? {
                      color: "white",
                      background: `${CoditColor.coditLighterBlue}`,
                    }
                  : {}
              }
            >
              개정사항 요약
            </TabItem>
          </TabBox>
          <Overlay isOpen={isTabOpen} onClick={closeTab} />
          <SideTab isOpen={isTabOpen}>
            {isTabOpen === 1 && fileInfo ? (
              <PdfViewer doc={fileInfo.fileDoc} />
            ) : isTabOpen === 2 && fileInfo ? (
              <PdfParser doc={fileInfo.fileDoc} />
            ) : null}
            <CloseTabButton isOpen={isTabOpen} onClick={closeTab}>
              <IoArrowBackOutline size={25} />
            </CloseTabButton>
          </SideTab>
        </>
      ) : null}
    </Container>
  );
}
export default App;
const TabBox = styled.div`
  display: flex;

  height: 300px;
  margin: 10px;
  margin: auto;
`;
const TabItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  width: 300px;
  height: 100%;
  font-size: 1.2rem;
  border: 2px solid ${CoditColor.coditDarkBlue};
  border-radius: 10px;
`;

const InputBoxLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 200px;
  margin: 50px;
  border-radius: 10px;
  color: ${CoditColor.coditDarkBlue};
  font-weight: bold;
  background: ${CoditColor.coditLightBlueOpacity};
  > * {
    margin: 5px;
  }
`;

const Overlay = styled.div`
  display: ${(props) => (props.isOpen ? "block" : "none")};
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

const SideTab = styled.div`
  position: fixed;
  top: 0;
  width: 60vw;
  box-sizing: border-box;
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5), -2px 0 5px rgba(0, 0, 0, 0.5);
  transform: ${(props) =>
    props.isOpen ? "translateY(0)" : "translateY(100%)"};
  transition: transform 0.3s ease-in-out;
  z-index: 2;
  padding: 20px;
`;

const CloseTabButton = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 5px;
  width: 3vw;
  height: calc(2vw); // width 랑 같은 값
  z-index: 2;
  color: darkgray;
  display: flex;
  justify-content: center;
  align-items: center;
`;
