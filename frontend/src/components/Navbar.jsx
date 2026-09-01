import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import { useCart } from "../context/CartContext";

function Navbar() {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();

        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-brand-section">

                <Link to="/" className="navbar-logo">
                    NexoGear
                </Link>

                <div className="navbar-contact-info">

                    <span>
                        Phone: 0999999999
                    </span>

                    <span>
                        E-mail: online.store.bg7@gmail.com
                    </span>

                </div>

            </div>

            <div className="navbar-links">

                <Link to="/">
                    Products
                </Link>

                <Link to="/cart">
                    Cart ({totalItems})
                </Link>

                {user && (
                    <Link to="/my-orders">
                        My Orders
                    </Link>
                )}

                {user?.role === "Admin" && (
                    <>
                        <Link to="/admin/products">
                            Admin Products
                        </Link>

                        <Link to="/admin/orders">
                            Admin Orders
                        </Link>
                    </>
                )}

                {!user && (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}

                {user && (
                    <>
                        <span className="navbar-user">
                            Hello, {user.firstName}
                        </span>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;