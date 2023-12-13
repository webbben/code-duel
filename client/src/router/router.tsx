import { createBrowserRouter } from "react-router-dom";
import Login from "../components/login/Login";
import App from "../App";
import Lobby, { loader as lobbyLoader } from "../components/lobby/Lobby";
import Signup from "../components/login/Signup";
import Room, { loader as roomLoader } from "../components/room/Room";

export const routes = {
    login: '/login',
    signup: '/signup',
    root: '/',
    room: '/room'
}

export const router = createBrowserRouter([
    {
        path: routes.root,
        element: <App />,
        children: [
            {
                index: true,
                element: <Lobby />,
                loader: lobbyLoader
            },
            {
                path: routes.login,
                element: <Login />
            },
            {
                path: routes.signup,
                element: <Signup />
            },
            {
                path: `${routes.room}/:roomID`,
                element: <Room />,
                loader: roomLoader
            }
        ]
    },
]);

