import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
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

  const gridContainerRef = useRef(); // ✅ 그리드 div
  const gridInstanceRef = useRef();  // ✅ 그리드 인스턴스 보관용
  const cndRef = useRef();
  const wrdRef = useRef();

  /** ✅ 데이터 조회 */
  const retrieveList = useCallback((srchCnd) => {
    const retrieveListURL = "/inventoryMap" + EgovNet.getQueryString(srchCnd);
    const requestOptions = { method: "GET", headers: { "Content-type": "application/json" } };

    EgovNet.requestFetch(
      retrieveListURL,
      requestOptions,
      (resp) => {
        setPaginationInfo(resp.result.paginationInfo);
        setGridData(resp.result.resultList || []);
      },
      (err) => console.error("err response : ", err)
    );
  }, []);

  /** ✅ 초기화 및 Grid 생성 */
  useEffect(() => {
    retrieveList(searchCondition);

    const grid = new Grid({
      el: gridContainerRef.current,
      bodyHeight: 400,
      scrollX: false,
      scrollY: true,
      rowHeaders: ["rowNum"],
      columns: [
        { header: "창고코드", name: "whCd", align: "center" },
        { header: "LOT번호", name: "lotNo", align: "center" },
        { header: "셀번호", name: "cellNo", align: "center" },
        { header: "재고수량", name: "invnQty", align: "right" },
        { header: "가용수량", name: "avlbQty", align: "right" },
        { header: "할당수량", name: "allocQty", align: "right" },
        { header: "보류수량", name: "hldQty", align: "right" },
      ],
      pageOptions: {
        useClient: true,
        perPage: 10,
      },
    });

    grid.on("click", (ev) => {
      const rowData = grid.getRow(ev.rowKey);
      if (!rowData) return;
      window.location.href = `${URL.WMS_INVENTORY_MODIFY}?whCd=${rowData.whCd}&lotNo=${rowData.lotNo}&cellNo=${rowData.cellNo}`;
    });

    gridInstanceRef.current = grid; // ✅ ref 에 저장

    return () => grid.destroy();
  }, [retrieveList]);

  /** ✅ 서버 데이터 변경 시 grid 데이터 갱신 */
  useEffect(() => {
    if (gridInstanceRef.current && gridData.length > 0) {
      gridInstanceRef.current.resetData(gridData);
    }
  }, [gridData]);

  return (
    <div className="container">
      <div className="c_wrap">
        <div className="layout">
          <EgovLeftNav />
          <div className="contents">
            <h2 className="tit_2">재고조회 (Toast Grid)</h2>

            <div className="condition">
              <ul>
                <li>
                  <select ref={cndRef} defaultValue={searchCondition.searchCnd}>
                    <option value="0">창고코드</option>
                    <option value="1">LOT번호</option>
                    <option value="2">셀번호</option>
                  </select>
                  <input type="text" ref={wrdRef} placeholder="검색어 입력" />
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
              </ul>
            </div>

            {/* ✅ 토스트 그리드 출력 */}
            <div ref={gridContainerRef} className="mt-4"></div>

            {/* ✅ 페이징 */}
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
