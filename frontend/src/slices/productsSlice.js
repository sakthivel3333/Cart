import { createSlice } from "@reduxjs/toolkit";

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        loading: false,
        products: [],
        error: null,
    },
    reducers: {
        productsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        productsSuccess(state, action) {
            state.loading = false;
            state.products = action.payload.products;
            state.productsCount = action.payload.count;
            state.resPerPage = action.payload.resPerPage;
        },
        productsFail(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    }
});
 
const { actions, reducer } = productsSlice;

export const { productsRequest, productsSuccess, productsFail } = actions;

export default reducer;
