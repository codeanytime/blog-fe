import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer bg-dark text-white py-4 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-4">
                        <h5>Blog Platform</h5>
                        <p className="text-muted">
                            A modern blog platform with enhanced React frontend and Spring Boot backend.
                        </p>
                    </div>

                    <div className="col-md-4">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li>
                                <Link to="/" className="text-decoration-none text-muted">Home</Link>
                            </li>
                            <li>
                                <Link to="/about" className="text-decoration-none text-muted">About</Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-decoration-none text-muted">Contact</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-md-4">
                        <h5>Legal</h5>
                        <ul className="list-unstyled">
                            <li>
                                <Link to="/privacy" className="text-decoration-none text-muted">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-decoration-none text-muted">Terms of Service</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr />

                <div className="row">
                    <div className="col-12 text-center">
                        <p className="text-muted mb-0">
                            &copy; {currentYear} Blog Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;