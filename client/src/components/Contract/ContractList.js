import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/Button";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Dialog from "./Dialog";
import api from "../../constants/api";
import { dialogAnswers, dialogs, events } from "../../constants/constants";
import { convertDateToISOString } from "../../utils/utils";
import StyledTableCell from "./StyledTableCell";
import StyledTableRow from "./StyledTableRow";
import ListPagination from "./ListPagination";

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
    try {
      const res = await axios.post(api.CREATE_CONTRACT);
      const { data } = res;
      setContractList([data, ...contractList]);
    } catch (error) {
      console.log(error);
    }
    setDialogOpen(false);
  };

  const onTerminate = async () => {
    try {
      const list = [...contractList];
      const data = list.find(({ contractId }) => contractId === toTerminateId);
      const res = await axios.post(api.TERMINATE_CONTRACT, data);
      const { data: terminatedContract } = res;

      data.terminationDate = terminatedContract?.terminationDate;
      setContractList(list);
    } catch (error) {
      console.log(error);
    }
    setDialogOpen(false);
  };

  const getList = async () => {
    try {
      const { data: res } = await axios.get(
        `${api.GET_CONTRACTS}?page=${page}&limit=${pageLimit}`
      );
      const { data, totalPages } = res;
      setContractList(data);
      setTotalPages(totalPages);
    } catch (error) {
      console.log(error);
    }
  };

  const onPagination = (event, value) => {
    setPage(value);
  };

  const renderContracts = () => {
    if (contractList == null || contractList.length == 0) return [];
    return contractList.map(
      ({ contractId, startDate, terminationDate, premium }) => {
        return (
          <StyledTableRow key={contractId}>
            <StyledTableCell>{contractId}</StyledTableCell>
            <StyledTableCell>
              {convertDateToISOString(startDate)}
            </StyledTableCell>
            <StyledTableCell>{premium}</StyledTableCell>
            <StyledTableCell>
              {convertDateToISOString(terminationDate)}
            </StyledTableCell>
            <StyledTableCell>
              {!Date.parse(terminationDate) && (
                <Button
                  onClick={() =>
                    handleDialogOpen(contractId, events.termination)
                  }
                >
                  <DeleteForeverOutlinedIcon sx={styles.deleteIcon} />
                </Button>
              )}
            </StyledTableCell>
          </StyledTableRow>
        );
      }
    );
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
      <ListPagination totalPages={totalPages} onPagination={onPagination} />
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
