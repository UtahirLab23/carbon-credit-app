import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Box, Button, Typography } from '@mui/material';
import { BugReport } from '@mui/icons-material';

function Fallback({ error, resetErrorBoundary }: FallbackProps) {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="40vh"
      gap={2}
      p={4}
      textAlign="center"
    >
      <BugReport sx={{ fontSize: 56, color: 'error.main', opacity: 0.7 }} />
      <Typography variant="h6" fontWeight={700}>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400}>
        {msg}
      </Typography>
      <Button variant="outlined" color="primary" onClick={resetErrorBoundary}>
        Try Again
      </Button>
    </Box>
  );
}

const AppErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ReactErrorBoundary FallbackComponent={Fallback}>{children}</ReactErrorBoundary>
);

export default AppErrorBoundary;
