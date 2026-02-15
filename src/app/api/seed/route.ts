import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Topic from "@/models/Topic";
import Subtopic from "@/models/Subtopic";
import User from "@/models/User";

// ─── DSA (Concept Revision) ────────────────────────────────────────────────
const DSA_SYLLABUS = [
    {
        name: "Sorting & Arrays I",
        difficulty: "Beginner",
        subtopics: ["Merge Sorting", "Quick Sorting", "Longest Consecutive Sequence in an Array", "Print the matrix in spiral manner", "Kadane's Algorithm"],
    },
    {
        name: "Arrays II",
        difficulty: "Beginner",
        subtopics: ["Pascal's Triangle III", "Rotate matrix by 90 degrees", "Two Sum", "3 Sum", "4 Sum"],
    },
    {
        name: "Array III",
        difficulty: "Intermediate",
        subtopics: ["Majority Element-I", "Majority Element-II", "Find the Repeating and missing number", "Count Inversions", "Reverse Pairs"],
    },
    {
        name: "Arrays IV & Hashing",
        difficulty: "Intermediate",
        subtopics: ["Maximum Product Subarray in an Array", "Merge two sorted arrays without extra space", "Longest subarray with sum K", "Count subarrays with given sum", "Count subarrays with given xor K"],
    },
    {
        name: "Binary Search I",
        difficulty: "Beginner",
        subtopics: ["Lower Bound", "Upper Bound", "Search in rotated sorted array-II", "Find minimum in Rotated Sorted Array", "Find the smallest divisor"],
    },
    {
        name: "Binary Search II",
        difficulty: "Intermediate",
        subtopics: ["Koko eating bananas", "Minimum days to make M bouquets", "Aggressive Cows", "Book Allocation Problem", "Median of 2 sorted arrays"],
    },
    {
        name: "Binary Search III",
        difficulty: "Advanced",
        subtopics: ["Find row with maximum 1's", "Search in a 2D matrix", "Search in 2D matrix - II", "Find peak element", "Matrix Median"],
    },
    {
        name: "Recursion I",
        difficulty: "Intermediate",
        subtopics: ["Power Set", "Check if there exists a subsequence with sum K", "Combination Sum", "Combination Sum II", "Combination Sum III"],
    },
    {
        name: "Recursion II",
        difficulty: "Advanced",
        subtopics: ["Palindrome partitioning", "N Queen", "Rat in a Maze", "M Coloring Problem", "Sudoku Solver"],
    },
    {
        name: "Linked List I",
        difficulty: "Beginner",
        subtopics: ["Segregate odd and even nodes in Linked List", "Sort a Linked List of 0's 1's and 2's", "Find the intersection point of Y LL", "Reverse a LL", "Check if LL is palindrome or not"],
    },
    {
        name: "Linked List II",
        difficulty: "Intermediate",
        subtopics: ["Find the starting point in LL", "Length of loop in LL", "Reverse LL in group of given size K", "Flattening of LL", "Sort LL"],
    },
    {
        name: "Linked List III & Bit Manipulation",
        difficulty: "Advanced",
        subtopics: ["Clone a LL with random and next pointer", "Delete the middle node in LL", "Single Number - II", "Single Number - III", "XOR of numbers in a given range"],
    },
    {
        name: "Greedy Algorithms",
        difficulty: "Intermediate",
        subtopics: ["N meetings in one room", "Non-overlapping Intervals", "Minimum number of platforms required for a railway", "Valid Paranthesis Checker", "Candy"],
    },
    {
        name: "Sliding Window I",
        difficulty: "Intermediate",
        subtopics: ["Longest Substring Without Repeating Characters", "Max Consecutive Ones III", "Longest Substring With At Most K Distinct Characters", "Longest Repeating Character Replacement", "Fruit Into Baskets"],
    },
    {
        name: "Sliding Window II",
        difficulty: "Advanced",
        subtopics: ["Maximum Points You Can Obtain from Cards", "Minimum Window Substring", "Number of Substrings Containing All Three Characters", "Binary Subarrays With Sum", "Count number of Nice subarrays"],
    },
    {
        name: "Stack and Queue I",
        difficulty: "Intermediate",
        subtopics: ["Next Greater Element - 2", "Asteroid Collision", "Sum of Subarray Minimums", "Sum of Subarray Ranges", "Remove K Digits"],
    },
    {
        name: "Stack and Queue II",
        difficulty: "Advanced",
        subtopics: ["Implement Min Stack", "Sliding Window Maximum", "Trapping Rainwater", "Largest rectangle in a histogram", "LRU Cache"],
    },
    {
        name: "Heaps",
        difficulty: "Intermediate",
        subtopics: ["Heap Sort", "K-th Largest element in an array", "Kth largest element in a stream of running integers"],
    },
    {
        name: "Binary Tree I",
        difficulty: "Beginner",
        subtopics: ["Preorder Traversal", "Inorder Traversal", "Postorder Traversal", "Level Order Traversal", "Maximum Depth in BT"],
    },
    {
        name: "Binary Tree II",
        difficulty: "Intermediate",
        subtopics: ["Diameter of Binary Tree", "Maximum path sum", "Check for symmetrical BTs", "Boundary Traversal", "Vertical Order Traversal"],
    },
    {
        name: "Binary Tree III",
        difficulty: "Intermediate",
        subtopics: ["Top View of BT", "Right/Left View of BT", "Print root to leaf path in BT", "LCA in BT", "Maximum Width of BT"],
    },
    {
        name: "Binary Tree IV",
        difficulty: "Advanced",
        subtopics: ["Minimum time taken to burn the BT from a given Node", "Count total nodes in a complete BT", "Construct a BT from Preorder and Inorder", "Construct a BT from Postorder and Inorder", "Serialize and De-serialize BT"],
    },
    {
        name: "Binary Tree V and BST I",
        difficulty: "Intermediate",
        subtopics: ["Morris Inorder Traversal", "Morris Preorder Traversal", "LCA in BST", "Kth Smallest and Largest element in BST", "Construct a BST from a preorder traversal"],
    },
    {
        name: "Binary Search Tree II",
        difficulty: "Advanced",
        subtopics: ["BST iterator", "Inorder successor and predecessor in BST", "Two sum in BST", "Correct BST with two nodes swapped", "Largest BST in Binary Tree"],
    },
    {
        name: "Graph I",
        difficulty: "Beginner",
        subtopics: ["Traversal Techniques", "Number of islands", "Flood fill algorithm", "Rotten Oranges", "Surrounded Regions"],
    },
    {
        name: "Graph II",
        difficulty: "Intermediate",
        subtopics: ["Number of distinct islands", "Bipartite graph", "Topological sort or Kahn's algorithm", "Detect a cycle in a directed graph", "Find eventual safe states"],
    },
    {
        name: "Graph III",
        difficulty: "Intermediate",
        subtopics: ["Course Schedule I", "Course Schedule II", "Alien Dictionary", "Shortest path in DAG", "Shortest path in undirected graph with unit weights"],
    },
    {
        name: "Graph IV",
        difficulty: "Advanced",
        subtopics: ["Word ladder I", "Word ladder II", "Dijkstra's algorithm", "Path with minimum effort", "Cheapest flight within K stops"],
    },
    {
        name: "Graph V",
        difficulty: "Advanced",
        subtopics: ["Number of ways to arrive at destination", "Bellman ford algorithm", "Floyd warshall algorithm", "Find the city with the smallest number of neighbors", "Disjoint Set"],
    },
    {
        name: "Graph VI",
        difficulty: "Advanced",
        subtopics: ["Find the MST weight", "Number of operations to make network connected", "Number of islands II", "Making a large island", "Kosaraju's algorithm"],
    },
    {
        name: "Graph VII and Maths",
        difficulty: "Advanced",
        subtopics: ["Bridges in graph", "Articulation point in graph", "Print all primes till N", "Prime factorisation of a Number", "Count primes in range L to R"],
    },
    {
        name: "Dynamic Programming I",
        difficulty: "Beginner",
        subtopics: ["Climbing stairs", "Frog jump with K distances", "Maximum sum of non adjacent elements", "House robber", "Ninja's training"],
    },
    {
        name: "Dynamic Programming II",
        difficulty: "Intermediate",
        subtopics: ["Grid unique paths", "Unique paths II", "Minimum Falling Path Sum", "Triangle", "Cherry pickup II"],
    },
    {
        name: "Dynamic Programming III",
        difficulty: "Intermediate",
        subtopics: ["Best time to buy and sell stock", "Best time to buy and sell stock II", "Best time to buy and sell stock III", "Best time to buy and sell stock IV", "Best time to buy and sell stock with transaction fees"],
    },
    {
        name: "Dynamic Programming IV",
        difficulty: "Intermediate",
        subtopics: ["Partition a set into two subsets with minimum absolute sum difference", "Count subsets with sum K", "Count partitions with given difference", "0 and 1 Knapsack", "Target sum"],
    },
    {
        name: "Dynamic Programming V",
        difficulty: "Intermediate",
        subtopics: ["Coin change II", "Unbounded knapsack", "Rod cutting problem", "Minimum coins", "Longest common subsequence"],
    },
    {
        name: "Dynamic Programming VI",
        difficulty: "Advanced",
        subtopics: ["Longest common substring", "Minimum insertions or deletions to convert string A to B", "Shortest common supersequence", "Distinct subsequences", "Edit distance"],
    },
    {
        name: "Dynamic Programming VII",
        difficulty: "Advanced",
        subtopics: ["Wildcard matching", "Longest Increasing Subsequence", "Longest String Chain", "Longest Bitonic Subsequence", "Number of Longest Increasing Subsequences", "Print Longest Increasing Subsequence"],
    },
    {
        name: "Dynamic Programming VIII",
        difficulty: "Advanced",
        subtopics: ["Matrix chain multiplication", "Burst balloons", "Maximum Rectangles", "Palindrome partitioning II"],
    },
];

