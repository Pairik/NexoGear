import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import api from "../services/api";

import "./CartPage.css";

function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalPrice,
  } = useCart();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] =
    useState({
      city: "",
      street: "",
      number: "",
    });

  const [savedAddress, setSavedAddress] =
    useState({
      city: "",
      street: "",
      number: "",
    });

  const [editingAddress, setEditingAddress] =
    useState(false);

  const [loadingAddress, setLoadingAddress] =
    useState(true);

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadUser = async () => {
      if (!user) {
        setLoadingAddress(false);
        return;
      }

      try {
        const response =
          await api.get("/auth/me");

        const address =
          response.data.address || {
            city: "",
            street: "",
            number: "",
          };

        setShippingAddress(address);
        setSavedAddress(address);
      } catch (error) {
        console.error(
          "Error loading user:",
          error
        );
      } finally {
        setLoadingAddress(false);
      }
    };

    loadUser();
  }, [user]);

  const handleAddressChange = (event) => {
    setShippingAddress({
      ...shippingAddress,

      [event.target.name]:
        event.target.value,
    });
  };

  const saveAddress = async () => {
    setError("");

    if (
      !shippingAddress.city.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.number.trim()
    ) {
      setError(
        "Please fill in the complete address."
      );

      return;
    }

    try {
      await api.put(
        "/auth/address",
        shippingAddress
      );

      setSavedAddress({
        ...shippingAddress,
      });

      setEditingAddress(false);
    } catch (error) {
      console.error(error);

      setError(
        "The address could not be saved."
      );
    }
  };

  const cancelAddressEdit = () => {
    setShippingAddress({
      ...savedAddress,
    });

    setEditingAddress(false);
    setError("");
  };

  const checkout = async () => {
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      return;
    }

    if (
      !shippingAddress.city.trim() ||
      !shippingAddress.street.trim() ||
      !shippingAddress.number.trim()
    ) {
      setError(
        "A shipping address is required."
      );

      return;
    }

    try {
      setPlacingOrder(true);

      const products = cart.map(
        (item) => ({
          productId: item.id,
          quantity: item.cartQuantity,
        })
      );

      await api.post("/orders", {
        products,

        city:
          shippingAddress.city.trim(),

        street:
          shippingAddress.street.trim(),

        number:
          shippingAddress.number.trim(),
      });

      clearCart();

      navigate("/my-orders");
    } catch (error) {
      console.error(error);

      const message =
        typeof error.response?.data ===
        "string"
          ? error.response.data
          : "The order could not be created.";

      setError(message);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">

        <h1>Your Cart</h1>

        <div className="empty-cart">

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add a product from the store
            to continue.
          </p>

          <Link
            to="/"
            className="continue-shopping"
          >
            Browse Products
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="cart-page">

      <h1>Your Cart</h1>

      <div className="cart-layout">

        <main className="cart-left">

          <div className="cart-table-header">

            <span>Product</span>

            <span>
              Unit Price
            </span>

            <span>
              Quantity
            </span>

            <span>
              Total
            </span>

          </div>

          {cart.map((item) => (

            <div
              className="cart-item"
              key={item.id}
            >

              <div className="cart-product">

                <Link
                  to={`/products/${item.id}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                  />
                </Link>

                <div>

                  <Link
                    to={`/products/${item.id}`}
                    className="cart-product-name"
                  >
                    {item.name}
                  </Link>

                  <p>
                    {item.brand}
                  </p>

                </div>

              </div>

              <div className="cart-unit-price">
                {Number(
                  item.price
                ).toFixed(2)}
                {" €"}
              </div>

              <div className="quantity-control">

                <button
                  type="button"
                  onClick={() =>
                    decreaseQuantity(
                      item.id
                    )
                  }
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span>
                  {item.cartQuantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    increaseQuantity(
                      item.id
                    )
                  }
                  disabled={
                    item.cartQuantity >=
                    item.quantity
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>

              </div>

              <div className="cart-item-total">

                {(
                  Number(item.price) *
                  item.cartQuantity
                ).toFixed(2)}
                {" €"}

              </div>

            </div>

          ))}


          <section className="shipping-section">

            <div className="shipping-title">

              <div>
                <h2>
                  Shipping Address
                </h2>

                <p>
                  We use the address saved
                  in your profile.
                </p>
              </div>

              {!editingAddress &&
                user && (
                  <button
                    className="edit-address-button"
                    onClick={() =>
                      setEditingAddress(
                        true
                      )
                    }
                  >
                    Edit Address
                  </button>
                )}

            </div>

            {loadingAddress ? (

              <p>
                Loading address...
              </p>

            ) : !user ? (

              <div className="address-login">

                <p>
                  Sign in to use the
                  address saved in your
                  profile.
                </p>

                <button
                  onClick={() =>
                    navigate("/login")
                  }
                >
                  Login
                </button>

              </div>

            ) : editingAddress ? (

              <div className="address-form">

                <div className="address-field">

                  <label>
                    City
                  </label>

                  <input
                    name="city"
                    value={
                      shippingAddress.city
                    }
                    onChange={
                      handleAddressChange
                    }
                  />

                </div>

                <div className="address-field">

                  <label>
                    Street
                  </label>

                  <input
                    name="street"
                    value={
                      shippingAddress.street
                    }
                    onChange={
                      handleAddressChange
                    }
                  />

                </div>

                <div className="address-field">

                  <label>
                    Number
                  </label>

                  <input
                    name="number"
                    value={
                      shippingAddress.number
                    }
                    onChange={
                      handleAddressChange
                    }
                  />

                </div>

                <div className="address-buttons">

                  <button
                    className="save-address-button"
                    onClick={saveAddress}
                  >
                    Save Address
                  </button>

                  <button
                    className="cancel-address-button"
                    onClick={
                      cancelAddressEdit
                    }
                  >
                    Cancel
                  </button>

                </div>

              </div>

            ) : (

              <div className="saved-address">

                <strong>
                  {user.firstName}
                </strong>

                <span>
                  {shippingAddress.city}
                </span>

                <span>
                  {shippingAddress.street}
                  {" "}
                  {shippingAddress.number}
                </span>

              </div>

            )}

          </section>

        </main>


        <aside className="cart-summary">

          <h2>
            Order Summary
          </h2>

          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <strong>
              {totalPrice.toFixed(2)}
              {" €"}
            </strong>

          </div>

          <div className="summary-row">

            <span>
              Shipping
            </span>

            <span>
              Free
            </span>

          </div>

          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              {totalPrice.toFixed(2)}
              {" €"}
            </strong>

          </div>

          {error && (
            <p className="cart-error">
              {error}
            </p>
          )}

          <button
            className="checkout-button"
            onClick={checkout}
            disabled={placingOrder}
          >
            {placingOrder
              ? "Processing..."
              : "Place Order"}
          </button>

          <Link
            to="/"
            className="back-shopping"
          >
            ← Continue Shopping
          </Link>

        </aside>

      </div>

    </div>
  );
}

export default CartPage;