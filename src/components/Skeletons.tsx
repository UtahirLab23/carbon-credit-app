import React from 'react';
import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <Card sx={{ bgcolor: 'background.paper' }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Skeleton variant="text" width={160} height={32} />
        <Skeleton variant="rounded" width={240} height={36} />
      </Stack>
      {Array.from({ length: rows }).map((_, i) => (
        <Stack key={i} direction="row" spacing={2} sx={{ alignItems: 'center', py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Box sx={{ flex: 2 }}>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" height={14} />
          </Box>
          <Skeleton variant="text" width={60} sx={{ flex: 1 }} />
          <Skeleton variant="rounded" width={120} height={8} sx={{ flex: 1.5 }} />
          <Skeleton variant="text" width={80} sx={{ flex: 1 }} />
          <Skeleton variant="text" width={70} sx={{ flex: 1 }} />
        </Stack>
      ))}
    </CardContent>
  </Card>
);

export const StatCardSkeleton: React.FC = () => (
  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} sx={{ flex: 1, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 2 }}>
          <Skeleton variant="text" width="50%" height={14} />
          <Skeleton variant="text" width="70%" height={32} sx={{ mt: 0.5 }} />
          <Skeleton variant="text" width="40%" height={12} />
        </CardContent>
      </Card>
    ))}
  </Stack>
);
