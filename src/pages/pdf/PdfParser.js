import { cleanup } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CoditColor, RowContainer } from "../../components/background";

export default function PdfParser({ doc }) {
  // 테이블 시작 위치 정보 담긴 props
  const [props, setProps] = useState({
    pageLoc: 1, //테이블이 있는 페이지 번호
    startX: 0, // 테이블 시작 행 위치
    middleX: 2, // 테이블 가운데 위치 (열 분리)
    endX: 0, //테이블 끝 행 위치
    locY: 0, // 페이지 내 테이블 시작 y위치
    isExist: false, //존재여부
  });
  const [dataList, setDataList] = useState([]); //좌우 데이터 저장할 배열

  useEffect(() => {
    const renderData = async () => {
      try {
        await findLoc();
      } catch (e) {
        console.log(`페이지 로딩 실패`, e);
      }
    };
    renderData();
  }, []);

  useEffect(() => {
    if (props.isExist) {
      const parsingData = async () => {
        try {
          await parsingRow();
        } catch (e) {
          console.log(`파싱 실패`, e);
        }
      };
      parsingData();
      cleanup(() => {
        setDataList([]);
      });
    }
  }, [props]);

  const findLoc = async () => {
    // 테이블 시작 위치를 찾아내는 함수
    const totalPage = doc.numPages;

    for (let page = 1; page < totalPage + 1; page++) {
      const rows = [];
      let find = false;
      const currentPage = await doc.getPage(page);
      const textContent = await currentPage.getTextContent();

      textContent.items.forEach((item) => {
        if ("str" in item && "transform" in item) {
          const text = item.str.trim(); //단어의 앞뒤 공백제거
          const x = item.transform[4];
          const y = item.transform[5];

          //행 존재 여부 판단
          let row = rows.find((r) => Math.abs(r.y - y) < 5);
          //없으면 행추가
          if (!row) {
            row = { y: y, texts: [] };
            rows.push(row);
          }
          //행에 추출된 x위치, text 삽입
          row.texts.push({ x, str: text });
        }
      });

      //x 위치로 문자 배열 정렬
      rows.forEach((row) => {
        row.texts.sort((a, b) => a.x - b.x);
      });

      // 문자 배열 -> 문자열 전환
      // [["개정1안"],["개정2안"] ... ] 2중 배열 형태
      const tables = rows.map((row) =>
        row.texts.map((text) => text.str).join("")
      );

      //모든 행의 문자열을 돌며 "신·구조문대비표" 위치 저장 후 함수 종료
      for (let index = 0; index < tables.length; index++) {
        const sentence = tables[index];
        if (sentence === "신·구조문대비표") {
          const nextTextItem = textContent.items[index + 1];
          if ("transform" in nextTextItem) {
            const startX = nextTextItem.transform[4];
            const endX = startX + nextTextItem.width;
            const locY = nextTextItem.transform[5];
            const updatedProps = {
              startX: startX,
              endX: endX,
              rowLoc: index + 1,
              middleX: (startX + endX) / 2,
              pageLoc: page,
              locY: locY,
              isExist: true,
            };
            setProps(updatedProps);
            find = true;
            break;
          }
        }
      }
      if (find) break;
    }
  };

  const parsingRow = async () => {
    // 테이블에서 좌우 데이터 추출하여 최종적으로 [[왼쪽데이터1, 오른쪽데이터2], ... ] 2중 배열로 저장하는 함수

    const totalPage = doc.numPages;
    for (let page = props.pageLoc; page < totalPage + 1; page++) {
      const rows = [];
      const currentPage = await doc.getPage(page);
      const textContent = await currentPage.getTextContent();

      textContent.items.forEach((item) => {
        if ("str" in item && "transform" in item) {
          const text = item.str.trim();
          const x = item.transform[4];
          const y = item.transform[5];

          let row = rows.find((r) => Math.abs(r.y - y) < 5);

          if (!row) {
            row = { y: y, texts: [] };
            rows.push(row);
          }

          // 테이블 위치 조건 체크
          if (
            props.pageLoc > 1 ||
            (props.pageLoc === 1 && row.y >= props.locY)
          ) {
            if (x <= props.middleX) {
              //왼쪽 데이터
              row.texts.push({ x, leftStr: text });
            } else if (x > props.middleX) {
              // 오른쪽 데이터
              row.texts.push({ x, rightStr: text });
            }
          }
        }
      });

      // 문자열 행 x위치 바탕으로 정렬
      rows.forEach((row) => {
        row.texts.sort((a, b) => a.x - b.x);
      });

      //왼쪽 테이블 데이터 생성 [[왼쪽 데이터1], [왼쪽 데이터2] ... ]
      const leftTables = rows.map((row) =>
        row.texts.map((text) => text.leftStr).join("")
      );

      //오른쪽 테이블 데이터 생성 이하동문
      const rightTables = rows.map((row) =>
        row.texts.map((text) => text.rightStr).join("")
      );

      let list = [];

      // [[왼쪽1,오른쪽1], ...] 구조로 테이블 생성
      for (let i = 1; i < leftTables.length; i++) {
        list.push([leftTables[i], rightTables[i]]);
      }

      setDataList((prevList) => [...prevList, ...list]);
    }
  };

  return (
    <Container>
      <RowContainer style={{ width: "70%" }}>
        <Title style={{ background: "gray" }}>현행</Title>
        <Title style={{ background: `${CoditColor.coditBlue}` }}>개정안</Title>
      </RowContainer>
      <Table>
        {dataList.map((element, idx) => {
          if (idx > 1) {
            return (
              <tr>
                <td style={{ width: "50%" }}>{element[0]}</td>
                <td style={{ width: "50%" }}>{element[1]}</td>
              </tr>
            );
          }
        })}
      </Table>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  height: 100%;
  overflow: scroll;
`;
const Table = styled.table`
  width: 70%;
  background: rgba(0, 0, 0, 0.03);

  padding: 15px 10px;
  border-radius: 10px;
  border: 1px solid #d7d7d7;
  margin: 10px 10px 0px 10px;
  border-collapse: separate;
  border-spacing: 0.25rem;
`;

const Title = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  border-radius: 10px 10px 0px 0;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.4);
  padding: 5px;
  width: 100%;
  text-align: center;
  margin: 0 5px;
  color: white;
`;
