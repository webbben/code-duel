import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { firebaseAPIKey } from './private';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseAPIKey,
  authDomain: "code-duel-dd410.firebaseapp.com",
  projectId: "code-duel-dd410",
  storageBucket: "code-duel-dd410.appspot.com",
  messagingSenderId: "8804316486",
  appId: "1:8804316486:web:1608f31c9f470b690ea147",
  measurementId: "G-BB289WQG25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
console.log(`Initialized firebase app ${app.name}`);

/** URL where our server API endpoints can be accessed */
export const serverURL = 'http://localhost:8080';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
