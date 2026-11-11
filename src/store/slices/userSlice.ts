import {createClient} from '../../utils/supabase/client'
import type { Session } from "@supabase/supabase-js";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const getLoggedInUser = createAsyncThunk('users/getUser', async () => {
    const supabase = await createClient()
    const { data, error} = await supabase.auth.getSession()
    return data
})

export const userLogOut =  createAsyncThunk('users/logout', async () => {
    const supabase = await createClient()
    const { error} = await supabase.auth.signOut()
    return error
})

export const userSignIn  =  createAsyncThunk('users/signIn', async (user: {email: string, password: string}) => {
    const supabase = await createClient()
    const { data, error} = await supabase.auth.signInWithPassword(user)
    return error ? { error: error.message} : data
})

export const userSlice = createSlice({
    name: 'users',
    initialState: { 
        user: {
            id: null,
        }, 
        session: {}
    },
    reducers: {
        setAuthSession: (state, action: PayloadAction<Session | null>) => {
            state.user = action.payload?.user ?? { id: null }
            state.session = action.payload ?? {}
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getLoggedInUser.fulfilled, (state, action)=> {
            if(action.payload.session) {
                state.user = action.payload.session.user
                state.session = action.payload.session
            } else {
                state.user = { id: null }
                state.session = {}
            }
        })
        builder.addCase(userLogOut.fulfilled, (state, action)=> {
            state.user = { id: null }
            state.session = {}
        })
        builder.addCase(userSignIn.fulfilled, (state, action) => {
            if('session' in action.payload && action.payload.session) {
                state.user = action.payload.session.user
                state.session = action.payload.session
            }
        })
    }
})

export const { setAuthSession } = userSlice.actions
export default userSlice.reducer
