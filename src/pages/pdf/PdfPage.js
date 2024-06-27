import { PDFDocumentProxy } from "pdfjs-dist";
import * as pdfjsLib from "pdfjs-dist";
import React, { useCallback, useEffect, useRef, useState } from "react";

const PdfPage = ({ page, doc, scale = 10 }) => {
  const [propsInfo, setPropsInfo] = useState({
    // pageLoc: 5,
    // startX: 235.2, //0,
    // middleX: (235.2 + 359.04000000000013) / 2,
    // endX: 359.04000000000013, // 0,
    // locY: 746.88,
  });
  const [lists, setLists] = useState([]);
  const canvasRef = useRef();

  const drawCanvas = useCallback(
    ({ width, height }) => {
      if (!canvasRef.current) {
        throw new Error("canvasRef가 없음");
      }
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (context) {
        return context;
      } else {
        throw new Error("canvas context가 없음");
      }
    },
    [canvasRef]
  );

  const renderPage = useCallback(async () => {
    try {
      const currentPage = await doc.getPage(page);
      const viewport = currentPage.getViewport({ scale }); // each pdf has its own viewport,
      const context = drawCanvas({
        width: viewport.width,
        height: viewport.height,
      });

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await currentPage.render(renderContext).promise;

      // 파싱 시작

      //파싱끝
    } catch (e) {
      console.log(`${page}번째 페이지 로딩 실패`, e);
    }
  }, [doc, page, scale, drawCanvas]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return (
    <>
      <canvas ref={canvasRef} style={{ margin: "0px auto", width: "100%" }} />
    </>
  );
};

export default PdfPage;
