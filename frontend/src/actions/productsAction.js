import axios from "axios";
import { productsFail, productsRequest, productsSuccess } from "../slices/productsSlice";

export const getProducts = (currentPage = 1) => async (dispatch) => {
    try {
        dispatch(productsRequest());

        const { data } = await axios.get(`/api/v1/products?page=${currentPage}`);

        dispatch(productsSuccess({
            products: data.products,
            count: data.count,
            resPerPage: data.resPerPage,
        }));
    } catch (error) {
        dispatch(productsFail(
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message
        ));
    }
};
