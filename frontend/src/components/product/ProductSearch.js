import React, { useEffect, Fragment, useState } from "react";
import MetaData from ".././layouts/MetaData";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../actions/productsAction";
import Loader from ".././layouts/Loader";
import Product from ".././product/Product";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Pagination from 'react-js-pagination';
import { useParams } from "react-router-dom";

export default function ProductSearch() {
    const dispatch = useDispatch();
    const { products, loading, error, productsCount, resPerPage } = useSelector((state) => state.productsState);
    const [currentPage, setCurrentPage] = useState(1);
    const {keyword } = useParams();



    console.log(currentPage)
    const setCurrentPageNo = (pageNo) => {
        setCurrentPage(pageNo);
    };

    useEffect(() => {
        if (error) { 
            toast.error(error, {
                position: 'bottom-center'
            });
            return;
        }

        dispatch(getProducts(currentPage));
    }, [dispatch, error, currentPage]);

    useEffect(() => {
        console.log("productsCount:", productsCount);
        console.log("resPerPage:", resPerPage);
    }, [productsCount, resPerPage]);

    return (
        <Fragment>
            {loading ? (
                <Loader />
            ) : (
                <Fragment>
                    <MetaData title={'Buy Best Products'} />
                    <h1 id="products_heading">Search Products</h1>
                    <section id="products" className="container mt-5">
                        <div className="row">
                            {products && products.map(product => (
                                <Product key={product._id} product={product} />
                            ))}
                        </div>
                    </section>
                    {productsCount > 0 && productsCount > resPerPage ?
                    <div className="d-flex justify-content-center mt-5">
                        <Pagination
                            activePage={currentPage}
                            onChange={setCurrentPageNo}
                            totalItemsCount={productsCount}
                            itemsCountPerPage={resPerPage}
                            nextPageText={'Next'}
                            firstPageText={'First'}
                            lastPageText={'Last'}
                            itemClass={'page-item'}
                            linkClass={'page-link'}
                        />
                    </div> : null }
                </Fragment>
            )}
            <ToastContainer theme='dark' />
        </Fragment>
    );
}
   