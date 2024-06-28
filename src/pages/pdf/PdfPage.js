import React, { useCallback, useEffect, useRef } from "react";

const PdfPage = ({ page, doc, scale = 10 }) => {
  const canvasRef = useRef();

  //canvas에 그릴 context 생성
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

  // canvas 렌더링
  const renderPage = useCallback(async () => {
    try {
      //현재 페이지 정보 받기
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
