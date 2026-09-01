import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router";

import api from "../services/api";

import {
  useCart,
} from "../context/CartContext";

import "./ProductDetailsPage.css";


function ProductDetailsPage() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadProduct();
  }, [id]);


  const loadProduct = async () => {
    try {
      const response =
        await api.get(
          `/products/${id}`
        );

      setProduct(response.data);
    } catch (error) {
      console.error(
        "Error loading product:",
        error
      );

      setError(
        "The product could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="product-details-page">

        <div className="product-details-loading">
          Loading product...
        </div>

      </div>
    );
  }


  if (error || !product) {
    return (
      <div className="product-details-page">

        <div className="product-details-error">

          <h2>
            Product not found
          </h2>

          <p>
            {error ||
              "This product is not available."}
          </p>

          <Link
            to="/"
            className="back-to-products-button"
          >
            Back to Products
          </Link>

        </div>

      </div>
    );
  }


  const isOutOfStock =
    product.quantity <= 0;


  return (
    <div className="product-details-page">


      {/* BACK LINK */}

      <Link
        to="/"
        className="product-back-link"
      >
        ← Back to Products
      </Link>


      {/* MAIN PRODUCT AREA */}

      <section className="product-details-card">


        {/* PRODUCT IMAGE */}

        <div className="product-details-image-section">

          <div className="product-details-image-wrapper">

            {product.imageUrl ? (

              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-details-image"
              />

            ) : (

              <div className="product-details-no-image">
                No image available
              </div>

            )}

          </div>

        </div>


        {/* PRODUCT INFORMATION */}

        <div className="product-details-info">

          <div className="product-details-category">
            {product.category}
          </div>


          <h1>
            {product.name}
          </h1>


          <div className="product-details-brand">

            <span>
              Brand
            </span>

            <strong>
              {product.brand}
            </strong>

          </div>


          <div className="product-details-divider" />


          <div className="product-details-price">
            {Number(
              product.price
            ).toFixed(2)} €
          </div>


          <div
            className={
              isOutOfStock
                ? "product-stock product-stock-out"
                : "product-stock product-stock-in"
            }
          >
            <span className="stock-dot" />

            {isOutOfStock
              ? "Out of Stock"
              : "In Stock"}
          </div>


          <button
            type="button"
            className="add-to-cart-button"
            disabled={isOutOfStock}
            onClick={() =>
              addToCart(product)
            }
          >
            {isOutOfStock
              ? "Out of Stock"
              : "Add to Cart"}
          </button>


          <div className="product-purchase-info">

            <div className="purchase-info-item">

              <span className="purchase-info-icon">
                ✓
              </span>

              <span>
                Secure ordering
              </span>

            </div>


            <div className="purchase-info-item">

              <span className="purchase-info-icon">
                ✓
              </span>

              <span>
                Product availability updated automatically
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* DESCRIPTION */}

      <section className="product-description-section">

        <h2>
          Product Description
        </h2>

        <div className="description-divider" />

        <p className="product-description-text">
          {product.description}
        </p>

      </section>


    </div>
  );
}


export default ProductDetailsPage;