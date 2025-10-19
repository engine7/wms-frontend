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
        const list = Array.isArray(resp.result.resultList)
          ? resp.result.resultList.map((row, idx) => ({ ...row, _rowNo: idx + 1, _delete: false }))
          : [];
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
        { header: "No", name: "_rowNo", align: "center" },
        { header: "창고코드", name: "whCd", align: "center", editor: "text" },
        { header: "LOT번호", name: "lotNo", align: "center", editor: "text" },
        { header: "셀번호", name: "cellNo", align: "center", editor: "text" },
        { header: "재고수량", name: "invnQty", align: "right", editor: "text" },
        { header: "가용수량", name: "avlbQty", align: "right", editor: "text" },
        { header: "할당수량", name: "allocQty", align: "right", editor: "text" },
        { header: "보류수량", name: "hldQty", align: "right", editor: "text" },
        {
          header: "삭제",
          name: "_delete",
          align: "center",
          editor: {
            type: "checkbox",
          },
          formatter: ({ value }) => `<input type="checkbox" ${value ? "checked" : ""} />`,
        },
      ],
      pageOptions: { useClient: true, perPage: 10 },
      editable: true,
    });

    // 클릭 시 편집 또는 체크박스 처리
    grid.on("click", (ev) => {
      const colName = ev.columnName;
      const rowKey = ev.rowKey;
      if (colName === "_delete") {
        const rowData = grid.getRow(rowKey);
        rowData._delete = !rowData._delete;
        grid.setValue(rowKey, "_delete", rowData._delete);
        // 삭제 체크 시 disable 처리
        ["whCd","lotNo","cellNo","invnQty","avlbQty","allocQty","hldQty"].forEach((col) => {
          grid.setEditable(rowKey, col, !rowData._delete);
        });
      } else {
        grid.startEditing(rowKey, colName);
      }
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
      const newRow = {
        whCd: "",
        lotNo: "",
        cellNo: "",
        invnQty: 0,
        avlbQty: 0,
        allocQty: 0,
        hldQty: 0,
        _rowNo: gridInstanceRef.current.getRowCount() + 1,
        _delete: false,
      };
      const rowKey = gridInstanceRef.current.appendRow(newRow);
      // 새로 추가한 행은 바로 편집
      gridInstanceRef.current.startEditing(rowKey, "whCd");
    }
  };

  /** 저장 버튼 클릭 */
  const handleSaveRows = () => {
    if (!gridInstanceRef.current) return;

    const modifiedRows = gridInstanceRef.current.getModifiedRows();
    let rowsToSave = [];

    // 추가된 행
    modifiedRows.createdRows.forEach((r) => (rowsToSave.push({ ...r, status: "I" })));
    // 수정된 행
    modifiedRows.updatedRows.forEach((r) => (rowsToSave.push({ ...r, status: "U" })));
    // 삭제 체크된 행
    gridInstanceRef.current.getData().forEach((r) => {
      if (r._delete) rowsToSave.push({ ...r, status: "D" });
    });

    if (rowsToSave.length === 0) {
      alert("추가/수정/삭제된 행이 없습니다.");
      return;
    }

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
        retrieveList(searchCondition);
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

            <div ref={gridContainerRef} className="mt-4"></div>

            <EgovPaging
              pagination={paginationInfo}
              moveToPage={(passedPage) =>
                retrieveList({
                  ...searchCondition,
                  pageIndex: passedPage,
                  searchCnd: cndRef.current.value,
                  searchWrd: wrdRef.current.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryListToastGrid;
