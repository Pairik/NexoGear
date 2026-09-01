import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

import "./AdminOrdersPage.css";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response =
        await api.get("/orders");

      setOrders(response.data);
    } catch (error) {
      console.error(
        "Error loading orders:",
        error
      );

      setError(
        "Orders could not be loaded."
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

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "admin-status-pending";

      case "Processing":
        return "admin-status-processing";

      case "Completed":
        return "admin-status-completed";

      case "Cancelled":
        return "admin-status-cancelled";

      default:
        return "";
    }
  };

  const updateStatus = async (
    orderId,
    newStatus
  ) => {
    setError("");
    setMessage("");
    setUpdatingId(orderId);

    try {
      await api.put(
        `/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
              }
            : order
        )
      );

      setMessage(
        "Order status updated successfully."
      );
    } catch (error) {
      console.error(
        "Error updating order:",
        error
      );

      setError(
        "Order status could not be updated."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const displayedOrders =
  useMemo(() => {
    const searchTerm =
      search
        .trim()
        .replace("#", "")
        .toLowerCase();

    const filtered =
      orders.filter((order) => {
        if (!searchTerm) {
          return true;
        }

        const fullId =
          order.id?.toLowerCase() || "";

        const shortId =
          getShortOrderId(order.id)
            .toLowerCase();

        return (
          fullId.includes(searchTerm) ||
          shortId.includes(searchTerm)
        );
      });

    const getStatusPriority = (status) => {
      switch (status) {
        case "Pending":
          return 0;

        case "Processing":
          return 0;

        case "Completed":
          return 1;

        case "Cancelled":
          return 2;

        default:
          return 3;
      }
    };

    return [...filtered].sort((a, b) => {
      const priorityA =
        getStatusPriority(a.status);

      const priorityB =
        getStatusPriority(b.status);

      // First sort by status group.
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Inside each group,
      // newest orders first.
      return (
        new Date(b.orderDate) -
        new Date(a.orderDate)
      );
    });
  }, [orders, search]);

  const activeOrdersCount =
  orders.filter(
    (order) =>
      order.status === "Pending" ||
      order.status === "Processing"
  ).length;

  const completedOrdersCount =
    orders.filter(
      (order) =>
        order.status === "Completed"
    ).length;

  if (loading) {
    return (
      <div className="admin-orders-page">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      <div className="admin-orders-header">

        <div>
          <h1>
            Order Administration
          </h1>

          <p>
            Search, review and manage
            customer orders.
          </p>
        </div>

        <div className="admin-order-stats">

          <div className="order-stat-card">

            <span>
              Active
            </span>

            <strong>
              {activeOrdersCount}
            </strong>

          </div>

          <div className="order-stat-card">

            <span>
              Completed
            </span>

            <strong>
              {completedOrdersCount}
            </strong>

          </div>

        </div>

      </div>


      {message && (
        <div className="admin-orders-success">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-orders-error">
          {error}
        </div>
      )}


      <section className="admin-orders-toolbar">

        <div className="admin-order-search">

          <span className="admin-search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by Order ID..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="clear-order-search"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </div>

        <span className="admin-orders-count">
          {displayedOrders.length}
          {" "}
          {displayedOrders.length === 1
            ? "order"
            : "orders"}
        </span>

      </section>


      {displayedOrders.length === 0 ? (

        <div className="admin-no-orders">

          <h3>
            No orders found
          </h3>

          <p>
            Check the Order ID and try
            searching again.
          </p>

        </div>

      ) : (

        <div className="admin-orders-list">

          {displayedOrders.map(
            (order) => (

              <article
                className={`admin-order-card ${
                  order.status ===
                  "Completed"
                    ? "completed-order-card"
                    : ""
                }`}
                key={order.id}
              >

                <div className="admin-order-card-header">

                  <div className="admin-order-basic-info">

                    <div className="admin-order-info-block">

                      <span className="admin-order-label">
                        Order Number
                      </span>

                      <strong className="admin-order-number">
                        #
                        {getShortOrderId(
                          order.id
                        )}
                      </strong>

                    </div>


                    <div className="admin-order-info-block">

                      <span className="admin-order-label">
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          order.orderDate
                        )}
                      </strong>

                    </div>


                    <div className="admin-order-info-block">

                      <span className="admin-order-label">
                        Total
                      </span>

                      <strong className="admin-order-total">
                        {Number(
                          order.totalPrice
                        ).toFixed(2)}
                        {" €"}
                      </strong>

                    </div>

                  </div>


                  <div
                    className={`admin-order-status ${getStatusClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </div>

                </div>


                <div className="admin-order-content">

                  <div className="admin-order-products-section">

                    <h3>
                      Products
                    </h3>

                    <div className="admin-order-products">

                      {order.products?.map(
                        (
                          product,
                          index
                        ) => (

                          <div
                            className="admin-order-product"
                            key={`${product.productId}-${index}`}
                          >

                            <div className="admin-order-product-image">

                              {product.imageUrl ? (

                                <img
                                  src={
                                    product.imageUrl
                                  }
                                  alt={
                                    product.productName
                                  }
                                />

                              ) : (

                                <span>
                                  No image
                                </span>

                              )}

                            </div>

                            <div className="admin-order-product-info">

                              <strong>
                                {
                                  product.productName
                                }
                              </strong>

                              <span>
                                Quantity:{" "}
                                {
                                  product.quantity
                                }
                              </span>

                              <span>
                                {Number(
                                  product.price
                                ).toFixed(2)}
                                {" € each"}
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>


                  <div className="admin-order-side">

                    <div className="admin-shipping-card">

                      <span className="admin-order-label">
                        Shipping Address
                      </span>

                      <strong>
                        {
                          order
                            .shippingAddress
                            ?.city
                        }
                      </strong>

                      <span>
                        {
                          order
                            .shippingAddress
                            ?.street
                        }
                        {" "}
                        {
                          order
                            .shippingAddress
                            ?.number
                        }
                      </span>

                    </div>


                    <div className="admin-status-control">

                      <label>
                        Order Status
                      </label>

                      <select
                        value={
                          order.status
                        }
                        disabled={
                          updatingId ===
                          order.id
                        }
                        onChange={(
                          event
                        ) =>
                          updateStatus(
                            order.id,
                            event.target
                              .value
                          )
                        }
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="Processing">
                          Processing
                        </option>

                        <option value="Completed">
                          Completed
                        </option>

                        <option value="Cancelled">
                          Cancelled
                        </option>

                      </select>

                      {updatingId ===
                        order.id && (
                        <span className="updating-status-text">
                          Updating...
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </article>

            )
          )}

        </div>
      )}

    </div>
  );
}

export default AdminOrdersPage;