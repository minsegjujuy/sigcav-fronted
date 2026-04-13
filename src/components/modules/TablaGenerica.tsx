import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export type TablaColumna<T> = {
  header: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  titulo?: string;
  rows: T[];
  columns: TablaColumna<T>[];
  emptyText?: string;
};

const TablaGenericaInner = <T,>({ titulo, rows, columns, emptyText = "Sin datos" }: Props<T>) => {
  const hasRows = rows.length > 0;

  return (
    <Box>
      {titulo && (
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.2 }}>
          {titulo}
        </Typography>
      )}

      {!hasRows ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography color="text.secondary">{emptyText}</Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            borderRadius: 2,
            overflowX: "auto",
            borderColor: "divider",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          }}
        >
          <Table size="small" stickyHeader aria-label={titulo ?? "tabla"} sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-head": {
                    backgroundColor: "grey.100",
                    color: "text.secondary",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    fontSize: 12,
                    py: 1.25,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                {columns.map((col, idx) => (
                  <TableCell key={`${col.header}-${idx}`} align={col.align ?? "left"} sx={{ width: col.width }}>
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                "& .MuiTableCell-body": {
                  py: 1,
                  fontVariantNumeric: "tabular-nums",
                },
              }}
            >
              {rows.map((row, rIdx) => (
                <TableRow
                  key={rIdx}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} align={col.align ?? "left"} sx={{ verticalAlign: "top" }}>
                      {col.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export const TablaGenerica = React.memo(TablaGenericaInner) as typeof TablaGenericaInner;
