import React from 'react';
import logo from './logo.svg';
import './App.css';
import Login from './components/login/Login';
import { ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
    <div className="App">
      <Login />
    </div>
    </ThemeProvider>
  );
}

export default App;
