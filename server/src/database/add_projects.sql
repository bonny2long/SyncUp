-- ============================================================
-- SyncUp Data Expansion Script
-- Purpose: Add 20 more projects for each intern (80 total)
-- ============================================================

-- 1. Alex Rivers (intern_id = 1) - 20 Projects
INSERT INTO projects (title, description, owner_id, start_date, end_date, status, metadata) VALUES
('Alex Tech Blog', 'A personal technical blog built with Next.js and MDX for sharing development insights.', 1, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["React", "Next.js", "Tailwind"]}'),
('Simple E-commerce', 'A lightweight e-commerce storefront with a focus on fast checkout and clean UI.', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 'active', '{"skill_ideas": ["React", "Stripe API"]}'),
('Weather Tracker', 'Real-time weather application using OpenWeatherMap API and geolocation.', 1, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["JavaScript", "APIs"]}'),
('Expense Splitter', 'An app for friends to split bills and track shared expenses during trips.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["Node.js", "SQL"]}'),
('Recipe Vault', 'Digital cookbook with categories, search, and dietary restriction filters.', 1, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["React", "MongoDB"]}'),
('Fitness Tracker', 'Track daily workouts, sets, and reps with progress visualization charts.', 1, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["React", "D3.js"]}'),
('Local Event Map', 'Interactive map showing community events and flea markets in real-time.', 1, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'active', '{"skill_ideas": ["Google Maps API", "React"]}'),
('Markdown Previewer', 'A side-by-side markdown editor and live HTML previewer.', 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', '{"skill_ideas": ["JavaScript", "RegEx"]}'),
('Book Review Hub', 'Community platform for sharing and rating technical books.', 1, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), 'active', '{"skill_ideas": ["Node.js", "Express"]}'),
('Portfolio Generator', 'Tool to generate 1-page portfolios from a simple JSON configuration.', 1, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'active', '{"skill_ideas": ["React", "Dynamic UI"]}'),
('Code Snippet Manager', 'Cloud-based vault for storing and tagging frequently used code blocks.', 1, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), 'active', '{"skill_ideas": ["Node.js", "PostgreSQL"]}'),
('Flashcard Master', 'Spaced repetition flashcard app for learning new programming languages.', 1, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'active', '{"skill_ideas": ["React Hooks"]}'),
('URL Shortener', 'Custom URL shortening service with analytics on click rates and origins.', 1, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Redis", "Node.js"]}'),
('Typing Speed Test', 'Interactive game to measure and track typing speed improvement over time.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["JavaScript", "Timing API"]}'),
('Habit Builder', 'Visual habit tracker with streaks and daily reminder notifications.', 1, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 'active', '{"skill_ideas": ["React Native"]}'),
('Chat Room Lite', 'Real-time chat application using Socket.io and room-based isolation.', 1, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'active', '{"skill_ideas": ["WebSockets", "Node.js"]}'),
('Stock Portfolio Sim', 'Virtual stock market simulator with real-time price updates.', 1, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["Finnhub API", "React"]}'),
('Personal Finance Bot', 'Telegram bot for logging expenses via simple text commands.', 1, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["Python", "Telegram API"]}'),
('Mental Health Journal', 'Private encrypted journal with mood tracking and sentiment analysis.', 1, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["NLP", "Security"]}'),
('Music Library Organizer', 'Tool to fetch metadata and album art for local music collections.', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["Python", "Spotify API"]}');

-- 2. Maya Chen (intern_id = 2) - 20 Projects
INSERT INTO projects (title, description, owner_id, start_date, end_date, status, metadata) VALUES
('AI Image Tagger', 'Automatic image tagging service using pre-trained computer vision models.', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["Python", "PyTorch"]}'),
('Cloud Storage Hub', 'Personal cloud storage dashboard with multi-provider integration (AWS/GCP).', 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 'active', '{"skill_ideas": ["System Design", "Cloud"]}'),
('Auto-Documentation', 'Script to generate technical documentation from code comments and AST.', 2, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Node.js", "AST Parser"]}'),
('Server Health Monitor', 'Dashboard for monitoring CPU/Memory usage across multiple remote servers.', 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["Grafana", "Prometheus"]}'),
('Passwordless Auth', 'Implementation of FIDO2 WebAuthn for biometric login in web apps.', 2, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["Security", "WebAuthn"]}'),
('Database Backup CLI', 'Command line tool for automated database dumps and cloud uploading.', 2, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["Go", "Docker"]}'),
('Microservice Mesh', 'Service mesh implementation for managing communication between microservices.', 2, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'active', '{"skill_ideas": ["Kubernetes", "Istio"]}'),
('Latency Optimizer', 'Tool to analyze and optimize network latency for global API deployments.', 2, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', '{"skill_ideas": ["Networking", "Performance"]}'),
('Event-Driven Auth', 'Authentication system using Kafka for event sourcing and user state.', 2, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), 'active', '{"skill_ideas": ["Kafka", "API Design"]}'),
('Scalable Rate Limiter', 'Distributed rate limiting service using Redis and sliding window algorithm.', 2, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'active', '{"skill_ideas": ["System Design", "Redis"]}'),
('Log Aggregator', 'High-performance log parsing and indexing engine for large clusters.', 2, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), 'active', '{"skill_ideas": ["Rust", "Elasticsearch"]}'),
('Container Registry', 'Private container image registry with security scanning and versioning.', 2, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'active', '{"skill_ideas": ["Docker", "Registry API"]}'),
('Websocket Gateway', 'Unified gateway for managing thousands of persistent WebSocket connections.', 2, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Node.js", "Scalability"]}'),
('Query Cache Engine', 'Smart caching layer for heavy SQL queries with invalidated-based ttl.', 2, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["In-memory DB", "SQL"]}'),
('Identity Provider', 'Custom SAML/OIDC identity provider for single sign-on (SSO).', 2, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 'active', '{"skill_ideas": ["OIDC", "Security"]}'),
('Terraform Module Lib', 'Standardized library of Infrastructure-as-Code modules for rapid scaling.', 2, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'active', '{"skill_ideas": ["Terraform", "DevOps"]}'),
('GraphQL Federation', 'Building a federated graph to unify disparate data sources into one API.', 2, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["GraphQL", "Apollo"]}'),
('Load Balancer Sim', 'Simulator showing how round-robin vs least-connections affects throughput.', 2, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["Algos", "Simulation"]}'),
('API Versioning Tool', 'Utility for managing breaking changes in REST APIs with minimal disruption.', 2, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["API Design", "Strategy"]}'),
('Zero Trust Portal', 'An internal dashboard implemented with zero-trust networking principles.', 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["Networking", "IAM"]}');

-- 3. Jordan Park (intern_id = 3) - 20 Projects
INSERT INTO projects (title, description, owner_id, start_date, end_date, status, metadata) VALUES
('UI Component Library', 'A collection of accessible, themes React components for internal use.', 3, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["React", "Storybook"]}'),
('SaaS Landing Page', 'High-conversion landing page with custom illustrations and smooth scroll.', 3, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 'active', '{"skill_ideas": ["Framer Motion", "React"]}'),
('Design Token CLI', 'Workflow tool for syncing Figma design tokens directly into CSS variables.', 3, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Figma API", "Soft Skills"]}'),
('Accessibility Audit', 'Automated tool for scanning sites against WCAG 2.1 accessibility standards.', 3, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["A11y", "Testing"]}'),
('Interactive Resume', '3D portfolio experience showcasing projects using React Three Fiber.', 3, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["Three.js", "React"]}'),
('SVG Icon Builder', 'Browser-based editor for customizing and exporting optimized SVG icons.', 3, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["SVG", "React"]}'),
('Design System Docs', 'Comprehensive documentation site for a design language using Docusaurus.', 3, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'active', '{"skill_ideas": ["Documentation", "Communication"]}'),
('E-learning Dashboard', 'Interface for tracking student progress, course modules, and achievements.', 3, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', '{"skill_ideas": ["React", "CSS Grid"]}'),
('Micro-interaction Lab', 'Sandbox for testing and showcasing subtle UI animations and hover states.', 3, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), 'active', '{"skill_ideas": ["CSS Animations", "UX"]}'),
('User Journey Map', 'Visual tool for designers to map out user flows and pain points in an app.', 3, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'active', '{"skill_ideas": ["Canvas API", "Product"]}'),
('Color Palette Pro', 'AI-powered color palette generator based on image mood or keywords.', 3, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), 'active', '{"skill_ideas": ["Math", "Frontend"]}'),
('Skeleton Loader Kit', 'Drop-in library for creating beautiful skeleton loading states in React.', 3, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'active', '{"skill_ideas": ["React", "Performance"]}'),
('Mobile POS Interface', 'Touch-optimized point of sale interface for fast-paced retail checkouts.', 3, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Mobile Web", "UX"]}'),
('Font Pairing App', 'Interactive guide for finding the perfect typography pairings for web.', 3, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["Typography", "Design"]}'),
('Style Guide Generator', 'Tool that extracts CSS styles from any URL to generate a live style guide.', 3, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 'active', '{"skill_ideas": ["Puppeteer", "Frontend"]}'),
('Dark Mode Toggle Lib', 'Zero-config library for implementing system-aware dark mode in any app.', 3, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'active', '{"skill_ideas": ["JavaScript", "CSS"]}'),
('Onboarding Flow UI', 'Set of customizable onboarding templates designed to increase retention.', 3, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["UX Design", "React"]}'),
('Waitlist Site', 'Minimalist high-performance coming soon page with email capture.', 3, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["HTML/CSS", "Formik"]}'),
('Multi-step Form Kit', 'Engine for building complex state-managed forms with validation.', 3, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["React Hooks", "Zod"]}'),
('Grid Layout Master', 'Visual playground for learning and experimenting with CSS Grid properties.', 3, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["CSS Grid", "Educational"]}');

-- 4. Sam Foster (intern_id = 4) - 20 Projects
INSERT INTO projects (title, description, owner_id, start_date, end_date, status, metadata) VALUES
('Sales Predictor', 'Machine learning model for predicting monthly sales based on historical trends.', 4, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["Python", "Scikit-Learn"]}'),
('Churn Analyzer', 'Dashboard identifying customers at high risk of canceling their subscription.', 4, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 'active', '{"skill_ideas": ["Python", "Data Viz"]}'),
('SQL Query Builder', 'Visual interface for building complex SQL queries without writing code.', 4, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["SQL", "React"]}'),
('A/B Testing Engine', 'Platform for running and analyzing results of website split tests.', 4, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["Statistics", "Testing"]}'),
('Sentiment Tracker', 'Continuous monitoring of brand sentiment across social media platforms.', 4, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["NLP", "Python"]}'),
('Data Cleaning CLI', 'Utility for automated cleaning and deduplication of massive CSV datasets.', 4, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["Pandas", "Python"]}'),
('SEO Keywords Tool', 'Keyword research and competitor analysis tool for improving search rankings.', 4, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 'active', '{"skill_ideas": ["Scraping", "Data"]}'),
('Recommendation Engine', 'Content recommendation system based on user behavior and similarity.', 4, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 'active', '{"skill_ideas": ["Algos", "Big Data"]}'),
('Heatmap Visualizer', 'Visualizing user engagement and activity patterns across time geographical regions.', 4, DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY), 'active', '{"skill_ideas": ["D3.js", "Analytics"]}'),
('Market Trend Scanner', 'Real-time scanner for identifying emerging trends in various industries.', 4, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'active', '{"skill_ideas": ["Python", "APIs"]}'),
('Anomaly Detector', 'System for real-time detection of unusual patterns in financial transactions.', 4, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), 'active', '{"skill_ideas": ["Python", "Security"]}'),
('Data Warehouse Sync', 'Automation tool for syncing data between operational DB and warehouse.', 4, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'active', '{"skill_ideas": ["SQL", "ETL"]}'),
('Performance Reporter', 'Automated weekly PDF report generator for business metrics.', 4, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'active', '{"skill_ideas": ["Python", "Reporting"]}'),
('User Segmentation', 'Clustering users into personas based on engagement and feature usage.', 4, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["ML", "Clustering"]}'),
('Competitor Tracker', 'Tool to monitor competitor pricing and product updates automatically.', 4, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 'active', '{"skill_ideas": ["Python", "Web Scraping"]}'),
('Survey Insights', 'Advanced analyzer for open-ended survey responses using sentiment analysis.', 4, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 'active', '{"skill_ideas": ["NLP", "Data Visualization"]}'),
('Ad Spend Optimizer', 'Algorithm for maximizing ROI across different digital advertising channels.', 4, DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', '{"skill_ideas": ["Math", "Python"]}'),
('Inventory Forecaster', 'Predicting inventory needs based on seasonal demand and lead times.', 4, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'active', '{"skill_ideas": ["Forecasting", "SQL"]}'),
('Customer LTV Calc', 'Calculation model for estimating Lifetime Value of customers.', 4, DATE_SUB(NOW(), INTERVAL 11 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '{"skill_ideas": ["Data Science", "Python"]}'),
('Conversion Funnel', 'Visualizing and identifying drop-off points in multi-step conversion paths.', 4, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 'active', '{"skill_ideas": ["Frontend", "Analytics"]}');


-- 5. Membership Mapping (Owners must be members too)
-- Alex's Projects (id 5-24)
INSERT INTO project_members (project_id, user_id) VALUES
(5,1), (6,1), (7,1), (8,1), (9,1), (10,1), (11,1), (12,1), (13,1), (14,1), (15,1), (16,1), (17,1), (18,1), (19,1), (20,1), (21,1), (22,1), (23,1), (24,1);

-- Maya's Projects (id 25-44)
INSERT INTO project_members (project_id, user_id) VALUES
(25,2), (26,2), (27,2), (28,2), (29,2), (30,2), (31,2), (32,2), (33,2), (34,2), (35,2), (36,2), (37,2), (38,2), (39,2), (40,2), (41,2), (42,2), (43,2), (44,2);

-- Jordan's Projects (id 45-64)
INSERT INTO project_members (project_id, user_id) VALUES
(45,3), (46,3), (47,3), (48,3), (49,3), (50,3), (51,3), (52,3), (53,3), (54,3), (55,3), (56,3), (57,3), (58,3), (59,3), (60,3), (61,3), (62,3), (63,3), (64,3);

-- Sam's Projects (id 65-84)
INSERT INTO project_members (project_id, user_id) VALUES
(65,4), (66,4), (67,4), (68,4), (69,4), (70,4), (71,4), (72,4), (73,4), (74,4), (75,4), (76,4), (77,4), (78,4), (79,4), (80,4), (81,4), (82,4), (83,4), (84,4);
