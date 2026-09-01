import { useEffect, useState } from "react";
import api from "../services/api";
import "./MyOrdersPage.css";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders/my");

      setOrders(response.data);
    } catch (error) {
      console.error(
        "Error loading orders:",
        error
      );

      setError(
        "The orders could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const getShortOrderId = (id) => {
    if (!id) {
      return "";
    }

    return id
      .slice(-8)
      .toUpperCase();
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Pending";

      case "Processing":
        return "Processing";

      case "Completed":
        return "Completed";

      case "Cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";

      case "Processing":
        return "status-processing";

      case "Completed":
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="my-orders-page">
        <h2>
          Loading orders...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-page">
        <p className="orders-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="my-orders-page">

      <h1>
        My Orders
      </h1>

      {orders.length === 0 ? (

        <div className="no-orders">

          <h2>
            You do not have any orders yet
          </h2>

          <p>
            Your placed orders will appear here.
          </p>

        </div>

      ) : (

        <div className="orders-list">

          {orders.map((order) => (

            <article
              key={order.id}
              className="order-card"
            >

              <div className="order-header">

                <div className="order-info">

                  <div className="order-info-block">

                    <span className="order-label">
                      Order Number
                    </span>

                    <strong className="order-number">
                      #{getShortOrderId(order.id)}
                    </strong>

                  </div>

                  <div className="order-info-block">

                    <span className="order-label">
                      Date
                    </span>

                    <strong>
                      {formatDate(order.orderDate)}
                    </strong>

                  </div>

                  <div className="order-info-block">

                    <span className="order-label">
                      Total
                    </span>

                    <strong>
                      {Number(
                        order.totalPrice
                      ).toFixed(2)} €
                    </strong>

                  </div>

                </div>

                <div
                  className={`order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {getStatusText(
                    order.status
                  )}
                </div>

              </div>


              <div className="order-products">

                {order.products.map(
                  (product, index) => (

                    <div
                      className="order-product"
                      key={`${product.productId}-${index}`}
                    >

                      <div className="order-product-image-wrapper">

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="order-product-image"
                          />

                        ) : (

                          <div className="no-product-image">
                            No image
                          </div>

                        )}

                      </div>

                      <div className="order-product-quantity">
                        x{product.quantity}
                      </div>

                    </div>

                  )
                )}

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}

export default MyOrdersPage;