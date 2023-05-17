import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons'

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [cart, setCart] = useState([])
    const { totalProducts } = useLoaderData()


    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const pageNumbers = [...Array(totalPages).keys()]


    console.log(totalProducts);

    /*
    Done: 1. Determine the total number
    Done: 2. decide on the number of items per page
    Done: 3. Calculate the total number of pages
    Done: 4. determine the current page
    Done: 5. 
    */

    // useEffect(() => {
    //     fetch('http://localhost:5000/products')
    //         .then(res => res.json())
    //         .then(data => setProducts(data))
    // }, []);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch(`http://localhost:5000/products?page=${currentPage}&limit=${itemsPerPage}`);

            const data = await response.json();
            setProducts(data);
        }
        fetchData();
    }, [currentPage, itemsPerPage])

    useEffect(() => {
        const storedCart = getShoppingCart();
        const ids = Object.keys(storedCart);


        fetch('http://localhost:5000/productsByIds', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(ids)
        })
            .then(res => res.json())
            .then(cartProducts => {
                const savedCart = [];

                //* Step 1: Get id
                for (const id in storedCart) {

                    //* Step 2: Get the product by using id
                    const addedProduct = cartProducts.find(product => product._id === id);
                    if (addedProduct) {
                        //* Step 3: Get quantity of the product
                        const quantity = storedCart[id];
                        addedProduct.quantity = quantity

                        //* Step 4: add the addedProduct to the saved cart    
                        savedCart.push(addedProduct);
                    }
                }

                //* Step 5: Set the cart
                setCart(savedCart);
            })
    }, [])

    const handleAddToCart = (product) => {
        let newCart = []
        // const newCart = [...cart, product];
        //* if product doesnt exist in the cart then set quantity = 1
        //* If exists update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id)
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    const options = [5, 10, 15, 20];

    const handleSelectChange = event => {
        setItemsPerPage(parseInt(event.target.value));
        setCurrentPage(1);
    }

    return (
        <>
            <div className='shop-container'>
                <div className="products-container">
                    {products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)}
                </div>
                <div className="cart-container">
                    <Cart
                        cart={cart}
                        handleClearCart={handleClearCart}
                    >
                        <Link className='proceed-link' to='./orders'>
                            <button className='btn-proceed'>Review Order <FontAwesomeIcon icon={faShoppingCart} /></button>
                        </Link>
                    </Cart>
                </div>
            </div>
            {/* Pagination */}
            <div className='pagination'>
                <p>Current Page: {currentPage} and Items per page: {itemsPerPage}</p>
                {
                    pageNumbers.map(number => <button className={currentPage === number ? 'selected' : ''}
                        key={number}
                        onClick={() => setCurrentPage(number)}

                    >



                        {number}
                    </button>)
                }
                <select value={itemsPerPage} onChange={handleSelectChange}>
                    {
                        options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))
                    }

                </select>
            </div>
        </>
    );
};

export default Shop;