import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { browserSessionPersistence, getAuth, setPersistence } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseApiKey = process.env.REACT_APP_FIREBASE_API_KEY;
if (!firebaseApiKey || firebaseApiKey === "") {
  console.error("env variable FIREBASE_API_KEY not found.");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
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

// set persistence for logins
const auth = getAuth(app);
setPersistence(auth, browserSessionPersistence);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
