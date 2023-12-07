import { createBrowserRouter } from "react-router-dom";
import Login from "../components/login/Login";
import App from "../App";
import Lobby from "../components/lobby/Lobby";
import Signup from "../components/login/Signup";

export const routes = {
    login: '/login',
    signup: '/signup',
    root: '/',
}

export const router = createBrowserRouter([
    {
        path: routes.root,
        element: <App />,
        children: [
            {
                index: true,
                element: <Lobby />
            },
            {
                path: routes.login,
                element: <Login />
            },
            {
                path: routes.signup,
                element: <Signup />
            },
        ]
    },
]);

