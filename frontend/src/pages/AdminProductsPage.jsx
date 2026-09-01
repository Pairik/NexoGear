import {
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

import "./AdminProductsPage.css";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  quantity: "",
  category: "",
  brand: "",
  imageUrl: "",
};

function AdminProductsPage() {
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [formData, setFormData] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [stockAmounts, setStockAmounts] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response =
        await api.get("/products");

      setProducts(response.data);
    } catch (error) {
      console.error(error);

      setError(
        "Products could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      if (!term) {
        return products;
      }

      return products.filter(
        (product) =>
          product.name
            ?.toLowerCase()
            .includes(term) ||

          product.brand
            ?.toLowerCase()
            .includes(term) ||

          product.category
            ?.toLowerCase()
            .includes(term)
      );
    }, [products, search]);

  const handleChange = (event) => {
    setFormData({
      ...formData,

      [event.target.name]:
        event.target.value,
    });
  };

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingId(null);

    setShowForm(false);

    setError("");
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData(emptyForm);

    setError("");
    setMessage("");

    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      description:
        product.description || "",
      price: product.price ?? "",
      quantity:
        product.quantity ?? "",
      category:
        product.category || "",
      brand:
        product.brand || "",
      imageUrl:
        product.imageUrl || "",
    });

    setError("");
    setMessage("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.category.trim() ||
      !formData.brand.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    if (Number(formData.price) <= 0) {
      setError(
        "Price must be greater than 0."
      );

      return;
    }

    if (Number(formData.quantity) < 0) {
      setError(
        "Quantity cannot be negative."
      );

      return;
    }

    const productData = {
      name:
        formData.name.trim(),

      description:
        formData.description.trim(),

      price:
        Number(formData.price),

      quantity:
        Number(formData.quantity),

      category:
        formData.category.trim(),

      brand:
        formData.brand.trim(),

      imageUrl:
        formData.imageUrl.trim(),
    };

    try {
      if (editingId) {
        await api.put(
          `/products/${editingId}`,
          productData
        );

        setMessage(
          "Product updated successfully."
        );
      } else {
        await api.post(
          "/products",
          productData
        );

        setMessage(
          "Product added successfully."
        );
      }

      await loadProducts();

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);

    } catch (error) {
      console.error(error);

      setError(
        typeof error.response?.data ===
        "string"
          ? error.response.data
          : "The operation failed."
      );
    }
  };

  const handleStockChange = (
    productId,
    value
  ) => {
    setStockAmounts({
      ...stockAmounts,

      [productId]: value,
    });
  };

  const addStock = async (product) => {
    const amount =
      Number(
        stockAmounts[product.id]
      );

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      setError(
        "Stock quantity must be a positive whole number."
      );

      return;
    }

    setError("");
    setMessage("");

    try {
      await api.put(
        `/products/${product.id}/stock`,
        {
          quantity: amount,
        }
      );

      setStockAmounts({
        ...stockAmounts,

        [product.id]: "",
      });

      setMessage(
        `${amount} units added to ${product.name}.`
      );

      await loadProducts();

    } catch (error) {
      console.error(error);

      setError(
        "Stock could not be updated."
      );
    }
  };

  const deleteProduct = async (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(
        `/products/${product.id}`
      );

      setMessage(
        "Product deleted successfully."
      );

      await loadProducts();

    } catch (error) {
      console.error(error);

      setError(
        "Product could not be deleted."
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-products-page">
        <h2>
          Loading products...
        </h2>
      </div>
    );
  }

  return (
    <div className="admin-products-page">

      <div className="admin-products-header">

        <div>
          <h1>
            Product Administration
          </h1>

          <p>
            Manage products, prices
            and stock.
          </p>
        </div>

        <button
          className="add-product-button"
          onClick={
            showForm &&
            !editingId
              ? resetForm
              : openAddForm
          }
        >
          {showForm &&
          !editingId
            ? "Close"
            : "+ Add Product"}
        </button>

      </div>


      {message && (
        <div className="admin-success">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {showForm && (

        <section className="product-form-panel">

          <div className="product-form-header">

            <div>
              <h2>
                {editingId
                  ? "Edit Product"
                  : "Add New Product"}
              </h2>

              <p>
                {editingId
                  ? "Update the product information below."
                  : "Enter the information for the new product."}
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={resetForm}
            >
              ×
            </button>

          </div>

          <form
            className="admin-product-form"
            onSubmit={handleSubmit}
          >

            <div className="admin-form-row">

              <div className="admin-form-field">
                <label>
                  Product Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>
                  Brand
                </label>

                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Brand"
                  required
                />
              </div>

            </div>


            <div className="admin-form-field">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Product description"
                required
              />

            </div>


            <div className="admin-form-row admin-form-row-three">

              <div className="admin-form-field">

                <label>
                  Price (€)
                </label>

                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />

              </div>

              <div className="admin-form-field">

                <label>
                  Quantity
                </label>

                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={
                    formData.quantity
                  }
                  onChange={handleChange}
                  placeholder="0"
                  required
                />

              </div>

              <div className="admin-form-field">

                <label>
                  Category
                </label>

                <input
                  name="category"
                  value={
                    formData.category
                  }
                  onChange={handleChange}
                  placeholder="Category"
                  required
                />

              </div>

            </div>


            <div className="admin-form-field">

              <label>
                Image URL
              </label>

              <input
                name="imageUrl"
                value={
                  formData.imageUrl
                }
                onChange={handleChange}
                placeholder="/images/example.jpg"
              />

            </div>


            <div className="admin-form-actions">

              <button
                type="submit"
                className="save-product-button"
              >
                {editingId
                  ? "Save Changes"
                  : "Add Product"}
              </button>

              <button
                type="button"
                className="cancel-product-button"
                onClick={resetForm}
              >
                Cancel
              </button>

            </div>

          </form>

        </section>
      )}


      <section className="admin-products-toolbar">

        <div className="admin-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search by product, brand or category..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <div className="product-count">
          {filteredProducts.length}
          {" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}
        </div>

      </section>


      {filteredProducts.length === 0 ? (

        <div className="admin-no-products">

          <h3>
            No products found
          </h3>

          <p>
            Try another search term.
          </p>

        </div>

      ) : (

        <div className="admin-products-list">

          {filteredProducts.map(
            (product) => (

              <article
                key={product.id}
                className="admin-product-row"
              >

                <div className="admin-product-main">

                  <div className="admin-product-image">

                    {product.imageUrl ? (

                      <img
                        src={
                          product.imageUrl
                        }
                        alt={
                          product.name
                        }
                      />

                    ) : (

                      <span>
                        No image
                      </span>

                    )}

                  </div>


                  <div className="admin-product-details">

                    <h3>
                      {product.name}
                    </h3>

                    <div className="admin-product-meta">

                      <span>
                        {product.brand}
                      </span>

                      <span>
                        {product.category}
                      </span>

                    </div>

                    <strong className="admin-product-price">
                      {Number(
                        product.price
                      ).toFixed(2)}
                      {" €"}
                    </strong>

                  </div>

                </div>


                <div className="admin-stock-info">

                  <span className="admin-column-label">
                    Current Stock
                  </span>

                  <strong
                    className={
                      product.quantity <= 0
                        ? "stock-empty"
                        : "stock-available"
                    }
                  >
                    {product.quantity}
                    {" units"}
                  </strong>

                  {product.quantity <= 0 && (
                    <span className="out-stock-text">
                      Out of Stock
                    </span>
                  )}

                </div>


                <div className="add-stock-section">

                  <span className="admin-column-label">
                    Receive Stock
                  </span>

                  <div className="stock-input-group">

                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Qty"
                      value={
                        stockAmounts[
                          product.id
                        ] || ""
                      }
                      onChange={(event) =>
                        handleStockChange(
                          product.id,
                          event.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        addStock(product)
                      }
                    >
                      + Add Stock
                    </button>

                  </div>

                </div>


                <div className="admin-product-actions">

                  <button
                    className="edit-product-button"
                    onClick={() =>
                      openEditForm(
                        product
                      )
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-product-button"
                    onClick={() =>
                      deleteProduct(
                        product
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            )
          )}

        </div>
      )}

    </div>
  );
}

export default AdminProductsPage;