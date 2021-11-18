import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/Button";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Dialog from "./Dialog";
import dialogAnswers from "../../constants/dialogAnswers";
import api from "../../constants/api";

const events = {
  termination: "termination",
  creation: "creation",
};

const dialogs = {
  termination: {
    title: "Terminate contract",
    message: "Do you really want to terminate this contract?",
  },
  creation: {
    title: "Create contract",
    message: "Do you really want to create a contract?",
  },
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export default function ContractList() {
  const [contractList, setContractList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [toTerminateId, setToTerminateId] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const pageLimit = 25;

  useEffect(() => {
    getList();
  }, [page]);

  const handleDialogOpen = (contractId, eventType) => {
    setDialogOpen(true);
    if (eventType === events.termination) {
      setToTerminateId(contractId);
    }
    setCurrentEvent(eventType);
  };

  const handleDialogClose = (answer) => {
    setDialogOpen(false);
    if (answer === dialogAnswers.disagree) return;
    console.log({ currentEvent });
    if (currentEvent === events.termination) {
      onTerminate();
    } else if (currentEvent === events.creation) {
      onCreation();
    }
  };

  const onCreation = async () => {
    const res = await axios.post(api.CREATE_CONTRACT);
    const { data } = res;
    setContractList([data, ...contractList]);
  };

  const onTerminate = async () => {
    const list = [...contractList];
    const data = list.find(({ contractId }) => contractId === toTerminateId);
    const res = await axios.post(api.TERMINATE_CONTRACT, data);
    const { data: terminatedContract } = res;

    data.endDate = terminatedContract.endDate;
    setContractList(list);
    setDialogOpen(false);
  };

  const getList = async () => {
    const { data: res } = await axios.get(
      `${api.GET_CONTRACTS}?page=${page}&limit=${pageLimit}`
    );
    const { data, totalPages } = res;
    setContractList(data);
    setTotalPages(totalPages);
  };

  function convertUTCDateToLocalDate(date) {
    if (date === null) return null;
    return new Date(date).toISOString().replace(/T/, " ").replace(/\..+/, "");
  }

  const renderContracts = () => {
    if (contractList == null || contractList.length == 0) return [];
    return contractList.map(({ contractId, startDate, endDate, premium }) => {
      return (
        <StyledTableRow key={contractId}>
          <StyledTableCell>{contractId}</StyledTableCell>
          <StyledTableCell>
            {convertUTCDateToLocalDate(startDate)}
          </StyledTableCell>
          <StyledTableCell>{premium}</StyledTableCell>
          <StyledTableCell>
            {convertUTCDateToLocalDate(endDate)}
          </StyledTableCell>
          <StyledTableCell>
            {!Date.parse(endDate) && (
              <Button
                onClick={() => handleDialogOpen(contractId, events.termination)}
              >
                <DeleteForeverOutlinedIcon sx={styles.deleteIcon} />
              </Button>
            )}
          </StyledTableCell>
        </StyledTableRow>
      );
    });
  };

  const renderPagination = () => {
    return (
      <div style={{ display: "flex", margin: "1rem" }}>
        <Pagination
          count={totalPages}
          color="primary"
          onChange={(event, value) => onPagination(event, value)}
        />
      </div>
    );
  };

  const onPagination = (event, value) => {
    setPage(value);
  };

  const renderTable = () => {
    return (
      <React.Fragment>
        <IconButton
          variant="contained"
          sx={styles.createButton}
          autoCapitalize={false}
          onClick={() => handleDialogOpen(null, events.creation)}
        >
          <AddCircleOutlineIcon sx={styles.createIcon} />
          Create
        </IconButton>
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>Id</StyledTableCell>
              <StyledTableCell>Start Date</StyledTableCell>
              <StyledTableCell>Premium</StyledTableCell>
              <StyledTableCell>Termination Date</StyledTableCell>
              <StyledTableCell></StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>{renderContracts()}</TableBody>
        </Table>
        <Dialog
          open={isDialogOpen}
          onClose={(answer) => handleDialogClose(answer)}
          contractId={toTerminateId}
          content={
            currentEvent == events.termination
              ? dialogs.termination
              : dialogs.creation
          }
        />
      </React.Fragment>
    );
  };

  return (
    <div style={styles.mainContainer}>
      {renderTable()}
      {renderPagination()}
    </div>
  );
}

const styles = {
  mainContainer: {
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  createButton: {
    alignSelf: "flex-start",
    marginBottom: "1rem",
  },
  createIcon: {
    marginRight: "0.3rem",
  },
  deleteIcon: {
    color: "#DC143C",
  },
};
