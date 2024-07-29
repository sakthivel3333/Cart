import React, { useEffect, Fragment } from "react";
import MetaData from "./layouts/MetaData";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../actions/productsAction";
import Loader from "./layouts/Loader";
import Product from "./product/Product";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    const dispatch = useDispatch();
    const { products, loading, error } = useSelector((state) => state.productsState);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-center'
            });
            return;
        }
       
        dispatch(getProducts());
    }, [dispatch, error]);

    return (
        <Fragment>
            {loading ? (
                <Loader />
            ) : (
                <Fragment>
                    <MetaData title={'Buy Best Products'} />
                    <h1 id="products_heading">Latest Products</h1>
                    <section id="products" className="container mt-5">
                        <div className="row">
                            {products && products.map(product => (
                                <Product key={product._id} product={product} />
                            ))}
                        </div>
                    </section>
                </Fragment>
            )}
             <ToastContainer theme='dark'/>
        </Fragment>
    );
}
