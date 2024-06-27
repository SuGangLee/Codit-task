import styled from "styled-components";
const Container = styled.div`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1px;
`;

const RowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

const CoditColor = {
  coditBlue: "#04A7BF",
  coditLighterBlue: "#12A7BF",
  coditDarkBlue: "#0E8D9F",
  coditLightBlueOpacity: "rgba(4, 167, 191,0.2)",
};

export { Container, RowContainer, CoditColor };