// ─── SQL + DE Foundations ───────────────────────────────────────────────────
const SQL_SYLLABUS = [
    // 1. Getting Started
    {
        name: "Foundational Overview of SQL",
        difficulty: "Beginner",
        subtopics: ["Introduction to SQL", "Quiz: Introduction to SQL"],
    },
    {
        name: "Theoretical Breakdown of Databases",
        difficulty: "Beginner",
        subtopics: ["Why SQL Exists", "How Databases Work", "Database Systems"],
    },
    {
        name: "SQL Setup Guide",
        difficulty: "Beginner",
        subtopics: ["Installation and Tools"],
    },
    // 2. Core Foundations
    {
        name: "Database & Table Basics",
        difficulty: "Beginner",
        subtopics: ["SQL Basics and Commands", "Working with Databases in SQL", "SQL Data Types", "Creating and Managing Tables in SQL", "Primary Key", "Foreign Key", "Constraints in SQL", "NULL vs 0 vs Empty String", "DDL vs DML", "Query Lifecycle", "Indexing in SQL"],
    },
    {
        name: "Database Design Foundations",
        difficulty: "Beginner",
        subtopics: ["Normalization", "Entities, Relationships, Cardinality", "Constraints", "Choosing Keys", "Modeling Tables"],
    },
    // 3. Querying Essentials
    {
        name: "Data Selection Protocols",
        difficulty: "Beginner",
        subtopics: ["SELECT and FROM", "WHERE", "Comparison Operators", "Logical Operators", "ORDER BY and LIMIT", "DISTINCT and AS (Aliases)"],
    },
    {
        name: "Query Fundamentals Problems",
        difficulty: "Beginner",
        subtopics: ["Large Nations", "Profitable Customers in 2021", "Odd Non-Boring Movies"],
    },
    {
        name: "Filtering Essentials",
        difficulty: "Beginner",
        subtopics: ["IS NULL vs. IS NOT NULL, IN, and NOT IN", "BETWEEN and NOT BETWEEN", "LIKE and NOT LIKE"],
    },
    {
        name: "Filtering Problems",
        difficulty: "Beginner",
        subtopics: ["Filter Records Excluding a Specific Pattern", "Find Records Excluding a Given Set of Values", "Find Salaries Outside the Expected Range", "Non-Referred Customers"],
    },
    // 4. Aggregation and Analysis
    {
        name: "Aggregation & GROUP BY",
        difficulty: "Intermediate",
        subtopics: ["Fundamentals of GROUP BY", "Basic Aggregate Functions (MIN, MAX, SUM, AVG)", "COUNT Functions", "HAVING Clause"],
    },
    {
        name: "Summarization Problems Level 1",
        difficulty: "Intermediate",
        subtopics: ["First Login Analysis", "Employee Work Time Summary", "Unique Subjects per Teacher", "User Follower Count", "CRM Automotive Sales Analysis", "Highest Order Placing Customer"],
    },
    {
        name: "Summarization Problems Level 2",
        difficulty: "Intermediate",
        subtopics: ["Frequent Actor-Director Duos", "Large Classes", "Email Duplicates"],
    },
    // 5. Functions (Math and Conditional)
    {
        name: "Numeric and NULL Functions",
        difficulty: "Intermediate",
        subtopics: ["ROUND() and ABS()", "GREATEST(), LEAST(), and IFNULL()", "NULL Handling: IS NULL, IS NOT NULL, IFNULL(), COALESCE()"],
    },
    {
        name: "Numeric Functions Problems",
        difficulty: "Intermediate",
        subtopics: ["Call Count Between Pairs"],
    },
    {
        name: "CASE Conditional Logic",
        difficulty: "Intermediate",
        subtopics: ["CASE Basics", "CASE Practical Examples", "Advanced CASE Usage"],
    },
    {
        name: "CASE Logic Problems",
        difficulty: "Intermediate",
        subtopics: ["Valid Triangle Check", "Instant Food Delivery", "Special Bonus Calculation", "Node Classification", "Apples vs Oranges", "Query Quality Analysis"],
    },
    {
        name: "String Functions",
        difficulty: "Intermediate",
        subtopics: ["CONCAT() vs. CONCAT_WS()", "LOWER() / UPPER()", "TRIM() / LTRIM() / RTRIM()", "LENGTH() vs CHAR_LENGTH()", "LEFT() / RIGHT() / SUBSTRING()", "LOCATE() / INSTR()", "REPLACE()", "Pattern Matching with LIKE"],
    },
    {
        name: "String Functions Problems",
        difficulty: "Intermediate",
        subtopics: ["Exceeding Tweet Length"],
    },
    // 6. Data Modification and Schema Evolution
    {
        name: "Data Modification Commands",
        difficulty: "Intermediate",
        subtopics: ["INSERT", "UPSERT", "UPDATE", "DELETE", "ALTER", "TRUNCATE", "DELETE vs. TRUNCATE vs. DROP"],
    },
    {
        name: "Data Modification Problems",
        difficulty: "Intermediate",
        subtopics: ["System Settings", "Employee Salary"],
    },
    // 7. Set Operations
    {
        name: "Set Operations Concepts",
        difficulty: "Intermediate",
        subtopics: ["UNION", "UNION ALL", "Difference Between UNION and UNION ALL", "Intersection"],
    },
    {
        name: "Set Operations Problems",
        difficulty: "Intermediate",
        subtopics: ["Combine Active and Archived Users", "Merge Recent Orders from Multiple Sources", "Combine Sales Records Without Deduplication", "Reshape Products Data"],
    },
    // 8. SQL Joins
    {
        name: "Joins Concepts",
        difficulty: "Intermediate",
        subtopics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "IMPLICIT JOIN", "SELF JOIN", "NATURAL JOIN", "ON vs. WHERE"],
    },
    {
        name: "Joins Problems Level 1",
        difficulty: "Intermediate",
        subtopics: ["Employees and Their Departments", "Customer Orders Overview", "Employees With Confirmed Salary Records", "Generate All Possible User-Category Pairs", "Employees With or Without Salary Records", "Match Employees With Their Salaries", "Employees Earning More Than Their Manager", "Students Enrolled in Courses"],
    },
    {
        name: "Joins Problems Level 2",
        difficulty: "Advanced",
        subtopics: ["Sales Analysis", "Minimum Distance Between Points", "Suspended Accounts", "Find Team Size for Each Employee", "Average Experience by Project", "Warehouse Stock Manager"],
    },
    {
        name: "Joins Problems Level 3",
        difficulty: "Advanced",
        subtopics: ["Table Join Operation", "Inactive Customers", "Students Enrolled in Non-Existent Departments", "Low Bonus Employees", "Available Seat Streaks", "Visitors Without Transactions", "A & B Buyers Without C", "Product Selling Price Report", "Updated Bank Balances", "Most Frequent Travellers", "Suggested Pages"],
    },
    // 9. Subqueries
    {
        name: "Subqueries Concepts",
        difficulty: "Intermediate",
        subtopics: ["Introduction to Subqueries (IN)", "EXISTS and NOT EXISTS", "Correlated Subqueries"],
    },
    {
        name: "Subqueries Problems Level 2",
        difficulty: "Advanced",
        subtopics: ["Employees with the Highest Salary in Each Department", "Find the Most Recent Order for Each Product", "Find Transactions with Maximum Amount Per Day", "Incomplete Employee Records", "Find Quiet Students in All Exams", "Top Grade per Student"],
    },
    {
        name: "Subqueries Problems Level 3",
        difficulty: "Advanced",
        subtopics: ["Swap Consecutive Seats", "Safe Investment Countries", "Tennis Grand Slam Winners", "Football Team Scores", "Order Count per Customer", "Boolean Expression Evaluator", "Immediate First Orders Percentage", "Find All Employees Reporting to the Head of the Company", "Orphan Employees"],
    },
    // 10. Advanced SQL Concepts
    {
        name: "CTEs & Temporary Tables",
        difficulty: "Intermediate",
        subtopics: ["WITH and AS (CTEs)", "Non-Recursive CTEs", "Recursive CTEs for Hierarchies", "Most Frequently Ordered Product(s) for Each Customer", "Find Missing Subtasks for Each Task"],
    },
    {
        name: "Date & Time Functions",
        difficulty: "Intermediate",
        subtopics: ["Date Part Extraction (YEAR, MONTH, DAY, HOUR)", "Filtering with Date Ranges", "Finding First and Latest Events", "Calculating Date Differences (DATEDIFF, TIMESTAMPDIFF)", "Current Date and Time"],
    },
    {
        name: "Date Functions Problems",
        difficulty: "Intermediate",
        subtopics: ["Latest 2020 Login", "Kid-Friendly Movies in Last Month", "Warmer Days", "Restaurant Payment Trends", "Inactive Sellers"],
    },
    {
        name: "Window Functions",
        difficulty: "Advanced",
        subtopics: ["Everything about Window Functions", "Dedup + Latest-State Patterns", "Sessionization + Funnel + Retention", "Gaps and Islands + Streaks", "Data Shaping Patterns"],
    },
    {
        name: "JSON & Upsert Power Features",
        difficulty: "Advanced",
        subtopics: ["JSON in SQL"],
    },
    {
        name: "Permissions & Transactions I",
        difficulty: "Advanced",
        subtopics: ["Privileges and Roles", "GRANTS", "GRANT ALL and WITH GRANT OPTION", "ALTER USER", "REVOKE"],
    },
    {
        name: "Permissions & Transactions II",
        difficulty: "Advanced",
        subtopics: ["Database Connections and Connection Pooling", "Transactions and Transaction Control", "Savepoints and Transaction Visibility", "Locking, Isolation, and Concurrency", "InnoDB Internals, Logging, and Crash Safety"],
    },
    // 11. Data Warehousing, Modeling, and ETL
    {
        name: "Data Warehousing & Analytics Modeling",
        difficulty: "Advanced",
        subtopics: ["Star Schema + Metric Correctness", "Slowly Changing Dimensions"],
    },
    {
        name: "ETL & Incremental Loads",
        difficulty: "Advanced",
        subtopics: ["Staging to Curated Pipelines", "Incremental Loads + Watermarks", "UPSERT + Merge Patterns", "Data Quality + Reconciliation"],
    },
    // 12. Performance, Debugging, and Projects
    {
        name: "Performance & Debugging",
        difficulty: "Advanced",
        subtopics: ["Stored Procedure", "EXPLAIN Basics", "Query Performance", "Debugging Toolkit"],
    },
    {
        name: "SQL Projects",
        difficulty: "Advanced",
        subtopics: ["E-commerce Analytics Warehouse", "Product Clickstream → Sessionization + Funnel + Retention", "Fintech Wallet / Ledger System", "Data Pipeline Capstone"],
    },
    // 13. Storage, Keys & Query Performance (Deep Dive)
    {
        name: "Storage, Keys & Query Performance",
        difficulty: "Advanced",
        subtopics: ["Where Your Rows Actually Live", "Why wrong PK Can Quietly Destroy You", "Index Strategy at Scale", "Query Plans Like a Pro"],
    },
    // 14. Scaling and Production
    {
        name: "Scaling & Production Operations",
        difficulty: "Advanced",
        subtopics: ["Scaling Reads", "Sharding and Distributed IDs", "Zero-Downtime Schema Changes", "Partitioning & Data Lifecycle"],
    },
    // 15. Case Studies
    {
        name: "Industry Case Studies",
        difficulty: "Advanced",
        subtopics: ["Uber: Incremental Data Lake / Lakehouse + Upserts", "GitHub: Zero-downtime MySQL schema changes", "Instagram: Sharding IDs", "Pinterest: Sharding MySQL fleet", "LinkedIn Pinot: Scaling Reads", "DoorDash: Scaling data platform"],
    },
];

