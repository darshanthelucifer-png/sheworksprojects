// ProductList.jsx
import React from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Button
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const ProductList = ({ products, onEditProduct }) => {
  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id || product.productId}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 3
            }
          }}>
            <CardMedia
              component="img"
              height="200"
              image={product.image || product.imageURL || '/placeholder-product.jpg'}
              alt={product.name}
              sx={{ objectFit: 'cover' }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h6" component="h3" fontWeight="bold" sx={{ flex: 1 }}>
                  {product.name}
                </Typography>
                <Chip 
                  label={`$${parseFloat(product.price).toFixed(2)}`} 
                  color="primary" 
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {product.description || 'No description available'}
              </Typography>
              
              <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                <Chip 
                  label={product.category || product.serviceId} 
                  variant="outlined" 
                  size="small"
                />
                <Box>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => onEditProduct(product.id)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductList;