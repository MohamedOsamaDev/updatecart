import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { addToCart, removeItem, resetCart } from "../../Redux/cartReducer";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { stateUser } from "../../helpers";
import axios from "axios";
const Cart = ({ open, setOpen }) => {
  const id = useParams().id;
  const locaction = useLocation();
  const products = useSelector((state) => state.cart.products);
  const dispatch = useDispatch();
  const havorder = useSelector((state) => state.cart.haveOrder);
  const { role } = stateUser();

  const totalPrice = () => {
    let total = 0;
    products.forEach((item) => {
      total +=
        item.quantity * (item.price - item.price * (item.discount / 100));
    });

    return total.toFixed(2);
  };

  const Count = products?.map((item) => item.id);
  useEffect(() => {
    if (locaction.pathname.includes("product") && Count.length <= 1) {
      setOpen(true);
    }
  }, [products]);
  useEffect(() => {
    if (havorder === false) {
      products.map((item) => checkdata(item));
    }
  }, [products, open]);
  useEffect(() => {
    setOpen(false);
  }, [locaction]);

  useEffect(() => {
    if (locaction.pathname.includes("cart") || !!role || Count.length <= 0) {
      setOpen(false);
    }
  }, [open]);

  const checkdata = async (item) => {
    const url = `${process.env.REACT_APP_API_URL}/products/${item.title}?populate=*`;
    try {
      const res = await axios.get(
        url,

        {
          headers: {
            Authorization: "bearer " + process.env.REACT_APP_API_TOKEN,
          },
        }
      );
      var stock = 0;
      switch (item.sizeSelect) {
        case "small":
          stock = res?.data?.data?.attributes?.small;
          break;
        case "medium":
          stock = res?.data?.data?.attributes?.medium;
          break;
        case "large":
          stock = res?.data?.data?.attributes?.large;
          break;
        case "Xlarge":
          stock = res?.data?.data?.attributes?.Xlarge;
          break;
      }
      if (!!res) {
        if (
          item.price !== res?.data?.data?.attributes?.price ||
          item.discount !== res?.data?.data?.attributes?.discount ||
          item.stock !== stock
        ) {
          dispatch(
            addToCart({
              id: item.id,
              slug: item.slug,
              quantity: item.quantity,
              price: res?.data?.data?.attributes?.price,
              discount: res?.data?.data?.attributes?.discount,
              stock: stock,
            })
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={open ? "openbasket cart" : "closebasket cart"}>
      <div className="header">
        <h1>Products in your cart</h1>
        <CloseIcon onClick={(e) => setOpen(false)} />
      </div>
      <span>
        {Count.length <= 1 ? (
          <span className="reset"></span>
        ) : (
          <span className="reset" onClick={() => dispatch(resetCart())}>
            Reset Cart
          </span>
        )}
      </span>
      <div className="product-cart">
        {products?.map((item) => (
          <div className="item" key={item.id}>
            <div className="left">
              <Link to={`/product/${item.title}`} key={item.id}>
                <img src={process.env.REACT_APP_UP_URL + item.img} alt="" />
              </Link>
              <div className="details">
                <h1>
                  {item?.title?.substring(0, 18)}
                  {item?.title?.length >= 30 ? " ..." : ""}
                </h1>
                <p>
                  {item.desc?.substring(0, 19)}
                  {item?.desc?.length >= 32 ? " ..." : ""}
                </p>
                <div className="info">
                  <div className="qXPrice">
                    {item.quantity} x $
                    {item.price - item.price * (item.discount / 100)}
                  </div>

                  <div className="size-color-box">
                    <span className="size">
                      {item.sizeSelect} | {item.colorSelected}{" "}
                      <span
                        className="colorproduct"
                        style={{ background: `${item.colorSelected}` }}
                      ></span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="remove">
              <CloseIcon
                className="delete"
                onClick={() => dispatch(removeItem(item.id))}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="bottom">
        <div className="total">
          <span>SUBTOTAL</span>
          <span>${totalPrice()}</span>
        </div>
        <Link to={"/cart"} className="Link" onClick={(e) => setOpen(false)}>
          PROCEED TO CHECKOUT
        </Link>
      </div>
    </div>
  );
};

export default Cart;