// ─── Low Level Design (LLD) ─────────────────────────────────────────────────
const LLD_SYLLABUS = [
    // 1. Introduction to LLD
    {
        name: "Introduction to LLD",
        difficulty: "Beginner",
        subtopics: ["Introduction to Low Level Design", "Software Design Principles"],
    },
    // 2. SOLID Principles
    {
        name: "SOLID Principles",
        difficulty: "Beginner",
        subtopics: ["Single Responsibility Principle (SRP)", "Open Closed Principle (OCP)", "Liskov Substitution Principle (LSP)", "Interface Segregation Principle (ISP)", "Dependency Inversion Principle (DIP)"],
    },
    // 3. UML
    {
        name: "UML",
        difficulty: "Beginner",
        subtopics: ["Unified Modeling Language (UML)", "Class UML diagrams"],
    },
    // 4. Design Patterns
    {
        name: "Creational Design Patterns",
        difficulty: "Intermediate",
        subtopics: ["Introduction to Design Patterns", "Singleton Design Pattern", "Factory Method", "Builder Pattern", "Abstract Factory", "Prototype Pattern"],
    },
    {
        name: "Structural Design Patterns",
        difficulty: "Intermediate",
        subtopics: ["Adapter Pattern", "Decorator Pattern", "Facade Pattern", "Composite Pattern", "Proxy Pattern", "Bridge Pattern", "Flyweight Pattern"],
    },
    {
        name: "Behavioural Design Patterns",
        difficulty: "Intermediate",
        subtopics: ["Iterator Pattern", "Observer Pattern", "Strategy Pattern", "Command Pattern", "Template Method", "State Pattern", "Chain of Responsibility", "Visitor Pattern", "Mediator Pattern", "Memento Pattern"],
    },
    // 5. Multithreading and Concurrency
    {
        name: "Multithreading & Concurrency",
        difficulty: "Advanced",
        subtopics: ["Multithreading and Concurrency", "Creating and Managing Threads", "Thread Pools and Executors", "Thread Safety and Synchronization", "Locks and Synchronization Mechanism", "Deadlock and Prevention Techniques", "Producer Consumer Problem"],
    },
    // 6. Dependency Injection
    {
        name: "Dependency Injection",
        difficulty: "Intermediate",
        subtopics: ["Dependency Injection"],
    },
    // 7. Exceptions and Error Handling
    {
        name: "Exceptions & Error Handling",
        difficulty: "Intermediate",
        subtopics: ["Exception Handling (LLD)", "Building Resilient Systems"],
    },
    // 8. Best Practices in LLD
    {
        name: "Best Practices in LLD",
        difficulty: "Intermediate",
        subtopics: ["All About APIs", "Database Design and Integration", "How to Approach a LLD Interview"],
    },
    // 9. Interview Problems Part-1
    {
        name: "Interview Problems Part-1",
        difficulty: "Advanced",
        subtopics: ["Parking Lot (Design)", "Parking Lot (Code)", "Logging Framework (Design)", "Logging Framework (Code)", "Traffic Signal System (Design)", "Traffic Signal System (Code)", "Vending Machine Design", "Vending Machine Code", "Task Management System Design", "Task Management System Code"],
    },
    // 9. Interview Problems Part-2
    {
        name: "Interview Problems Part-2",
        difficulty: "Advanced",
        subtopics: ["PubMed System Design", "PubMed System Code", "ATM Machine Design", "ATM Machine Code", "Hotel Management System Design", "Hotel Management System Code"],
    },
    // 9. Interview Problems Part-3
    {
        name: "Interview Problems Part-3",
        difficulty: "Advanced",
        subtopics: ["Elevator System Design", "Elevator System Code", "Digital Wallet Design", "Types of Locking Mechanism", "Digital Wallet Code", "Ride Booking App Design", "Ride Booking App Code", "Music Streaming Platform Design", "Streaming Protocols", "Music Streaming Platform Code"],
    },
];

