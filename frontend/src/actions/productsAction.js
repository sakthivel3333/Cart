import axios from "axios";
import { productsFail, productsRequest, productsSuccess } from "../slices/productsSlice";

export const getProducts = () => async (dispatch) => {
    try {
        dispatch(productsRequest());

        const { data } = await axios.get('/api/v1/products');
        dispatch(productsSuccess(data.products));
    } catch (error) {
        dispatch(productsFail(
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message
        ));
    }
};
