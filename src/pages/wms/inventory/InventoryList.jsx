import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";

import { default as EgovLeftNav } from "@/components/leftmenu/EgovLeftNavWms";
import EgovPaging from "@/components/EgovPaging";

import { itemIdxByPage } from "@/utils/calc";

function InventoryList(props) {
  console.group("InventoryList");
  console.log(
    "[Start] InventoryMemberList ------------------------------"
  );
  console.log("InventoryList [props] : ", props);

  const location = useLocation();
  console.log("InventoryList [location] : ", location);

  // eslint-disable-next-line no-unused-vars
  const [searchCondition, setSearchCondition] = useState(
    location.state?.searchCondition || {
      pageIndex: 1,
      searchCnd: "0",
      searchWrd: "",
    }
  ); // 기존 조회에서 접근 했을 시 || 신규로 접근 했을 시
  const [paginationInfo, setPaginationInfo] = useState({});

  const cndRef = useRef();
  const wrdRef = useRef();

  const [listTag, setListTag] = useState([]);

  const retrieveList = useCallback(
    (srchCnd) => {
      console.groupCollapsed("InventoryList.retrieveList()");

      const retrieveListURL = "/inventory" + EgovNet.getQueryString(srchCnd);

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };

      EgovNet.requestFetch(
        retrieveListURL,
        requestOptions,
        (resp) => {
          setPaginationInfo(resp.result.paginationInfo);

          let mutListTag = [];
          listTag.push(
            <p className="no_data" key="0">
              검색된 결과가 없습니다.
            </p>
          ); // 목록 초기값
          const resultCnt = parseInt(
            resp.result.paginationInfo.totalRecordCount
          );
          const currentPageNo = resp.result.paginationInfo.currentPageNo;
          const pageSize = resp.result.paginationInfo.pageSize;
          // 리스트 항목 구성
          resp.result.resultList.forEach(function (item, index) {
            let authNm = "";
            resp.result.groupId_result.forEach((data) => {
              if (data.code === item.groupId) authNm = data.codeNm;
            });
            if (index === 0) mutListTag = []; // 목록 초기화
            const listIdx = itemIdxByPage(
              resultCnt,
              currentPageNo,
              pageSize,
              index
            );
            mutListTag.push(
              <Link
                to={{ pathname: URL.WMS_INVENTORY_MODIFY }}
                state={{
                  whCd: item.whCd,
                  lotNo: item.lotNo,
                  cellNo: item.cellNo,
                  searchCondition: searchCondition,
                }}
                key={listIdx}
                className="list_item"
              >
                <div>{listIdx}</div>
                <div>{item.whCd}</div>
                <div>{item.lotNo}</div>
                <div>{item.cellNo}</div>
                <div>{item.invnQty}</div>
                <div>{item.avlbQty}</div>
                <div>{item.allocQty}</div>
                <div>{item.hldQty}</div>
              </Link>
            );
          });
          if (!mutListTag.length)
            mutListTag.push(
              <p className="no_data" key="0">
                검색된 결과가 없습니다.
              </p>
            ); // 회원 목록 초기값
          setListTag(mutListTag);
        },
        function (resp) {
          console.log("err response : ", resp);
        }
      );
      console.groupEnd("InventoryList.retrieveList()");
    },
    [listTag, searchCondition]
  );

  const retrieveMapList = useCallback(
    (srchCnd) => {
      console.groupCollapsed("InventoryMapList.retrieveMapList()");

      const retrieveMapListURL = "/inventoryMap" + EgovNet.getQueryString(srchCnd);

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };

      EgovNet.requestFetch(
        retrieveMapListURL,
        requestOptions,
        (resp) => {
          setPaginationInfo(resp.result.paginationInfo);

          let mutListTag = [];
          listTag.push(
            <p className="no_data" key="0">
              검색된 결과가 없습니다.
            </p>
          ); // 목록 초기값
          const resultCnt = parseInt(
            resp.result.paginationInfo.totalRecordCount
          );
          const currentPageNo = resp.result.paginationInfo.currentPageNo;
          const pageSize = resp.result.paginationInfo.pageSize;
          // 리스트 항목 구성
          resp.result.resultList.forEach(function (item, index) {
            let authNm = "";
            resp.result.groupId_result.forEach((data) => {
              if (data.code === item.groupId) authNm = data.codeNm;
            });
            if (index === 0) mutListTag = []; // 목록 초기화
            const listIdx = itemIdxByPage(
              resultCnt,
              currentPageNo,
              pageSize,
              index
            );
            mutListTag.push(
              <Link
                to={{ pathname: URL.WMS_INVENTORY_MODIFY }}
                state={{
                  uniqId: item.whCd,
                  uniqId: item.lotNo,
                  uniqId: item.cellNo,
                  searchCondition: searchCondition,
                }}
                key={listIdx}
                className="list_item"
              >
                <div>{listIdx}</div>
                <div>{item.whCd}</div>
                <div>{item.lotNo}</div>
                <div>{item.cellNo}</div>
                <div>{item.invnQty}</div>
                <div>{item.avlbQty}</div>
                <div>{item.allocQty}</div>
                <div>{item.hldQty}</div>
              </Link>
            );
          });
          if (!mutListTag.length)
            mutListTag.push(
              <p className="no_data" key="0">
                검색된 결과가 없습니다.
              </p>
            ); // 회원 목록 초기값
          setListTag(mutListTag);
        },
        function (resp) {
          console.log("err response : ", resp);
        }
      );
      console.groupEnd("InventoryMapList.retrieveMapList()");
    },
    [listTag, searchCondition]
  );

  useEffect(() => {
    retrieveList(searchCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("------------------------------InventoryList [End]");
  console.groupEnd("InventoryList");
  return (
    <div className="container">
      <div className="c_wrap">
        {/* <!-- Location --> */}
        <div className="location">
          <ul>
            <li>
              <Link to={URL.MAIN} className="home">
                Home
              </Link>
            </li>
            <li>
              <Link to={URL.WMS}>WMS</Link>
            </li>
            <li>재고조회</li>
          </ul>
        </div>
        {/* <!--// Location --> */}

        <div className="layout">
          {/* <!-- Navigation --> */}
          <EgovLeftNav></EgovLeftNav>
          {/* <!--// Navigation --> */}

          <div className="contents BOARD_CREATE_LIST" id="contents">
            {/* <!-- 본문 --> */}

            <div className="top_tit">
              <h1 className="tit_1">WMS</h1>
            </div>

            <h2 className="tit_2">재고조회</h2>

            {/* <!-- 검색조건 --> */}
            <div className="condition">
              <ul>
                <li className="third_1 L">
                  <span className="lb">검색유형선택</span>
                  <label className="f_select" htmlFor="searchCnd">
                    <select
                      id="searchCnd"
                      name="searchCnd"
                      title="검색유형선택"
                      ref={cndRef}
                      onChange={(e) => {
                        cndRef.current.value = e.target.value;
                      }}
                    >
                      <option value="0">창고코드</option>
                      <option value="1">LOT번호</option>
                      <option value="2">셀번호</option>
                    </select>
                  </label>
                </li>
                <li className="third_2 R">
                  <span className="lb">검색어</span>
                  <span className="f_search w_400">
                    <input
                      type="text"
                      name=""
                      defaultValue={
                        searchCondition && searchCondition.searchWrd
                      }
                      placeholder=""
                      ref={wrdRef}
                      onChange={(e) => {
                        wrdRef.current.value = e.target.value;
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        retrieveList({
                          ...searchCondition,
                          pageIndex: 1,
                          searchCnd: cndRef.current.value,
                          searchWrd: wrdRef.current.value,
                        });
                      }}
                    >
                      조회
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        retrieveMapList({
                          ...searchCondition,
                          pageIndex: 1,
                          searchCnd: cndRef.current.value,
                          searchWrd: wrdRef.current.value,
                        });
                      }}
                    >
                      조회 (맵)
                    </button>

                  </span>
                </li>
                <li>
                  <Link
                    to={URL.WMS_INVENTORY_CREATE}
                    className="btn btn_blue_h46 pd35"
                  >
                    등록
                  </Link>
                </li>
              </ul>
            </div>
            {/* <!--// 검색조건 --> */}

            {/* <!-- 회원목록 --> */}
            <div className="board_list BRD006">
              <div className="head">
                <span>번호</span>
                <span>창고코드</span>
                <span>LOT번호</span>
                <span>셀번호</span>
                <span>재고수량</span>
                <span>가용수량</span>
                <span>할당수량</span>
                <span>보류수량</span>
              </div>
              <div className="result">{listTag}</div>
            </div>
            {/* <!--// 회원목록 --> */}

            <div className="board_bot">
              {/* <!-- Paging --> */}
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
              {/* <!--/ Paging --> */}
            </div>

            {/* <!--// 본문 --> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryList;
