import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import * as EgovNet from "@/api/egovFetch";
import URL from "@/constants/url";
import CODE from "@/constants/code";

import { default as EgovLeftNav } from "@/components/leftmenu/EgovLeftNavWms";
import EgovRadioButtonGroup from "@/components/EgovRadioButtonGroup";

function InventoryEdit(props) {
  console.group("InventoryEdit");
  console.log("[Start] InventoryEdit ------------------------------");
  console.log("InventoryEdit [props] : ", props);

  const navigate = useNavigate();
  const location = useLocation();
  const checkRef = useRef([]);

  console.log("InventoryEdit [location] : ", location);
  
  const whCd = location.state?.whCd || "";
  const lotNo = location.state?.lotNo || "";
  const cellNo = location.state?.cellNo || "";

  const mberSttusRadioGroup = [
    { value: "P", label: "가능" },
    { value: "A", label: "대기" },
    { value: "D", label: "탈퇴" },
  ];
  //const groupCodeOptions = [{ value: "GROUP_00000000000000", label: "ROLE_ADMIN" }, { value: "GROUP_00000000000001", label: "ROLE_USER" }];
  //백엔드에서 보내온 값으로 변경(위 1줄 대신 아래 1줄 추가)
  let [groupCodeOptions, setGroupCodeOptions] = useState([]);
  const [modeInfo, setModeInfo] = useState({ mode: props.mode });
  const [inventoryDetail, setInventoryDetail] = useState({});

  const initMode = () => {
    switch (props.mode) {
      case CODE.MODE_CREATE:
        setModeInfo({
          ...modeInfo,
          modeTitle: "등록",
          editURL: "/inventory/insert",
        });
        break;

      case CODE.MODE_MODIFY:
        setModeInfo({
          ...modeInfo,
          modeTitle: "수정",
          editURL: `/inventory/update`,
        });
        break;
      default:
        navigate({ pathname: URL.ERROR }, { state: { msg: "" } });
    }
    retrieveDetail();
  };

  const retrieveDetail = () => {
    let retrieveDetailURL = "";
    if (modeInfo.mode === CODE.MODE_CREATE) {
      // 조회/등록이면 초기값 지정
      setInventoryDetail({
        tmplatId: "TMPLAT_MEMBER_DEFAULT", //Template 고정
        groupId: "GROUP_00000000000001", //그룹ID 초기값
        mberSttus: "P", //로그인가능여부 초기값
        checkIdResult: "중복ID를 체크해 주세요.",
      });
      retrieveDetailURL = `/inventory/insert`;
    }
    if (modeInfo.mode === CODE.MODE_MODIFY) {
      // 수정이면 초기값 지정 안함
      retrieveDetailURL = `/inventory/update/${whCd}/${lotNo}/${cellNo}`;
    }
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    };
    EgovNet.requestFetch(retrieveDetailURL, requestOptions, function (resp) {
      // 수정모드일 경우 조회값 세팅
      if (modeInfo.mode === CODE.MODE_MODIFY) {
        setInventoryDetail(resp.result.inventoryVO);
      }
      groupCodeOptions = []; //중복 option 값 제거
      //백엔드에서 받은 권한 그룹 options 값 바인딩(아래)
      resp.result.groupId_result.forEach((item) => {
        groupCodeOptions.push({ value: item.code, label: item.codeNm });
      });
      setGroupCodeOptions(groupCodeOptions); //html 렌더링
    });
  };

  const checkIdDplct = () => {
    return new Promise((resolve) => {
      let checkId = inventoryDetail["whCd"] + ',' + inventoryDetail["lotNo"] + ',' + inventoryDetail["cellNo"];

      let whCd = inventoryDetail["whCd"];
      if (whCd === null || whCd === undefined) {
        alert("창고코드를 입력해 주세요");
        return false;
      }

      let lotNo = inventoryDetail["lotNo"];
      if (lotNo === null || lotNo === undefined) {
        alert("로트번호를 입력해 주세요");
        return false;
      }

      let cellNo = inventoryDetail["cellNo"];
      if (cellNo === null || cellNo === undefined) {
        alert("셀번호를 입력해 주세요");
        return false;
      }

      const checkIdURL = `/etc/inventory_checkid/${whCd}/${lotNo}/${cellNo}`;
      const reqOptions = {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      };
      EgovNet.requestFetch(checkIdURL, reqOptions, function (resp) {
        if (
          Number(resp.resultCode) === Number(CODE.RCV_SUCCESS) &&
          resp.result.usedCnt > 0
        ) {
          setInventoryDetail({
            ...inventoryDetail,
            checkIdResult: "이미 사용중인 아이디입니다. [ID체크]",
            checkId: checkId,
          });
          resolve(resp.result.usedCnt);
        } else {
          setInventoryDetail({
            ...inventoryDetail,
            checkIdResult: "사용 가능한 아이디입니다.",
            checkId: checkId,
          });
          resolve(0);
        }
      });
    });
  };

  const formValidator = (formData) => {
    return new Promise((resolve) => {
      if (formData.get("whCd") === null || formData.get("whCd") === "") {
        alert("창고코드는 필수 값입니다.");
        return false;
      }
      checkIdDplct().then((res) => {
        if (res > 0) {
          return false;
        }
        // if (
        //   formData.get("password") === null ||
        //   formData.get("password") === ""
        // ) {
        //   alert("암호는 필수 값입니다.");
        //   return false;
        // }
        // if (formData.get("mberNm") === null || formData.get("mberNm") === "") {
        //   alert("회원명은 필수 값입니다.");
        //   return false;
        // }
        // if (
        //   formData.get("groupId") === null ||
        //   formData.get("groupId") === ""
        // ) {
        //   alert("권한 그룹은 필수 값입니다.");
        //   return false;
        // }
        // if (
        //   formData.get("mberSttus") === null ||
        //   formData.get("mberSttus") === ""
        // ) {
        //   alert("회원상태값은 필수 값입니다.");
        //   return false;
        // }
        resolve(true);
      });
    });
  };

  const formObjValidator = (checkRef) => {
    if (checkRef.current[0].value === "") {
      alert("창고코드는 필수 값입니다.");
      return false;
    }
    
    if (checkRef.current[1].value === "") {
      alert("LOT번호는 필수 값입니다.");
      return false;
    }

    if (checkRef.current[2].value === "") {
      alert("셀번호는 필수 값입니다.");
      return false;
    }

    if (checkRef.current[3].value === "") {
      inventoryDetail.invnQty = "0";   //수정 시 재고수량을 입력하지 않으면 공백으로처리
    }

    if (checkRef.current[4].value === "") {
      inventoryDetail.avlbQty = "0";   //수정 시 가용수량을 입력하지 않으면 공백으로처리
    }

    if (checkRef.current[5].value === "") {
      inventoryDetail.allocQty = "0";  //수정 시 할당수량을 입력하지 않으면 공백으로처리
    }

    if (checkRef.current[6].value === "") {
      inventoryDetail.hldQty = "0";    //수정 시 보류수량을 입력하지 않으면 공백으로처리
    }

    return true;
  };

  const updateInventory = () => {
    let modeStr = modeInfo.mode === CODE.MODE_CREATE ? "POST" : "PUT";

    let requestOptions = {};

    if (modeStr === "POST") {
      const formData = new FormData();

      for (let key in inventoryDetail) {
        formData.append(key, inventoryDetail[key]);
        //console.log("boardDetail [%s] ", key, boardDetail[key]);
      }

      formValidator(formData).then((res) => {
        if (res) {
          requestOptions = {
            method: modeStr,
            headers: {},
            body: formData,
          };

          EgovNet.requestFetch(modeInfo.editURL, requestOptions, (resp) => {
            if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
              alert("재고 정보가 등록되었습니다.");
              navigate({ pathname: URL.WMS_INVENTORY });
            } else {
              navigate(
                { pathname: URL.ERROR },
                { state: { msg: resp.resultMessage } }
              );
            }
          });
        }
      });
    } else {
      if (formObjValidator(checkRef)) {
        requestOptions = {
          method: modeStr,
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ ...inventoryDetail }),
        };

        EgovNet.requestFetch(modeInfo.editURL, requestOptions, (resp) => {
          if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
            navigate({ pathname: URL.WMS_INVENTORY });
          } else {
            navigate(
              { pathname: URL.ERROR },
              { state: { msg: resp.resultMessage } }
            );
          }
        });
      }
    }
  };

  const updateInventoryMap = () => {
    let modeStr = modeInfo.mode === CODE.MODE_CREATE ? "POST" : "PUT";

    let requestOptions = {};

    if (modeStr === "POST") {
      const formData = new FormData();

      for (let key in inventoryDetail) {
        formData.append(key, inventoryDetail[key]);
        //console.log("boardDetail [%s] ", key, boardDetail[key]);
      }

      // ✅ FormData → JSON 변환
      const jsonObj = {};
      formData.forEach((value, key) => {
        jsonObj[key] = value;
      });

      modeInfo.editURL = "/inventoryMap/insert";  /* (맵) */

      formValidator(formData).then((res) => {
        if (res) {
          requestOptions = {
            method: modeStr,
            headers: {
              "Content-Type": "application/json", // ✅ JSON 명시
            },
            body: JSON.stringify(jsonObj), // ✅ JSON으로 보냄
          };

          EgovNet.requestFetch(modeInfo.editURL, requestOptions, (resp) => {
            if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
              alert("재고 정보가 등록되었습니다.");
              navigate({ pathname: URL.WMS_INVENTORY });
            } else {
              navigate(
                { pathname: URL.ERROR },
                { state: { msg: resp.resultMessage } }
              );
            }
          });
        }
      });
    } else {

      modeInfo.editURL = "/inventoryMap/update";  /* (맵) */

      if (formObjValidator(checkRef)) {
        requestOptions = {
          method: modeStr,
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ ...inventoryDetail }),
        };

        EgovNet.requestFetch(modeInfo.editURL, requestOptions, (resp) => {
          if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
            navigate({ pathname: URL.WMS_INVENTORY });
          } else {
            navigate(
              { pathname: URL.ERROR },
              { state: { msg: resp.resultMessage } }
            );
          }
        });
      }
    }
  };

  const deleteInventory = (whCd, lotNo, cellNo) => {
    const deleteInventoryURL = `/inventory/delete/${whCd}/${lotNo}/${cellNo}`;

    const requestOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
      },
    };

    EgovNet.requestFetch(deleteInventoryURL, requestOptions, (resp) => {
      console.log("====>>> inventory delete= ", resp);
      if (Number(resp.resultCode) === Number(CODE.RCV_SUCCESS)) {
        alert("재고가 삭제되었습니다.");
        navigate(URL.WMS_INVENTORY, { replace: true });
      } else {
        alert("ERR : " + resp.resultMessage);
      }
    });
  };

  useEffect(() => {
    initMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log("------------------------------InventoryEdit [End]");
  console.groupEnd("InventoryEdit");

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
              <Link to={URL.ADMIN}>사이트관리</Link>
            </li>
            <li>회원 관리</li>
          </ul>
        </div>
        {/* <!--// Location --> */}

        <div className="layout">
          {/* <!-- Navigation --> */}
          <EgovLeftNav></EgovLeftNav>
          {/* <!--// Navigation --> */}

          <div className="contents BOARD_CREATE_REG" id="contents">
            {/* <!-- 본문 --> */}

            <div className="top_tit">
              <h1 className="tit_1">WMS</h1>
            </div>

            {modeInfo.mode === CODE.MODE_CREATE && (
              <h2 className="tit_2">재고 생성</h2>
            )}

            {modeInfo.mode === CODE.MODE_MODIFY && (
              <h2 className="tit_2">재고 수정</h2>
            )}

            <div className="board_view2">
              <dl>
                <dt>
                  <label htmlFor="whCd">창고코드</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="mberId"
                        title=""
                        id="mberId"
                        placeholder=""
                        defaultValue={inventoryDetail.whCd}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            whCd: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[0] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="whCd"
                      title=""
                      id="whCd"
                      placeholder=""
                      defaultValue={inventoryDetail.whCd}
                      ref={(el) => (checkRef.current[0] = el)}
                      readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              <dl>
                <dt>
                  <label htmlFor="lotNo">LOT번호</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="lotNo"
                        title=""
                        id="lotNo"
                        placeholder=""
                        defaultValue={inventoryDetail.lotNo}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            lotNo: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[1] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="lotNo"
                      title=""
                      id="lotNo"
                      placeholder=""
                      defaultValue={inventoryDetail.lotNo}
                      ref={(el) => (checkRef.current[1] = el)}
                      readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              <dl>
                <dt>
                  <label htmlFor="cellNo">셀번호</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="cellNo"
                        title=""
                        id="cellNo"
                        placeholder=""
                        defaultValue={inventoryDetail.cellNo}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            cellNo: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[2] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="cellNo"
                      title=""
                      id="cellNo"
                      placeholder=""
                      defaultValue={inventoryDetail.cellNo}
                      ref={(el) => (checkRef.current[2] = el)}
                      readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              {/* 수량 */}
              <dl>
                <dt>
                  <label htmlFor="invnQty">재고수량</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="invnQty"
                        title=""
                        id="invnQty"
                        placeholder=""
                        defaultValue={inventoryDetail.invnQty}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            invnQty: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[3] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="invnQty"
                      title=""
                      id="invnQty"
                      placeholder=""
                      defaultValue={inventoryDetail.invnQty}
                      onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            invnQty: e.target.value,
                          })
                        }
                      ref={(el) => (checkRef.current[3] = el)}
                      // readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              <dl>
                <dt>
                  <label htmlFor="avlbQty">가용수량</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="avlbQty"
                        title=""
                        id="avlbQty"
                        placeholder=""
                        defaultValue={inventoryDetail.avlbQty}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            avlbQty: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[4] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="avlbQty"
                      title=""
                      id="avlbQty"
                      placeholder=""
                      defaultValue={inventoryDetail.avlbQty}
                      onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            avlbQty: e.target.value,
                          })
                        }
                      ref={(el) => (checkRef.current[4] = el)}
                      // readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              <dl>
                <dt>
                  <label htmlFor="allocQty">할당수량</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="allocQty"
                        title=""
                        id="allocQty"
                        placeholder=""
                        defaultValue={inventoryDetail.allocQty}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            allocQty: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[5] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="allocQty"
                      title=""
                      id="allocQty"
                      placeholder=""
                      defaultValue={inventoryDetail.allocQty}
                      onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            allocQty: e.target.value,
                          })
                        }
                      ref={(el) => (checkRef.current[5] = el)}
                      // readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              <dl>
                <dt>
                  <label htmlFor="hldQty">보류수량</label>
                  <span className="req">필수</span>
                </dt>
                <dd>
                  {/* 등록 일때 변경 가능 */}
                  {modeInfo.mode === CODE.MODE_CREATE && (
                    <>
                      <input
                        className="f_input2 w_full"
                        type="text"
                        name="hldQty"
                        title=""
                        id="hldQty"
                        placeholder=""
                        defaultValue={inventoryDetail.hldQty}
                        onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            hldQty: e.target.value,
                          })
                        }
                        ref={(el) => (checkRef.current[6] = el)}
                        required
                      />
                    </>
                  )}
                  {/* 수정/조회 일때 변경 불가 */}
                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <input
                      className="f_input2 w_full"
                      type="text"
                      name="hldQty"
                      title=""
                      id="hldQty"
                      placeholder=""
                      defaultValue={inventoryDetail.hldQty}
                      onChange={(e) =>
                          setInventoryDetail({
                            ...inventoryDetail,
                            hldQty: e.target.value,
                          })
                        }
                      ref={(el) => (checkRef.current[6] = el)}
                      // readOnly
                      required
                    />
                  )}
                </dd>
              </dl>

              {/* <!-- 버튼영역 --> */}
              <div className="board_btn_area">
                <div className="left_col btn1">
                  <button
                    className="btn btn_skyblue_h46 w_100"
                    onClick={() => updateInventory()}
                  >
                    저장
                  </button>

                  <button
                    className="btn btn_skyblue_h46 w_100"
                    onClick={() => updateInventoryMap()}
                  >
                    저장 (맵)
                  </button>

                  {modeInfo.mode === CODE.MODE_MODIFY && (
                    <button
                      className="btn btn_skyblue_h46 w_100"
                      onClick={() => {
                        deleteInventory(inventoryDetail.whCd, inventoryDetail.lotNo, inventoryDetail.cellNo);
                      }}
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="right_col btn1">
                  <Link
                    to={URL.ADMIN_MEMBERS}
                    className="btn btn_blue_h46 w_100"
                  >
                    목록
                  </Link>
                </div>
              </div>
              {/* <!--// 버튼영역 --> */}
            </div>

            {/* <!--// 본문 --> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryEdit;
