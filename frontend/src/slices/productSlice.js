import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: 'product',
    initialState: {
        loading: false,
        product: {},
        error: null
    },
    reducers: {
        productRequest(state) {
            state.loading = true;
            state.error = null;
        },
        productSuccess(state, action) {
            state.loading = false;
            state.product = action.payload;
        },
        productFail(state, action) {
            state.loading = false;
            state.error = action.payload;
        }
    }
});

const { actions, reducer } = productSlice;

export const { productRequest, productSuccess, productFail } = actions;

export default reducer;