// ─── Object-Oriented Programming (OOPS) ─────────────────────────────────────
const OOP_SYLLABUS = [
    // 1. Introduction to OOPS
    {
        name: "Introduction to OOPS",
        difficulty: "Beginner",
        subtopics: ["Java Basics", "What is OOPS", "Classes and Objects", "Quiz: Classes and Objects", "Practice: Classes and Objects", "Attributes and Methods", "Quiz: Attributes and Methods", "Practice: Attributes and Methods", "Constructors", "Quiz: Constructors", "Practice: Constructors"],
    },
    // 2. Core Principles of OOPS
    {
        name: "Core Principles of OOPS",
        difficulty: "Beginner",
        subtopics: ["Encapsulation", "Quiz: Encapsulation", "Practice: Encapsulation", "Access Modifiers", "Quiz: Access Modifiers", "Practice: Access Modifiers", "Inheritance", "Quiz: Inheritance", "Practice: Inheritance", "Polymorphism", "Quiz: Polymorphism", "Practice: Polymorphism"],
    },
    // 3. Advanced OOPS Features
    {
        name: "Advanced OOPS Features",
        difficulty: "Intermediate",
        subtopics: ["Abstraction", "Quiz: Abstraction", "Practice: Abstraction", "Interfaces", "Quiz: Interfaces", "Practice: Interfaces", "Static Keyword", "Quiz: Static Keyword", "Practice: Static Keyword", "Inner Classes", "Quiz: Inner Classes", "Practice: Inner Classes"],
    },
    // 4. Relationships and Object Behaviour
    {
        name: "Relationships & Object Behaviour",
        difficulty: "Intermediate",
        subtopics: ["Association, Aggregation, and Composition", "Quiz: Association, Aggregation, and Composition", "Practice: Composition", "Object Cloning", "Quiz: Object Cloning", "Practice: Object Cloning"],
    },
    // 5. Advanced Programming in OOPS
    {
        name: "Advanced Programming in OOPS",
        difficulty: "Advanced",
        subtopics: ["Exception Handling", "Quiz: Exception Handling", "Generics", "Quiz: Generics", "File Handling", "Quiz: File Handling"],
    },
    // 6. OOP Design and Lifecycle Management
    {
        name: "OOP Design & Lifecycle",
        difficulty: "Advanced",
        subtopics: ["Design Principles", "Quiz: Design Principles", "Object Lifecycle", "Quiz: Object Lifecycle"],
    },
];

