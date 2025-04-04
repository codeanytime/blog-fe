import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Search: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement | null>(null);

    // Extract search query from URL on component mount
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryParam = searchParams.get('q');
        if (queryParam) {
            setQuery(queryParam);
            setIsExpanded(true);
        }
    }, [location.search]);

    // Handle clicks outside the search component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                if (query === '') {
                    setIsExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [query]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (query.trim()) {
            navigate(`/?q=${encodeURIComponent(query.trim())}`);
        } else {
            navigate('/');
        }
    };

    const toggleSearch = () => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            // Focus the input when expanding
            setTimeout(() => {
                const input = searchRef.current?.querySelector('input');
                if (input) input.focus();
            }, 100);
        }
    };

    const clearSearch = () => {
        setQuery('');
        navigate('/');
    };

    return (
        <div
            ref={searchRef}
            className={`search-container ${isExpanded ? 'expanded' : ''}`}
        >
            {isExpanded ? (
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search posts..."
                        aria-label="Search posts"
                        className="search-input"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="clear-search-btn"
                            aria-label="Clear search"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}

                    <button type="submit" className="search-btn" aria-label="Search">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </form>
            ) : (
                <button onClick={toggleSearch} className="search-toggle-btn" aria-label="Open search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Search;