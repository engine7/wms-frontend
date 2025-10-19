import React, { useState, useEffect, useCallback, useRef } from "react";
import Grid from "tui-grid";
import "tui-grid/dist/tui-grid.css";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import EgovLeftNav from "@/components/leftmenu/EgovLeftNavWms";
import EgovPaging from "@/components/EgovPaging";

function InventoryListToastGrid() {
  const [gridData, setGridData] = useState([]);
  const [paginationInfo, setPaginationInfo] = useState({});
  const [searchCondition, setSearchCondition] = useState({
    pageIndex: 1,
    searchCnd: "0",
    searchWrd: "",
  });

  const gridContainerRef = useRef();
  const gridInstanceRef = useRef();
  const cndRef = useRef();
  const wrdRef = useRef();

  /** 데이터 조회 */
  const retrieveList = useCallback((srchCnd) => {
    const retrieveListURL = "/inventoryMap" + EgovNet.getQueryString(srchCnd);
    const requestOptions = { method: "GET", headers: { "Content-type": "application/json" } };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        setPaginationInfo(resp.result.paginationInfo);
        const list = Array.isArray(resp.result.resultList) ? resp.result.resultList : [];
        setGridData(list);
      },
      (err) => console.error("err response : ", err)
    );
  }, []);

  /** 초기화 및 Grid 생성 */
  useEffect(() => {
    retrieveList(searchCondition);

    const grid = new Grid({
      el: gridContainerRef.current,
      bodyHeight: 400,
      scrollX: false,
      scrollY: true,
      rowHeaders: ["rowNum"],
      columns: [
        { header: "창고코드", name: "whCd", align: "center", editor: "text" },
        { header: "LOT번호", name: "lotNo", align: "center", editor: "text" },
        { header: "셀번호", name: "cellNo", align: "center", editor: "text" },
        { header: "재고수량", name: "invnQty", align: "right", editor: "text" },
        { header: "가용수량", name: "avlbQty", align: "right", editor: "text" },
        { header: "할당수량", name: "allocQty", align: "right", editor: "text" },
        { header: "보류수량", name: "hldQty", align: "right", editor: "text" },
      ],
      pageOptions: { useClient: true, perPage: 10 },
      // 추가 및 수정된 데이터만 처리할 수 있도록
      editable: true,
    });

    grid.on("click", (ev) => {
      const rowData = grid.getRow(ev.rowKey);
      // if (!rowData) return;
      // window.location.href = `${URL.WMS_INVENTORY_MODIFY}?whCd=${rowData.whCd}&lotNo=${rowData.lotNo}&cellNo=${rowData.cellNo}`;
    });

    gridInstanceRef.current = grid;

    return () => grid.destroy();
  }, [retrieveList]);

  /** gridData 변경 시 데이터 갱신 */
  useEffect(() => {
    if (gridInstanceRef.current) {
      gridInstanceRef.current.resetData(Array.isArray(gridData) ? gridData : []);
    }
  }, [gridData]);

  /** 추가 버튼 클릭 */
  const handleAddRow = () => {
    if (gridInstanceRef.current) {
      gridInstanceRef.current.appendRow({
        whCd: "",
        lotNo: "",
        cellNo: "",
        invnQty: 0,
        avlbQty: 0,
        allocQty: 0,
        hldQty: 0,
      });
    }
  };

  /** 저장 버튼 클릭 */
  const handleSaveRows = () => {
    if (!gridInstanceRef.current) return;

    // ✅ 추가/수정된 행만 가져오기
    const modifiedRows = gridInstanceRef.current.getModifiedRows();

    if (!modifiedRows.createdRows.length && !modifiedRows.updatedRows.length) {
      alert("추가/수정된 행이 없습니다.");
      return;
    }

    // 추가된 행 + 수정된 행 합치기
    const rowsToSave = [...modifiedRows.createdRows, ...modifiedRows.updatedRows];

    const requestOptions = {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(rowsToSave),
    };

    EgovNet.requestFetch(
      "/inventoryMap/toast/insert",
      requestOptions,
      (resp) => {
        alert("저장 완료!");
        retrieveList(searchCondition); // 저장 후 새로 조회
      },
      (err) => console.error("저장 에러: ", err)
    );
  };

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="layout">
          <EgovLeftNav />
          <div className="contents">
            <h2 className="tit_2">재고조회 (Toast Grid)</h2>

            {/* 검색/버튼 영역 */}
            <div className="condition">
              <ul style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <li>
                  <select ref={cndRef} defaultValue={searchCondition.searchCnd}>
                    <option value="0">창고코드</option>
                    <option value="1">LOT번호</option>
                    <option value="2">셀번호</option>
                  </select>
                </li>
                <li>
                  <input type="text" ref={wrdRef} placeholder="검색어 입력" />
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() =>
                      retrieveList({
                        ...searchCondition,
                        pageIndex: 1,
                        searchCnd: cndRef.current.value,
                        searchWrd: wrdRef.current.value,
                      })
                    }
                  >
                    조회
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleAddRow}>
                    추가
                  </button>
                </li>
                <li>
                  <button type="button" onClick={handleSaveRows}>
                    저장
                  </button>
                </li>
              </ul>
            </div>

            {/* 토스트 그리드 */}
            <div ref={gridContainerRef} className="mt-4"></div>

            {/* 페이징 */}
            <EgovPaging
              pagination={paginationInfo}
              moveToPage={(passedPage) => {
                retrieveList({
                  ...searchCondition,
                  pageIndex: passedPage,
                  searchCnd: cndRef.current.value,
                  searchWrd: wrdRef.current.value,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryListToastGrid;
