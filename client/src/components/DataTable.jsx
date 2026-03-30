import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  Box,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";

function compareValues(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { sensitivity: "base" });
}

export default function DataTable({
  columns,
  rows = [],
  loading,
  emptyTitle,
  emptyDescription,
  searchPlaceholder = "Search",
  searchable = true,
  searchableKeys,
  initialSortBy,
  initialSortDirection = "asc",
  initialRowsPerPage = 5,
  renderRow,
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState(initialSortBy || columns.find((column) => column.sortable !== false)?.id || columns[0]?.id);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const filteredRows = useMemo(() => {
    if (!query.trim()) {
      return rows;
    }

    const lowered = query.trim().toLowerCase();
    const activeKeys = searchableKeys || columns.filter((column) => column.searchable !== false).map((column) => column.id);

    return rows.filter((row) =>
      activeKeys.some((key) => {
        const column = columns.find((item) => item.id === key);
        const value = column?.getSearchValue
          ? column.getSearchValue(row)
          : column?.getValue
            ? column.getValue(row)
            : row[key];
        return String(value ?? "").toLowerCase().includes(lowered);
      })
    );
  }, [columns, query, rows, searchableKeys]);

  const sortedRows = useMemo(() => {
    if (!sortBy) {
      return filteredRows;
    }

    const column = columns.find((item) => item.id === sortBy);
    const nextRows = [...filteredRows].sort((left, right) => {
      const leftValue = column?.getSortValue ? column.getSortValue(left) : column?.getValue ? column.getValue(left) : left[sortBy];
      const rightValue = column?.getSortValue ? column.getSortValue(right) : column?.getValue ? column.getValue(right) : right[sortBy];
      return compareValues(leftValue, rightValue);
    });

    return sortDirection === "asc" ? nextRows : nextRows.reverse();
  }, [columns, filteredRows, sortBy, sortDirection]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [page, rowsPerPage, sortedRows]);

  const handleSort = (columnId) => {
    if (sortBy === columnId) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(columnId);
    setSortDirection("asc");
  };

  if (loading) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Box>
      {searchable ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: "100%", sm: 280 } }}
          />
        </Box>
      ) : null}

      <TableContainer component={Paper} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)" }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align || "left"} sx={{ whiteSpace: "nowrap" }}>
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : "asc"}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row) =>
              renderRow ? (
                renderRow(row)
              ) : (
                <TableRow key={row.id || row.key || JSON.stringify(row)} hover>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || "left"} sx={{ verticalAlign: "top" }}>
                      {column.renderCell ? column.renderCell(row) : column.getValue ? column.getValue(row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        onPageChange={(_event, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />
      <Typography variant="caption" color="text.secondary">
        Showing {paginatedRows.length} of {sortedRows.length} records
      </Typography>
    </Box>
  );
}
