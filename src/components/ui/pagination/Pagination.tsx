import { IconButton, Typography } from "@mui/material";
import { PageInput, PaginationContainer } from "./Pagination.styles";
import { useState } from "react";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import type { PaginationProps } from "./Pagination.types";

const PaginationCustom: React.FC<PaginationProps> = ({ 
  page,
  totalPages,
  onChange,
  zeroBased = true
}) => {

  const [inputValue, setInputValue] = useState(
    zeroBased ? page + 1 : page
  );

  const handlePrev = () => {
    if (page > (zeroBased ? 0 : 1)) {
      onChange(zeroBased ? page - 1 : page - 1);
    }
  };

  const handleNext = () => {
    if (page < (zeroBased ? totalPages - 1 : totalPages)) {
      onChange(zeroBased ? page + 1 : page + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value));
  };

  const handleInputBlur = () => {
    let num = Number(inputValue);

    if (isNaN(num)) return;

    // normalizar valores fuera de rango
    if (zeroBased) {
      if (num < 1) num = 1;
      if (num > totalPages) num = totalPages;
      onChange(num - 1);
    } else {
      if (num < 1) num = 1;
      if (num > totalPages) num = totalPages;
      onChange(num);
    }
  };

  return (
    <PaginationContainer>

      {/* botón anterior */}
      <IconButton onClick={handlePrev} disabled={page === (zeroBased ? 0 : 1)}>
        <ArrowBack />
      </IconButton>

      {/* input para ir a página */}
      <PageInput
        type="number"
        variant="outlined"
        size="small"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
      />

      <Typography variant="body1">
        de {totalPages}
      </Typography>

      {/* botón siguiente */}
      <IconButton 
        onClick={handleNext} 
        disabled={page === (zeroBased ? totalPages - 1 : totalPages)}
      >
        <ArrowForward />
      </IconButton>

    </PaginationContainer>
  );
};

export default PaginationCustom;