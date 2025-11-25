import React from "react";
import "../../Styles/Manager/Home.css";

const StocksHomePage: React.FC = () => {
  return (
    <div className="stocks-homepage">
  
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Invest in Your Future with <span className="highlight">Smart Stocks and Funds</span>
            </h1>
            <p className="hero-subtitle">
              Access real-time market data, expert analysis, and powerful trading tools 
              to make informed investment decisions.
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Stocks Listed</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Market Monitoring</span>
              </div>
              <div className="stat">
                <span className="stat-number">99.9%</span>
                <span className="stat-label">Platform Uptime</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Stock Market Analytics"
              className="hero-img"
            />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Invest With Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Real-time Data</h3>
              <p>Get live stock prices, market trends, and comprehensive analytics updated every second.</p>
            </div>
           
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Expert Insights</h3>
              <p>Access research reports, analyst recommendations, and market intelligence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Execution</h3>
              <p>High-speed order execution with minimal latency for better trading outcomes.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="market-section">
        <div className="container">
          <h2 className="section-title">Market Overview</h2>
          <div className="market-cards">
            <div className="market-card nse-card">
              <h3>NSE</h3>
              <div className="market-stats">
                <span className="index-value">19,850.45</span>
                <span className="change positive">+1.25%</span>
              </div>
              <p>National Stock Exchange</p>
            </div>
            <div className="market-card bse-card">
              <h3>BSE</h3>
              <div className="market-stats">
                <span className="index-value">65,745.32</span>
                <span className="change positive">+0.89%</span>
              </div>
              <p>Bombay Stock Exchange</p>
            </div>
            <div className="market-card global-card">
              <h3>Global Markets</h3>
              <div className="market-stats">
                <span className="index-value">4,567.89</span>
                <span className="change negative">-0.45%</span>
              </div>
              <p>International Indices</p>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default StocksHomePage;