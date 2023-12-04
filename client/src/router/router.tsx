import { createBrowserRouter } from "react-router-dom";
import Login from "../components/login/Login";
import App from "../App";
import Lobby from "../components/lobby/Lobby";
import Signup from "../components/login/Signup";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                index: true,
                element: <Lobby />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/signup',
                element: <Signup />
            },
            {
                path: '/rooms',
                element: <div>rooms</div>
            },
        ]
    },
]);