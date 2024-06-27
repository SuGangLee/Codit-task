import { cleanup } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { CoditColor, RowContainer } from "../../components/background";

export default function PdfParser({ doc }) {
  const [props, setProps] = useState({
    pageLoc: 1,
    startX: 0,
    middleX: 2,
    endX: 0,
    locY: 0,
    isExist: false,
  });
  const [dataList, setDataList] = useState([]);

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
    const totalPage = doc.numPages;

    for (let page = 1; page < totalPage + 1; page++) {
      const rows = [];
      let find = false;
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

          row.texts.push({ x, str: text });
        }
      });

      rows.forEach((row) => {
        row.texts.sort((a, b) => a.x - b.x);
      });

      const tables = rows.map((row) =>
        row.texts.map((text) => text.str).join("")
      );

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

          if (
            props.pageLoc > 1 ||
            (props.pageLoc === 1 && row.y >= props.locY)
          ) {
            if (x <= props.middleX) {
              row.texts.push({ x, leftStr: text });
            } else if (x > props.middleX) {
              row.texts.push({ x, rightStr: text });
            }
          }
        }
      });

      rows.forEach((row) => {
        row.texts.sort((a, b) => a.x - b.x);
      });

      const leftTables = rows.map((row) =>
        row.texts.map((text) => text.leftStr).join("")
      );

      const rightTables = rows.map((row) =>
        row.texts.map((text) => text.rightStr).join("")
      );

      let list = [];

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
