import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PaymentMethod.css";
import {
  contactInfo,
  usercontactadd,
  checkPathname,
  resetCart,
  ChangeState,
  removeItem,
  addToCart,
} from "../../../Redux/cartReducer";
import { useDispatch, useSelector } from "react-redux";
import CreditCard from "./payment-componts/credit-card/creditCard";
import axios from "axios";
import { userData } from "../../../helpers";
import { toast } from "react-toastify";
import CashDelivery from "./payment-componts/CashOndelivery/CashDelivery";

const PaymentMethod = () => {
  const checkPathnames = useSelector((state) => state.cart.pathanme);
  const navigate = useNavigate();
  const { username, jwt } = userData();
  const Location = useLocation().pathname;
  const dispatch = useDispatch();
  const [btnactive, setbtnactive] = useState("1");
  const ContactInfoUser = useSelector((state) => state.cart.contactinfo);
  const products = useSelector((state) => state.cart.products);
  const [checkProductsOrder, setcheckProductsOrder] = useState(0);
  const [haveChanges, sethaveChanges] = useState(false);
  useEffect(() => {
    if (Location !== checkPathnames) {
      navigate(checkPathnames);
    }
  }, [Location]);
  useEffect(() => {
    if (checkProductsOrder === products?.length && products.length !== 0) {
      console.log("go");
      postOrder();
    }
    const cheker = products.find((i) => i.stock < i.quantity);
    // console.log([cheker].length)
    if (cheker) {
      toast.error("no products  to make a an order ");
    }
  }, [checkProductsOrder]);

  const handlepayment = (e) => {
    const id = e.target.id;
    setbtnactive(id);
  };
  const totalPrice = () => {
    let total = 0;
    products.forEach((item) => {
      total +=
        item.quantity * (item.price - item.price * (item.discount / 100));
    });
    let Tax = total * 0.14;
    total += Tax + 15;
    return total.toFixed(2);
  };

  const startToMakeOrder = () => {
    setcheckProductsOrder(0);
    if (products.length === 0) {
      toast.error("no products  to make a an order ");
    } else {
      products.map((item, ind) => checkProducts(item, ind));
    }
    const cheker = products.find((i) => i.stock < i.quantity);
    // console.log([cheker].length)
    if (cheker) {
      toast.error("no products  to make a an order ");
    }
  };
  console.log(checkProductsOrder);
  const checkProducts = async (item, ind) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/products/${item.puplic_url}`,

        {
          headers: {
            Authorization: "bearer " + process.env.REACT_APP_API_TOKEN,
          },
        }
      );
      if (!!res) {
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

        if (stock < item.quantity || item.stock < item.quantity) {
          dispatch(
            addToCart({
              id: item.id,
              price: item.price,
              discount: item.discount,
              stock: stock,
              quantity: item.quantity,
            })
          );
          setcheckProductsOrder(0);
          console.log(stock);
        } else {
          setcheckProductsOrder(ind + 1);
        }
      }
    } catch (error) {
      toast.error(error.response.data.error.message);
      console.log({ error });
    }
  };

  const postOrder = async () => {
    const url = `${process.env.REACT_APP_API_URL}/orders`;
    if (checkProductsOrder !== products?.length && products.length === 0) {
      toast.error("no products  to make a an order ");
    } else {
      try {
        const res = await axios.post(
          url,
          {
            data: {
              slug: ContactInfoUser.id + new Date().getTime().toString(),
              username: ContactInfoUser.Name,
              loaction: ContactInfoUser.location,
              city: ContactInfoUser.city,
              street: ContactInfoUser.street,
              phone: ContactInfoUser.telephone,
              email: ContactInfoUser.email,
              postalCode: ContactInfoUser.postalCode,
              Governorate: ContactInfoUser.Governorate,
              user: ContactInfoUser.id,
              products: products,
              total: totalPrice(),
              state_order: "requsted",
              date: new Date(),
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `bearer ${jwt}`,
            },
          }
        );
        if (!!res) {
          toast.success("added successfully!", {
            hideProgressBar: true,
          });
          dispatch(ChangeState());
          products.map((item) => handleOrder(item));
        }
      } catch (error) {
        toast.error(error.response.data.error.message);
        console.log({ error });
      }
    }
  };

  const handleOrder = async (item) => {
    const url = `${process.env.REACT_APP_API_URL}/products/${item.slug}`;
    let data = {};

    switch (item.sizeSelect) {
      case "small":
        data = {
          data: {
            small:
              item.stock - item.quantity === 0 ? 0 : item.stock - item.quantity,
          },
        };
        break;
      case "medium":
        data = {
          data: {
            medium:
              item.stock - item.quantity === 0 ? 0 : item.stock - item.quantity,
          },
        };
        break;
      case "large":
        data = {
          data: {
            large:
              item.stock - item.quantity === 0 ? 0 : item.stock - item.quantity,
          },
        };
        break;
      case "Xlarge":
        data = {
          data: {
            Xlarge:
              item.stock - item.quantity === 0 ? 0 : item.stock - item.quantity,
          },
        };
        break;
    }

    try {
      const res = await axios.put(url, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${jwt}`,
        },
      });
      if (!!res) {
        toast.success("updated successfully!", {
          hideProgressBar: true,
        });

        dispatch(checkPathname("/cart/Checkout/order-requsted"));
        dispatch(removeItem(item.id));
      }
    } catch (error) {
      toast.error(error.response.data.error.message);
      console.log({ error });
    }
    if (!products.length) {
      navigate("/cart/Checkout/order-requsted");
    }
  };

  return (
    <div className="payment-method">
      <h1>choose payment method</h1>
      <ul>
        <li>
          <button
            id="1"
            className={btnactive === "1" ? "btn-active" : ""}
            onClick={handlepayment}
          >
            paypal{" "}
          </button>
        </li>
        <li>
          <button
            id="2"
            className={btnactive === "2" ? "btn-active" : ""}
            onClick={handlepayment}
          >
            credit card{" "}
          </button>
        </li>
        <li>
          <button
            id="3"
            className={btnactive === "3" ? "btn-active" : ""}
            onClick={handlepayment}
          >
            cash on delivery
          </button>
        </li>
      </ul>

      {btnactive !== "3" ? <CreditCard /> : ""}
      {btnactive === "3" ? <CashDelivery /> : ""}
      <div className="btns-box">
        <button
          className="back-btn"
          onClick={(e) => {
            dispatch(checkPathname("/cart/Checkout/contact-information"));
            navigate("/cart/Checkout/contact-information");
          }}
        >
          back
        </button>
        <button onClick={() => startToMakeOrder()} className="btn-next-step">
          to next step${checkProductsOrder}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethod;
