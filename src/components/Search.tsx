import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Search: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus input when search is expanded
    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    const handleSearchClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
            setIsExpanded(false);
        }
    };

    const handleClearSearch = () => {
        setQuery('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div ref={searchRef} className={`search-container ${isExpanded ? 'expanded' : ''}`}>
            <form onSubmit={handleSubmit} className="search-form">
                {isExpanded && (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search articles..."
                            className="search-input"
                        />
                        {query && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={handleClearSearch}
                                aria-label="Clear search"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </>
                )}
                <button
                    type="button"
                    className="search-toggle-btn"
                    onClick={handleSearchClick}
                    aria-label={isExpanded ? "Close search" : "Open search"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Search;