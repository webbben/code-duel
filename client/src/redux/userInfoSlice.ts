import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

// Define a type for the slice state
interface UserInfoState {
  username?: string,
  email?: string,
  idToken?: string,
  loggedIn: boolean
}

// Define the initial state using that type
const initialState: UserInfoState = {
  username: undefined,
  email: undefined,
  idToken: undefined,
  loggedIn: false
}

export const userInfoSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoState>) => {
        console.log("setting user info", action.payload);
        state.email = action.payload.email;
        state.username = action.payload.username;
        state.idToken = action.payload.idToken;
        state.loggedIn = action.payload.loggedIn;
    },
    clearUserInfo: (state) => {
      state.email = undefined;
      state.idToken = undefined;
      state.username = undefined;
      state.loggedIn = false;
    },
  },
})

export const { setUserInfo, clearUserInfo } = userInfoSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectUserInfo = (state: RootState) => state.userInfo;

export default userInfoSlice.reducer