// ─── Computer Networks ──────────────────────────────────────────────────────
const CN_SYLLABUS = [
    {
        name: "Introduction to Computer Networks",
        difficulty: "Beginner",
        subtopics: ["Introduction to Computer Networks", "Types of Networks and Interconnected Networks", "Network and Logical Topologies", "Quiz: Introduction to Computer Networks"],
    },
    {
        name: "Networking Models",
        difficulty: "Beginner",
        subtopics: ["OSI Model and Layers", "TCP/IP Model and Its Layers + Comparison", "Quiz: Networking Models"],
    },
    {
        name: "Networking Fundamentals & Basics",
        difficulty: "Beginner",
        subtopics: ["Network Cabling and Connectors", "Network Devices", "Ethernet Frame Structure + ARP + NAC", "Quiz: Networking Fundamentals and Basics"],
    },
    {
        name: "Network Protocols & Communication",
        difficulty: "Intermediate",
        subtopics: ["Network Protocols", "Application Layer Protocols (HTTP, FTP, SMTP, SNMP)", "Layer Functions, Protocols and Connectionless vs Connection-Oriented Protocols", "Quiz: Network Protocols and Communication"],
    },
    {
        name: "IP Addressing & Subnetting",
        difficulty: "Intermediate",
        subtopics: ["IP Addressing (IPv4 and IPv6)", "Subnetting, Supernetting and Classful vs Classless Addressing", "Network Address Translation (NAT), DHCP, DNS", "Quiz: IP Addressing and Subnetting"],
    },
    {
        name: "Routing & Switching",
        difficulty: "Intermediate",
        subtopics: ["Routing Algorithms", "Distance Vector and Link State Routing Protocols", "Border Gateway Protocol (BGP), Interior Gateway Protocols (IGRP, EIGRP, OSPF)", "Switching Techniques", "Quiz: Routing and Switching"],
    },
    {
        name: "Network Technologies & Standards",
        difficulty: "Intermediate",
        subtopics: ["Ethernet Standards (IEEE 802.3) and Wireless Networking (IEEE 802.11)", "Ethernet Switching and VLANs", "Data Link Protocols and Spanning Tree Protocol", "Quiz: Network Technologies and Standards"],
    },
    {
        name: "Network Security",
        difficulty: "Advanced",
        subtopics: ["Network Security Fundamentals", "Firewall and their Types", "Intrusion Detection and Prevention Systems", "Virtual Private Networks (VPNs) and Public Key Infrastructure (PKI)", "Cryptography Basics (Symmetric and Asymmetric Encryption)", "Transport Layer Security (TLS) and SSL", "Network Layer and Application Layer Firewalls", "Quiz: Network Security"],
    },
    {
        name: "Network Management & Monitoring",
        difficulty: "Advanced",
        subtopics: ["Traffic Management Techniques", "Quality of Service (QoS), Bandwidth and Latency, Network Congestion and Control Mechanisms", "Network Performance Metrics", "Network Troubleshooting Techniques", "Network Monitoring and Management", "Network Protocol Analysis Tools (Wireshark, tcpdump)", "Quiz: Network Management and Monitoring"],
    },
    {
        name: "Advanced Networking Concepts",
        difficulty: "Advanced",
        subtopics: ["Client-Server Vs Peer-to-Peer Architectures", "Network Design Principles and Considerations", "Load Balancing Techniques, Content Delivery Networks (CDNs)", "Network Virtualization", "Software-Defined Networking (SDN)", "Network Reliability and Fault Tolerance", "Quiz: Advanced Networking Concepts"],
    },
];

