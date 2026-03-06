import React from 'react';
import { Box } from '@mui/material';
import DocumentDataCapture from './DocumentDataCapture';

const DocumentScanner: React.FC = () => {
  return (
    <Box sx={{ p: 3, maxWidth: 700, margin: 'auto' }}>
      <DocumentDataCapture />
    </Box>
  );
};

export default DocumentScanner;
