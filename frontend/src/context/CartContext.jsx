import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import "./CartNotification.css";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart =
      localStorage.getItem("cart");

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  });

  const [notification, setNotification] =
    useState("");

  const notificationTimer = useRef(null);

  const saveCart = (newCart) => {
    setCart(newCart);

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );
  };

  const showCartNotification = (
    productName
  ) => {
    if (notificationTimer.current) {
      clearTimeout(
        notificationTimer.current
      );
    }

    setNotification(productName);

    notificationTimer.current =
      setTimeout(() => {
        setNotification("");
      }, 2500);
  };

  useEffect(() => {
    return () => {
      if (
        notificationTimer.current
      ) {
        clearTimeout(
          notificationTimer.current
        );
      }
    };
  }, []);

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      return;
    }

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    let newCart;

    if (existingProduct) {
      if (
        existingProduct.cartQuantity >=
        product.quantity
      ) {
        return;
      }

      newCart = cart.map((item) =>
        item.id === product.id
          ? {
              ...item,

              cartQuantity:
                item.cartQuantity + 1,
            }
          : item
      );
    } else {
      newCart = [
        ...cart,

        {
          ...product,
          cartQuantity: 1,
        },
      ];
    }

    saveCart(newCart);

    showCartNotification(
      product.name
    );
  };

  const increaseQuantity = (
    productId
  ) => {
    const product = cart.find(
      (item) => item.id === productId
    );

    if (!product) {
      return;
    }

    if (
      product.cartQuantity >=
      product.quantity
    ) {
      return;
    }

    const newCart = cart.map(
      (item) =>
        item.id === productId
          ? {
              ...item,

              cartQuantity:
                item.cartQuantity + 1,
            }
          : item
    );

    saveCart(newCart);
  };

  const decreaseQuantity = (
    productId
  ) => {
    const product = cart.find(
      (item) => item.id === productId
    );

    if (!product) {
      return;
    }

    if (
      product.cartQuantity <= 1
    ) {
      const newCart = cart.filter(
        (item) =>
          item.id !== productId
      );

      saveCart(newCart);

      return;
    }

    const newCart = cart.map(
      (item) =>
        item.id === productId
          ? {
              ...item,

              cartQuantity:
                item.cartQuantity - 1,
            }
          : item
    );

    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        item.cartQuantity,
    0
  );

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.cartQuantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}

      {notification && (
        <div className="cart-notification">

          <div className="cart-notification-icon">
            ✓
          </div>

          <div className="cart-notification-content">

            <strong>
              {notification}
            </strong>

            <span>
              Added to your cart
            </span>

          </div>

        </div>
      )}

    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}