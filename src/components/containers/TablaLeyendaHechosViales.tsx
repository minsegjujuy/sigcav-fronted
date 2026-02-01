import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Box
} from '@mui/material';

const LeyendaMapa = () => {
  const items = [
    { etiqueta: 'Fallecidos', color: 'red', descripcion: 'Siniestros con víctimas fatales' },
    { etiqueta: 'Lesionados', color: 'orange', descripcion: 'Heridos leves o graves' },
    { etiqueta: 'Daños Materiales', color: 'yellow', descripcion: 'Sin víctimas ni heridos' },
  ];

  return (
    <TableContainer component={Paper} sx={{ maxWidth: 450, mt: 2, borderRadius: 2 }}>
      <Table size="small">
        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Color</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.etiqueta}>
              <TableCell>
                <Box 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    backgroundColor: item.color,
                    border: '1px solid #ccc' 
                  }} 
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 'medium' }}>{item.etiqueta}</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {item.descripcion}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeyendaMapa;