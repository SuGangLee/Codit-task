# Codit-task

코딧 인턴 과제입니다.
## 사용법

## 과제 내용
**1.사용자는 PDF 파일을 업로드할 수 있어야 한다.**
**2.업로드된 PDF 파일을 웹 페이지에서 볼 수 있어야 한다.**
**3. 뷰잉된 PDF파일에서 신구조문을 배열 형태로 파생하는 결과를 도출할 수 있어야 한다.(이중 배열 형태의 결과물)
**

1) react.js, node.js, PDF.js를 이용하여 pdf 애플리케이션 구현
2) 첨부된 PDF 의안 파일(2100113_의사국 의안과_의안원문.pdf)을 업로드하여 웹페이지에서 뷰잉함
3) 뷰잉된 PDF의안 파일을 https://thecodit.com/kr-ko/bill/sh/20200603-000000002100113 와 같이 신구조문을 배열 형태로 파싱함 (왼쪽, 오른쪽을 구성하는 이중 배열 형태)

참고:  https://thecodit.com/kr-ko/bill/sh/20200603-000000002100113 

# 컴포넌트 설명

### 메인 페이지 

**App.js**
- 파일을 업로드한다. 
- 업로드 한 파일을 pdf.js의 doc객체로 만든다. 컴포넌트에 이 doc 객체를 전달한다. 
- 파일을 업로드 시, pdf를 볼 수 있는 'pdf 원문보기' 버튼과 '개정사항 요약' 버튼이 추가된다.


### pdf 원문보기 페이지

pages/pdf
**PdfViewer.js** (한번에 pdf를 보여주는 컴포넌트) 
- doc 객체로 pdf의 page 정보를 PdfPage.js에 넘긴다. 
- 한번에 여러 pdf 페이지를 뷰잉할 수 있도록 page 로직과 분리하였다. 

**PdfPage.js**
- 각 페이지 별로 getPage 로 현재 페이지 정보를 받아오고 viewport를 설정한다.
- canvas 태그로 현재 페이지를 렌더링한다.

  
### 개정사항 요약 페이지

**PdfParse.js** 
1. 개정사항은 "신·구조문대비표" 문자열 이후에 테이블 형식으로 쓰였다. 이것의 y위치로 테이블의 시작 부분을 구분했다. 
2. 모든 테이블이 고정 너비를 가짐을 확인할 수 있었다. 이것으로 열을 구분했다. middleX = ( 행 끝 x위치 - 행 시작 x위치 ) / 2  
3. 얻은 행렬 데이터를 table 구조로 출력한다. 
**findLoc 함수**
- 테이블 시작 위치를 찾아 props에 저장한다.
**parsingRow 함수**
- 테이블이 시작되는 page와 y이후의 문자에 대해서 행별로 왼쪽, 오른쪽 문자를 리스트에 담아 dataList에 저장한다.


## 사용방법
git clone "https://github.com/SuGangLee/Codit-task.git" 으로 Codit-task 디렉토리 생성
코드 에디터에서 디렉토리 오픈

### `npm install`
필요한 패키지 다운로드 
~~/codit-task $: npm install

### `npm start`
localhost:3000에서 실행됨
~~/codit-task $: npm start 

**Note: 고민사항**
tessrate.js를 사용하여 pdf->img-> 테이블 구조에 있는 문자를 Parsing하려 했다.
이 경우, 기호를 제대로 인식하지 못했고 빈문자열의 경우 배열에 담기지 않았다. (pdfjs는 공백도 담겼다) 
따라서 pdfjs만을 이용하기로 했다. 