// ─── Database Management (DBMS) ─────────────────────────────────────────────
const DBMS_SYLLABUS = [
    {
        name: "Introduction to DBMS",
        difficulty: "Beginner",
        subtopics: ["Data, Information & Database", "Types of Databases", "Database Management System (DBMS)", "Need, Advantages and Disadvantages of DBMS", "Data Abstraction in DBMS", "DBMS Architecture", "Database Users and Interactions", "Quiz: Introduction to DBMS"],
    },
    {
        name: "Data Models and ER Models",
        difficulty: "Beginner",
        subtopics: ["DBMS Interfaces", "Data Models and Their Types", "ER Model and its Components", "Types of Relationships in DBMS", "Extended ER Features", "Types of Inheritance", "Create ER Diagram", "Relationships in ER Diagram", "Relational Models", "Quiz: Data Models and ER Models"],
    },
    {
        name: "Relational Model & Normalization",
        difficulty: "Intermediate",
        subtopics: ["Intension and Extension", "Keys in DBMS", "Functional Dependency", "Armstrong's Axioms", "Inference Rules", "Closure in Functional Dependencies", "Data Normalization", "Denormalisation", "Quiz: Relational Model and Normalization"],
    },
    {
        name: "SQL & Query Optimization",
        difficulty: "Intermediate",
        subtopics: ["Database Languages", "SQL Operators", "Aggregates in SQL", "SQL Clauses", "SQL Joins", "Advanced SQL Joins", "Unions in SQL", "Views in SQL", "Advanced Views in SQL", "Indexed Views (Materialised Views)", "SQL Subqueries", "Types of SQL Subqueries", "Query Processing", "Query Optimization", "Advanced Query Optimization", "Quiz: SQL and Query Optimization"],
    },
    {
        name: "Transactions & Concurrency Control",
        difficulty: "Advanced",
        subtopics: ["Database Transactions", "ACID Properties", "CAP Theorem", "Scheduling in Databases", "Serialization in Databases", "Serialization Graphs in Databases", "Concurrency Control in Databases", "Locking Protocol (Shared Locks, Exclusive Locks)", "Timestamp Ordering Protocols in DBMS", "Thomas' Rules", "Concurrency Control in Distributed Databases", "Managing Transaction Consistency and Concurrency", "Isolation Levels", "Deadlock in DBMS", "Starvation in DBMS", "Quiz: Transactions and Concurrency"],
    },
    {
        name: "NoSQL Databases",
        difficulty: "Intermediate",
        subtopics: ["NoSQL Databases", "BASE Properties", "NoSQL Languages", "Graph Databases", "In-Memory Databases", "Partitioning in Databases", "Types of Partitioning", "Sharding in DBMS", "Quiz: NoSQL Databases"],
    },
    {
        name: "Distributed Database Systems",
        difficulty: "Advanced",
        subtopics: ["Database Lifecycle", "Distributed Database Systems", "Architecture of Distributed Database Systems", "Data Distribution Methods", "Fault Tolerance in Distributed Databases", "Load Balancing in Distributed Databases", "Data Replication Techniques", "Quiz: Distributed Database Systems"],
    },
    {
        name: "Database Indexing & Performance",
        difficulty: "Intermediate",
        subtopics: ["Database Indexing", "Types of Database Indexing", "Indexing Techniques (B-Trees and B+ Trees)", "Performance Tuning", "Quiz: Indexing and Performance Tuning"],
    },
    {
        name: "Database Monitoring & Caching",
        difficulty: "Intermediate",
        subtopics: ["Database Monitoring", "Performance Tuning", "Database Caching", "Database Caching Strategies", "Quiz: Database Monitoring and Caching"],
    },
    {
        name: "Security & Access Control",
        difficulty: "Advanced",
        subtopics: ["Database Security", "Data Encryption in DBMS", "Encryption Techniques in DBMS", "Data Masking Techniques", "RBAC (Role-Based Access Control)", "RBAC Models", "Quiz: Security and Access Control"],
    },
    {
        name: "Scalability & Big Data",
        difficulty: "Advanced",
        subtopics: ["Database Scaling", "Big Data and DBMS", "DBaaS (Database as a Service)", "Quiz: Scalability and Big Data"],
    },
    {
        name: "Data Warehousing & Migration",
        difficulty: "Advanced",
        subtopics: ["Database Migration", "Data Warehousing", "Event-Driven Architecture", "Quiz: Data Warehousing and Migration"],
    },
    {
        name: "Triggers & Procedural Features",
        difficulty: "Intermediate",
        subtopics: ["Triggers in Databases", "Stored Procedures in Databases", "Quiz: Triggers and Procedural Features"],
    },
    {
        name: "Recovery & Backup",
        difficulty: "Advanced",
        subtopics: ["Database Recovery Management", "Database Backups", "Quiz: Recovery and Backup"],
    },
];

