import React from "react";
import Pagination from "@mui/material/Pagination";

export default function ListPagination({ totalPages, onPagination }) {
  return (
    <div style={{ display: "flex", margin: "1rem" }}>
      <Pagination
        count={totalPages}
        color="primary"
        onChange={(event, value) => onPagination(event, value)}
      />
    </div>
  );
}
