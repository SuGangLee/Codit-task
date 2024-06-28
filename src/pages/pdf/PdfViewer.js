import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs"; //에러해결 단비 문장..
import { useCallback, useEffect, useState, useRef } from "react";
import PdfPage from "./PdfPage";

export default function PdfViewer({ doc }) {
  const [pages, setPages] = useState([]);

  const [error, setError] = useState(false);
  //화질 담당
  const [scale, setScale] = useState(10);

  const onLoadSuccess = () => {
    console.log(`pdf 로딩 성공`);
    setError(false);
  };

  const onLoadFail = (e) => {
    console.log(`pdf 로딩 실패!: ${e}`);
    setError(true);
  };

  const renderPDF = useCallback(
    async (doc) => {
      try {
        console.log(doc);
        const totalPage = doc.numPages;

        if (totalPage === 0) {
          throw new Error(`전체 페이지가 0`);
        }

        const pageArr = Array.from(Array(totalPage + 1).keys()).slice(1);
        const allPages = pageArr.map((i) => (
          <PdfPage doc={doc} page={i} key={i} scale={scale} />
        ));

        setPages(allPages);

        onLoadSuccess();
      } catch (e) {
        onLoadFail(e);
      }
    },
    [scale]
  );

  useEffect(() => {
    renderPDF(doc);
  }, [doc]);
  const pdfRef = useRef();
  return (
    <div
      ref={pdfRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "scroll",
        border: "1.5px solid lightgray",
      }}
      id="canvas-scroll"
    >
      {pages}

      {error && (
        <div style={{ height: "100%", margin: "5px auto" }}>
          pdf 로딩에 실패했습니다.
        </div>
      )}
    </div>
  );
}
