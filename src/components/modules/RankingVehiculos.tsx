import { List, ListItem, ListItemText, Paper, Typography, Badge } from '@mui/material';
import type { DiasCantidad } from '../../models/DiasCantidad';

export const RankingVehiculos = ({ datos }: { datos: DiasCantidad[] }) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Vehículos Involucrados
      </Typography>
      <List>
        {datos?.map((item) => (
          <ListItem 
            key={item.dia}
            divider
            secondaryAction={
              <Badge badgeContent={item.cantidad} color="primary" showZero />
            }
          >
            <ListItemText 
              primary={item.cantidad} 
              secondary="Total de protagonistas"
            />
            <ListItemText 
              primary={item.dia} 
              secondary="Total de protagonistas"
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};