// ─── Operating Systems (OS) ─────────────────────────────────────────────────
const OS_SYLLABUS = [
    // 1. Introduction to Operating Systems
    {
        name: "Introduction to Operating Systems",
        difficulty: "Beginner",
        subtopics: ["What is an Operating System", "Why Operating Systems Exist", "Role and Responsibilities of OS", "Evolution of Operating Systems", "Types of Operating Systems (Batch, Time-Sharing, Distributed, Real-Time, Embedded, Mobile)", "Computer System Architecture", "Hardware and Software Components", "System Calls and System Call Interface", "Modes of Operation (User Mode vs Kernel Mode)", "Context Switching", "Quiz: Introduction to Operating Systems"],
    },
    // 2. Process and Thread Management
    {
        name: "Process Fundamentals",
        difficulty: "Beginner",
        subtopics: ["What is a Process", "Process vs Program", "Process State Diagram", "Process States (New, Ready, Running, Waiting, Terminated)", "Process Control Block (PCB)", "Process Creation and Termination", "Parent and Child Processes", "Zombie and Orphan Processes", "Process Address Space and Memory Layout", "Stack, Heap, Data, Text Segments", "Quiz: Process Fundamentals"],
    },
    {
        name: "Thread Management",
        difficulty: "Intermediate",
        subtopics: ["What is a Thread", "Single-threaded vs Multi-threaded Processes", "User-Level Threads vs Kernel-Level Threads", "Advantages and Disadvantages of Threads", "Thread vs Process Comparison", "Thread Libraries and APIs", "Creating and Destroying Threads", "Thread States", "Thread Synchronization Basics", "Thread Scheduling", "Quiz: Thread Management"],
    },
    // 3. CPU Scheduling
    {
        name: "CPU Scheduling Algorithms",
        difficulty: "Intermediate",
        subtopics: ["Why CPU Scheduling", "CPU-Bound vs I/O-Bound Processes", "Preemptive vs Non-Preemptive Scheduling", "Scheduling Criteria (CPU Utilization, Throughput, Turnaround, Waiting, Response Time)", "First Come First Serve (FCFS) and Convoy Effect", "Shortest Job First (SJF) — Preemptive and Non-Preemptive", "Priority Scheduling and Aging", "Round Robin Scheduling and Time Quantum", "Multilevel Queue Scheduling", "Multilevel Feedback Queue Scheduling", "Quiz: Scheduling Algorithms"],
    },
    {
        name: "Advanced Scheduling",
        difficulty: "Advanced",
        subtopics: ["Real-Time Scheduling (Hard vs Soft)", "Rate Monotonic Scheduling", "Earliest Deadline First (EDF)", "Load Balancing in Multi-core Systems", "Processor Affinity", "SMT (Simultaneous Multi-Threading)", "Gantt Chart Construction", "Waiting Time and Turnaround Time Calculations", "Quiz: Advanced Scheduling"],
    },
    // 4. Process Synchronization
    {
        name: "Synchronization & Mutual Exclusion",
        difficulty: "Intermediate",
        subtopics: ["Race Condition", "Critical Section Problem", "Mutual Exclusion Requirements", "Peterson's Algorithm", "Bakery Algorithm", "Dekker's Algorithm", "Test-and-Set (TAS)", "Compare-and-Swap (CAS)", "Memory Barriers", "Atomic Operations", "Quiz: Synchronization Basics"],
    },
    {
        name: "Semaphores, Monitors & Locks",
        difficulty: "Advanced",
        subtopics: ["Binary Semaphores", "Counting Semaphores", "Semaphore Operations (Wait, Signal)", "Producer-Consumer Problem", "Dining Philosophers Problem", "Readers-Writers Problem", "Sleeping Barber Problem", "Monitors and Condition Variables", "Mutex Locks", "Spinlocks vs Blocking Locks", "RwLock (Read-Write Locks)", "Quiz: Semaphores and Monitors"],
    },
    // 5. Deadlock
    {
        name: "Deadlock",
        difficulty: "Intermediate",
        subtopics: ["What is Deadlock", "Necessary Conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait)", "Deadlock vs Starvation vs Livelock", "Deadlock Prevention Strategies", "Deadlock Avoidance — Banker's Algorithm", "Resource Allocation Graph", "Safe and Unsafe States", "Deadlock Detection Algorithm", "Recovery from Deadlock", "Deadlock Ignorance (Ostrich Algorithm)", "Deadlock in Distributed Systems", "Quiz: Deadlock"],
    },
    // 6. Memory Management
    {
        name: "Memory Management Basics",
        difficulty: "Intermediate",
        subtopics: ["Address Space", "Logical vs Physical Address", "Memory Protection", "Swapping", "Contiguous Memory Allocation (Fixed and Variable Partitions)", "Fragmentation (Internal and External)", "Compaction", "Non-Contiguous Allocation", "Quiz: Memory Basics"],
    },
    {
        name: "Paging & Segmentation",
        difficulty: "Advanced",
        subtopics: ["Page Frame and Page Table", "Address Translation", "Translation Lookaside Buffer (TLB)", "Single-Level Page Table", "Multi-Level Page Table", "Hashed Page Table", "Inverted Page Table", "Protection and Validity Bits", "Shared Pages", "Segment Table", "Address Translation in Segmentation", "Paging vs Segmentation", "Combining Paging and Segmentation", "Quiz: Paging"],
    },
    {
        name: "Virtual Memory",
        difficulty: "Advanced",
        subtopics: ["Demand Paging", "Page Faults", "Effective Access Time Calculation", "Copy-on-Write", "Optimal Page Replacement", "FIFO", "LRU (Least Recently Used)", "LRU Approximation", "Counting-Based Algorithms", "Page Buffering Algorithm", "Static vs Dynamic Allocation", "Local vs Global Allocation", "Thrashing — Cause and Prevention", "Working Set Model", "Page Fault Frequency", "Memory Mapped Files", "Quiz: Virtual Memory"],
    },
    // 7. File System
    {
        name: "File System",
        difficulty: "Intermediate",
        subtopics: ["File Concept and Attributes", "File Types and Extensions", "Access Methods (Sequential, Direct, Indexed)", "Directory Structures (Single-Level, Two-Level, Tree, Acyclic-Graph)", "Path Names (Absolute and Relative)", "Contiguous Allocation", "Linked Allocation and FAT", "Indexed Allocation and Multi-level Indexing", "Free Space Management (Bit Vector, Linked List, Grouping, Counting)", "File Permissions (Read, Write, Execute)", "Access Control Lists (ACLs)", "Inode Structure", "Journaling File Systems", "Quiz: File System"],
    },
    // 8. I/O Systems and Disk Management
    {
        name: "I/O Systems & Disk Management",
        difficulty: "Advanced",
        subtopics: ["I/O Devices and Device Controllers", "Direct Memory Access (DMA)", "Interrupts and Interrupt Handling", "Polling vs Interrupt-Driven I/O", "Disk Structure (Cylinders, Tracks, Sectors)", "Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK", "RAID Levels (0, 1, 5, 6, Nested)", "Solid State Drives (SSDs) and Flash Memory", "Wear Leveling and TRIM Command", "Quiz: I/O and Disk"],
    },
    // 9. Advanced Concurrency & IPC
    {
        name: "IPC & Advanced Concurrency",
        difficulty: "Advanced",
        subtopics: ["Monitor Concept and Condition Variables", "Direct vs Indirect Communication", "Synchronous vs Asynchronous Communication", "Message Queues", "Pipes and FIFOs", "Sockets", "Remote Procedure Calls (RPC)", "Atomicity and Visibility", "Happens-Before Relationships", "False Sharing", "Lock Contention", "Priority Inversion", "Quiz: IPC"],
    },
    // 10. Protection and Security
    {
        name: "Protection & Security",
        difficulty: "Advanced",
        subtopics: ["Principle of Least Privilege", "Security Goals (CIA Triad)", "Access Control Matrices", "Access Control Lists (ACLs)", "Capability Lists", "Role-Based Access Control (RBAC)", "Symmetric and Asymmetric Encryption", "Public Key Infrastructure (PKI)", "Digital Signatures", "Hash Functions", "User Authentication and MFA", "Quiz: Protection and Security"],
    },
    // 11-12. Distributed and Real-Time OS
    {
        name: "Distributed & Real-Time OS",
        difficulty: "Advanced",
        subtopics: ["Distributed System Characteristics", "Client-Server, Peer-to-Peer, Hybrid Models", "RPC and RMI", "Clock Synchronization (Physical, Logical, Vector Clocks)", "Mutual Exclusion in Distributed Systems", "Consensus Algorithms (Paxos, Raft, Byzantine Fault Tolerance)", "Hard vs Soft Real-Time", "Real-Time Scheduling", "Predictability and Determinism", "Embedded OS and RTOS", "Quiz: Distributed and Real-Time OS"],
    },
    // 13-14. Modern OS & Performance
    {
        name: "Modern OS & Performance",
        difficulty: "Advanced",
        subtopics: ["Virtual Machines (Type 1 and Type 2 Hypervisors)", "Containers (Docker, Kubernetes)", "VMs vs Containers", "Multi-core Architecture and Thread Scheduling", "Cache Coherence Protocols", "NUMA (Non-Uniform Memory Access)", "Dynamic Voltage and Frequency Scaling (DVFS)", "Performance Metrics and Benchmarking", "Caching Strategies", "Load Balancing", "Quiz: Modern OS Features"],
    },
    // 15. Case Studies
    {
        name: "OS Case Studies",
        difficulty: "Advanced",
        subtopics: ["Linux: Process Management", "Linux: Memory Management", "Linux: File System (ext4, btrfs)", "Linux: I/O Scheduling and Synchronization", "Windows: Virtual Memory and NTFS", "Windows: Security Model", "macOS: XNU Kernel", "FreeRTOS: Kernel Architecture and Task Management"],
    },
    // 16. Interview Problems
    {
        name: "Interview Practice Problems",
        difficulty: "Advanced",
        subtopics: ["L1: Process vs Thread Comparison", "L1: Scheduling Algorithm Selection", "L1: Paging Address Translation", "L2: Banker's Algorithm Implementation", "L2: Reader-Writer Problem Solution", "L2: Page Replacement Analysis", "L2: Disk Scheduling Scenarios", "L3: Distributed System Consensus", "L3: Virtual Memory Performance Analysis", "L3: Cache Coherence Protocol Design", "L4: Designing OS for Edge Cases", "L4: Scalability in Multi-core Systems"],
    },
    // 17. Quick Reference
    {
        name: "Key Formulas & Quick Reference",
        difficulty: "Beginner",
        subtopics: ["Turnaround Time = Completion - Arrival", "Waiting Time = Turnaround - Burst", "Response Time = First Response - Arrival", "CPU Utilization = Busy Time / Total Time", "Throughput = Processes / Total Time", "Page Fault Rate = Page Faults / Total References", "Effective Access Time Formula", "Disk Access Time = Seek + Rotational Latency + Transfer", "Key Concepts: Context Switch, Critical Section, Deadlock, Thrashing, Starvation, Livelock, Race Condition, TLB"],
    },
];

