import React, { useRef, useEffect } from 'react';
import TuiGrid from '@toast-ui/react-grid';
import 'tui-grid/dist/tui-grid.css';

const ToastGrid = ({ columns, data }) => {
  const gridRef = useRef();

  useEffect(() => {
    const gridInstance = gridRef.current.getInstance();
    gridInstance.refreshLayout();
  }, [data]);

  return (
    <TuiGrid
      ref={gridRef}
      data={data}
      columns={columns}
      rowHeight={40}
      bodyHeight={400}
      scrollX={false}
      scrollY={true}
      columnOptions={{ resizable: true }}
    />
  );
};

export default ToastGrid;