// ─── Subjects config ────────────────────────────────────────────────────────
const SUBJECTS = [
    {
        name: "DSA (Concept Revision)",
        description: "For people looking to study concepts for similar problems",
        icon: "💻",
        color: "#f97316",
        syllabus: DSA_SYLLABUS,
    },
    {
        name: "SQL + DE Foundations",
        description: "Master SQL and data engineering concepts for technical interviews",
        icon: "🗄️",
        color: "#3b82f6",
        syllabus: SQL_SYLLABUS,
    },
    {
        name: "Low Level Design (LLD)",
        description: "Master low-level design patterns and system architecture",
        icon: "🏗️",
        color: "#8b5cf6",
        syllabus: LLD_SYLLABUS,
    },
    {
        name: "OOPS",
        description: "Learn object-oriented programming principles and design patterns",
        icon: "🧩",
        color: "#10b981",
        syllabus: OOP_SYLLABUS,
    },
    {
        name: "Computer Networks",
        description: "Master networking concepts for technical interviews",
        icon: "🌐",
        color: "#06b6d4",
        syllabus: CN_SYLLABUS,
    },
    {
        name: "Database Management (DBMS)",
        description: "Learn SQL and database design principles",
        icon: "🗃️",
        color: "#a855f7",
        syllabus: DBMS_SYLLABUS,
    },
    {
        name: "Operating Systems",
        description: "Master OS concepts for technical interviews",
        icon: "⚙️",
        color: "#ef4444",
        syllabus: OS_SYLLABUS,
    },
];

export async function POST(req: NextRequest) {
    try {
        const uid = req.headers.get("x-firebase-uid");
        if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const user = await User.findOne({ firebaseUid: uid });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const userId = user._id;
        const results: { subject: string; topics: number; subtopics: number }[] = [];
        const skipped: string[] = [];

        // Get existing subject count for ordering
        let orderStart = await Subject.countDocuments({ userId });

        for (const subjectDef of SUBJECTS) {
            // Check if subject already exists
            const existing = await Subject.findOne({ userId, name: subjectDef.name });
            if (existing) {
                skipped.push(subjectDef.name);
                continue;
            }

            // Create subject
            const subject = await Subject.create({
                userId,
                name: subjectDef.name,
                description: subjectDef.description,
                icon: subjectDef.icon,
                color: subjectDef.color,
                order: orderStart++,
            });

            let totalTopics = 0;
            let totalSubtopics = 0;

            // Create topics and subtopics
            for (let i = 0; i < subjectDef.syllabus.length; i++) {
                const topicData = subjectDef.syllabus[i];

                const topic = await Topic.create({
                    subjectId: subject._id,
                    userId,
                    name: topicData.name,
                    description: "",
                    order: i,
                    difficulty: topicData.difficulty,
                });
                totalTopics++;

                for (let j = 0; j < topicData.subtopics.length; j++) {
                    await Subtopic.create({
                        topicId: topic._id,
                        subjectId: subject._id,
                        userId,
                        name: topicData.subtopics[j],
                        description: "",
                        order: j,
                        status: 0,
                        revision: {
                            learned: false,
                            revised1: false,
                            revised2: false,
                            revised3: false,
                            finalRevised: false,
                        },
                        resources: [],
                        companyTags: [],
                        resumeAligned: false,
                        timeSpent: 0,
                        sessions: [],
                    });
                    totalSubtopics++;
                }
            }

            results.push({
                subject: subjectDef.name,
                topics: totalTopics,
                subtopics: totalSubtopics,
            });
        }

        return NextResponse.json({
            message: "Syllabus seeded successfully!",
            created: results,
            skipped,
        }, { status: 201 });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
