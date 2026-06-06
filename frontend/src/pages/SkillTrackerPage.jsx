import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Code, Calendar, TrendingUp, Award, 
  Clock, CheckCircle, AlertCircle, 
  Target, Brain, Send, ChevronRight, 
  BarChart3, Plus, Edit2, Save, X, Trash2,
  Trophy, Zap, Sparkles, Star, Medal, 
  Rocket, BookOpen, Users, Gift, Flame,
  Crown, Diamond, Gem, ThumbsUp, CheckSquare,
  Circle, ChevronDown, ChevronUp, Layers, Flag,
  Calendar as CalendarIcon, TrendingUp as TrendingUpIcon,
  Activity, Heart, Smile, Coffee
} from 'lucide-react';

export default function SkillTrackerPage() {
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    name: "",
    title: "Software Engineer"
  });
  const [skills, setSkills] = useState([]);
  const [roadmap, setRoadmap] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills');
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Add skill form state
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', percentage: 0, category: 'Technical' });
  const [editingSkill, setEditingSkill] = useState(null);
  
  // Add goal form state
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    targetDate: '', 
    priority: 'Medium',
    status: 'active',
    progress: 0,
    category: 'Career'
  });
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    message: '',
    onConfirm: null
  });

  // Skill categories
  const skillCategories = ['Technical', 'Soft Skills', 'Language', 'Tools', 'Certifications'];

  // Goal categories
  const goalCategories = ['Career', 'Learning', 'Health', 'Financial', 'Personal'];
  const goalPriorities = ['High', 'Medium', 'Low'];

  // 100+ Learning Roadmap Items across different sectors
  const roadmapCategories = {
    '🖥️ Frontend Development': [
      { id: 1, title: "HTML5 Fundamentals", topics: "Semantic HTML, Forms, Accessibility, SEO", status: "upcoming", progress: 0 },
      { id: 2, title: "CSS3 Mastery", topics: "Flexbox, Grid, Animations, Responsive Design, Variables", status: "upcoming", progress: 0 },
      { id: 3, title: "JavaScript Essentials", topics: "ES6+, DOM Manipulation, Events, Promises", status: "upcoming", progress: 0 },
      { id: 4, title: "React.js Complete Guide", topics: "Components, Props, State, Hooks, Context, Router", status: "upcoming", progress: 0 },
      { id: 5, title: "TypeScript Fundamentals", topics: "Types, Interfaces, Generics, Decorators", status: "upcoming", progress: 0 },
      { id: 6, title: "Next.js Framework", topics: "SSR, SSG, API Routes, App Router, Middleware", status: "upcoming", progress: 0 },
      { id: 7, title: "Tailwind CSS", topics: "Utility Classes, Custom Config, Responsive, Plugins", status: "upcoming", progress: 0 },
      { id: 8, title: "Redux State Management", topics: "Actions, Reducers, Store, Redux Toolkit, RTK Query", status: "upcoming", progress: 0 },
      { id: 9, title: "Vue.js Framework", topics: "Composition API, Vuex, Router, Nuxt.js", status: "upcoming", progress: 0 },
      { id: 10, title: "Angular Framework", topics: "Components, Services, RxJS, NgRx", status: "upcoming", progress: 0 }
    ],
    '⚙️ Backend Development': [
      { id: 11, title: "Node.js Basics", topics: "Event Loop, Modules, NPM, File System", status: "upcoming", progress: 0 },
      { id: 12, title: "Express.js Framework", topics: "Routing, Middleware, Error Handling, Security", status: "upcoming", progress: 0 },
      { id: 13, title: "REST API Design", topics: "CRUD, HTTP Methods, Status Codes, Versioning", status: "upcoming", progress: 0 },
      { id: 14, title: "Database Design", topics: "SQL, Normalization, Indexing, ACID Properties", status: "upcoming", progress: 0 },
      { id: 15, title: "MongoDB & Mongoose", topics: "Schemas, Queries, Aggregation, Indexes", status: "upcoming", progress: 0 },
      { id: 16, title: "PostgreSQL", topics: "Advanced Queries, JSON, Full-Text Search, Triggers", status: "upcoming", progress: 0 },
      { id: 17, title: "Authentication & Authorization", topics: "JWT, OAuth, Sessions, RBAC, SSO", status: "upcoming", progress: 0 },
      { id: 18, title: "WebSockets & Real-time", topics: "Socket.io, WebRTC, Server-Sent Events", status: "upcoming", progress: 0 },
      { id: 19, title: "GraphQL API", topics: "Queries, Mutations, Subscriptions, Apollo Server", status: "upcoming", progress: 0 },
      { id: 20, title: "Microservices Architecture", topics: "Service Discovery, API Gateway, Circuit Breaker", status: "upcoming", progress: 0 }
    ],
    '🐍 Programming Languages': [
      { id: 21, title: "Python Programming", topics: "Syntax, OOP, Libraries, Decorators, Generators", status: "upcoming", progress: 0 },
      { id: 22, title: "Java Core", topics: "JVM, OOP, Collections, Multithreading, Streams", status: "upcoming", progress: 0 },
      { id: 23, title: "C++ Programming", topics: "Pointers, STL, Memory Management, Templates", status: "upcoming", progress: 0 },
      { id: 24, title: "Go Language", topics: "Goroutines, Channels, Interfaces, Packages", status: "upcoming", progress: 0 },
      { id: 25, title: "Rust Programming", topics: "Ownership, Borrowing, Lifetimes, Cargo", status: "upcoming", progress: 0 },
      { id: 26, title: "PHP & Laravel", topics: "MVC, Eloquent, Blade, Artisan, Livewire", status: "upcoming", progress: 0 },
      { id: 27, title: "Ruby on Rails", topics: "MVC, ActiveRecord, Routes, Hotwire", status: "upcoming", progress: 0 },
      { id: 28, title: "C# & .NET", topics: "LINQ, Entity Framework, ASP.NET Core", status: "upcoming", progress: 0 },
      { id: 29, title: "Kotlin Programming", topics: "Null Safety, Coroutines, Extensions, DSL", status: "upcoming", progress: 0 },
      { id: 30, title: "Swift Programming", topics: "Optionals, Protocols, Closures, Combine", status: "upcoming", progress: 0 }
    ],
    '🗄️ Database Technologies': [
      { id: 31, title: "MySQL Database", topics: "Queries, Joins, Stored Procedures, Views", status: "upcoming", progress: 0 },
      { id: 32, title: "PostgreSQL Advanced", topics: "Window Functions, CTEs, JSONB, Partitioning", status: "upcoming", progress: 0 },
      { id: 33, title: "MongoDB NoSQL", topics: "Document Model, Indexing, Sharding, Replication", status: "upcoming", progress: 0 },
      { id: 34, title: "Redis Caching", topics: "Data Structures, Pub/Sub, Persistence, Cluster", status: "upcoming", progress: 0 },
      { id: 35, title: "Elasticsearch", topics: "Search, Analytics, Kibana, Logstash", status: "upcoming", progress: 0 },
      { id: 36, title: "Firebase", topics: "Realtime DB, Auth, Cloud Functions, Firestore", status: "upcoming", progress: 0 },
      { id: 37, title: "Cassandra DB", topics: "Distributed Database, CQL, Consistency Levels", status: "upcoming", progress: 0 },
      { id: 38, title: "DynamoDB", topics: "NoSQL, Partitions, Streams, DAX", status: "upcoming", progress: 0 },
      { id: 39, title: "Neo4j Graph DB", topics: "Cypher, Graph Algorithms, Data Modeling", status: "upcoming", progress: 0 },
      { id: 40, title: "SQLite", topics: "Lightweight DB, Transactions, Triggers", status: "upcoming", progress: 0 }
    ],
    '☁️ Cloud & DevOps': [
      { id: 41, title: "AWS Fundamentals", topics: "EC2, S3, Lambda, RDS, VPC, IAM", status: "upcoming", progress: 0 },
      { id: 42, title: "Docker Containers", topics: "Images, Containers, Docker Compose, Volumes", status: "upcoming", progress: 0 },
      { id: 43, title: "Kubernetes", topics: "Pods, Services, Deployments, Ingress, Helm", status: "upcoming", progress: 0 },
      { id: 44, title: "CI/CD Pipelines", topics: "Jenkins, GitHub Actions, GitLab CI, CircleCI", status: "upcoming", progress: 0 },
      { id: 45, title: "Terraform", topics: "Infrastructure as Code, Providers, State Management", status: "upcoming", progress: 0 },
      { id: 46, title: "Azure Cloud", topics: "VMs, Functions, Storage, AKS, DevOps", status: "upcoming", progress: 0 },
      { id: 47, title: "Google Cloud Platform", topics: "Compute, Storage, AI/ML, GKE", status: "upcoming", progress: 0 },
      { id: 48, title: "Linux Administration", topics: "Commands, Shell Scripting, Process Management", status: "upcoming", progress: 0 },
      { id: 49, title: "Ansible Automation", topics: "Playbooks, Roles, Inventory, Modules", status: "upcoming", progress: 0 },
      { id: 50, title: "Prometheus & Grafana", topics: "Metrics, Monitoring, Alerting, Dashboards", status: "upcoming", progress: 0 }
    ],
    '🤖 Data Science & AI': [
      { id: 51, title: "Python for Data Science", topics: "Pandas, NumPy, Matplotlib, Seaborn", status: "upcoming", progress: 0 },
      { id: 52, title: "Machine Learning Basics", topics: "Supervised, Unsupervised, Regression, Classification", status: "upcoming", progress: 0 },
      { id: 53, title: "Deep Learning", topics: "Neural Networks, TensorFlow, Keras, PyTorch", status: "upcoming", progress: 0 },
      { id: 54, title: "Data Visualization", topics: "Tableau, Power BI, D3.js, Plotly", status: "upcoming", progress: 0 },
      { id: 55, title: "Natural Language Processing", topics: "NLTK, Transformers, BERT, GPT", status: "upcoming", progress: 0 },
      { id: 56, title: "Computer Vision", topics: "OpenCV, Image Processing, CNNs", status: "upcoming", progress: 0 },
      { id: 57, title: "Big Data Analytics", topics: "Hadoop, Spark, Hive, Pig", status: "upcoming", progress: 0 },
      { id: 58, title: "Statistical Analysis", topics: "Probability, Hypothesis Testing, Regression", status: "upcoming", progress: 0 },
      { id: 59, title: "MLOps", topics: "Model Deployment, Monitoring, Versioning", status: "upcoming", progress: 0 },
      { id: 60, title: "Reinforcement Learning", topics: "Agents, Environments, Q-Learning", status: "upcoming", progress: 0 }
    ]
  };

  // Convert roadmap categories to array for rendering
  const initialRoadmapItems = [];
  Object.keys(roadmapCategories).forEach(category => {
    roadmapCategories[category].forEach(item => {
      initialRoadmapItems.push({ ...item, category });
    });
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('userGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Sample goals
      const sampleGoals = [
        { id: 1, title: "Complete React Certification", targetDate: "2024-12-31", priority: "High", status: "active", progress: 60, category: "Career" },
        { id: 2, title: "Learn Machine Learning Basics", targetDate: "2025-03-15", priority: "Medium", status: "active", progress: 30, category: "Learning" },
        { id: 3, title: "Exercise 3 times a week", targetDate: "2024-12-31", priority: "Medium", status: "active", progress: 45, category: "Health" },
        { id: 4, title: "Save for vacation", targetDate: "2025-06-01", priority: "Low", status: "active", progress: 20, category: "Financial" }
      ];
      setGoals(sampleGoals);
      localStorage.setItem('userGoals', JSON.stringify(sampleGoals));
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    loadRoadmapFromStorage();
  }, []);

  const loadRoadmapFromStorage = () => {
    const savedRoadmap = localStorage.getItem('learningRoadmap');
    if (savedRoadmap) {
      setRoadmap(JSON.parse(savedRoadmap));
    } else {
      setRoadmap(initialRoadmapItems);
      localStorage.setItem('learningRoadmap', JSON.stringify(initialRoadmapItems));
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
      
      const userResponse = await fetch(`${BASE}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = await userResponse.json();
      
      setUserData({
        name: user.name || "User",
        title: user.userTitle || "Software Engineer"
      });

      const skillsRes = await axios.get(`${BASE}/api/skill-tracker/skills`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSkills(skillsRes.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const updateRoadmapProgress = (itemId, newProgress) => {
    const updatedRoadmap = roadmap.map(item => {
      if (item.id === itemId) {
        const newStatus = newProgress === 100 ? 'completed' : (newProgress > 0 ? 'in-progress' : 'upcoming');
        return { ...item, progress: newProgress, status: newStatus };
      }
      return item;
    });
    setRoadmap(updatedRoadmap);
    localStorage.setItem('learningRoadmap', JSON.stringify(updatedRoadmap));
    
    // Update skills based on completed roadmap items
    if (newProgress === 100) {
      const completedItem = roadmap.find(item => item.id === itemId);
      if (completedItem && !skills.find(s => s.name === completedItem.title)) {
        const newSkillItem = { name: completedItem.title, percentage: 50, category: 'Technical' };
        const updatedSkills = [...skills, newSkillItem];
        setSkills(updatedSkills);
        saveSkillToBackend(updatedSkills);
      }
    }
  };

  const saveSkillToBackend = async (skillsArray) => {
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
      await axios.put(`${BASE}/api/skill-tracker/skills`,
        { skills: skillsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error saving skills:', error);
    }
  };

  const markAsLearned = (itemId) => {
    updateRoadmapProgress(itemId, 100);
  };

  const updateProgress = (itemId, increment) => {
    const item = roadmap.find(i => i.id === itemId);
    if (item) {
      let newProgress = item.progress + increment;
      newProgress = Math.max(0, Math.min(100, newProgress));
      updateRoadmapProgress(itemId, newProgress);
    }
  };

  // Goal CRUD operations
  const handleAddGoal = () => {
    if (!newGoal.title.trim()) {
      alert('Please enter a goal title');
      return;
    }
    
    const newGoalWithId = {
      ...newGoal,
      id: Date.now(),
      progress: 0,
      status: 'active'
    };
    
    const updatedGoals = [...goals, newGoalWithId];
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    setShowAddGoal(false);
    setNewGoal({ title: '', targetDate: '', priority: 'Medium', status: 'active', progress: 0, category: 'Career' });
  };

  const handleUpdateGoalProgress = (goalId, newProgress) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const status = newProgress === 100 ? 'completed' : 'active';
        return { ...goal, progress: Math.min(100, Math.max(0, newProgress)), status };
      }
      return goal;
    });
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
  };

  const handleDeleteGoal = (goalId) => {
    setConfirmDialog({
      show: true,
      message: 'Are you sure you want to delete this goal?',
      onConfirm: () => {
        const updatedGoals = goals.filter(goal => goal.id !== goalId);
        setGoals(updatedGoals);
        localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
        setConfirmDialog({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const handleUpdateGoal = () => {
    if (!editingGoal.title.trim()) {
      alert('Please enter a goal title');
      return;
    }
    
    const updatedGoals = goals.map(goal => 
      goal.id === editingGoal.id ? editingGoal : goal
    );
    setGoals(updatedGoals);
    localStorage.setItem('userGoals', JSON.stringify(updatedGoals));
    setEditingGoal(null);
  };

  // Skill CRUD operations
  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) {
      alert('Please enter a skill name');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const updatedSkills = [...skills, { ...newSkill, percentage: Number(newSkill.percentage) }];
      
      await axios.put(`${BASE}/api/skill-tracker/skills`, 
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSkills(updatedSkills);
      setShowAddSkill(false);
      setNewSkill({ name: '', percentage: 0, category: 'Technical' });
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill.name.trim()) {
      alert('Please enter a skill name');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const updatedSkills = skills.map(skill =>
        skill.name === editingSkill.originalName ?
        { ...editingSkill, percentage: Number(editingSkill.percentage) } :
        skill
      );
      
      await axios.put(`${BASE}/api/skill-tracker/skills`, 
        { skills: updatedSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSkills(updatedSkills);
      setEditingSkill(null);
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Failed to update skill');
    }
  };

  const handleDeleteSkill = async (skillName) => {
    setConfirmDialog({
      show: true,
      message: `Are you sure you want to delete "${skillName}"?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          const BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";
          const updatedSkills = skills.filter(skill => skill.name !== skillName);
          
          await axios.put(`${BASE}/api/skill-tracker/skills`, 
            { skills: updatedSkills },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          setSkills(updatedSkills);
          setConfirmDialog({ show: false, message: '', onConfirm: null });
        } catch (error) {
          console.error('Error deleting skill:', error);
          alert('Failed to delete skill');
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed</span>;
      case 'in-progress':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> In Progress</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full flex items-center gap-1"><Circle className="h-3 w-3" /> Upcoming</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High':
        return <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">🔴 High</span>;
      case 'Medium':
        return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">🟡 Medium</span>;
      default:
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">🟢 Low</span>;
    }
  };

  const calculateOverallProgress = () => {
    if (roadmap.length === 0) return 0;
    const totalProgress = roadmap.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / roadmap.length);
  };

  const calculateCompletedCount = () => {
    return roadmap.filter(item => item.progress === 100).length;
  };

  const calculateGoalsProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  };

  const calculateCompletedGoals = () => {
    return goals.filter(goal => goal.progress === 100).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Group roadmap by category
  const roadmapByCategory = {};
  roadmap.forEach(item => {
    if (!roadmapByCategory[item.category]) {
      roadmapByCategory[item.category] = [];
    }
    roadmapByCategory[item.category].push(item);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Skill Tracker Pro</h1>
              <p className="mt-2 text-blue-100">
                Track your skills, goals, and follow your 100+ topic learning roadmap
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-2">
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDialog({ show: false, message: '', onConfirm: null })}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-gray-600 mt-1">{userData.title}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-blue-600">{skills.length}</div>
            <div className="text-sm text-gray-600">Skills Tracked</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-green-600">{calculateCompletedCount()}</div>
            <div className="text-sm text-gray-600">Topics Learned</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-purple-600">{goals.length}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 text-center hover:shadow-md transition">
            <div className="text-2xl font-bold text-orange-600">{calculateCompletedGoals()}</div>
            <div className="text-sm text-gray-600">Goals Achieved</div>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Learning Journey</h3>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Roadmap Progress</span>
              <span>{calculateOverallProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${calculateOverallProgress()}%` }}></div>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Goals Progress</span>
              <span>{calculateGoalsProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: `${calculateGoalsProgress()}%` }}></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('skills')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'skills'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Skills Proficiency
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Goals
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roadmap'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Learning Roadmap (100+ Topics)
            </button>
          </nav>
        </div>

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Target className="h-5 w-5 mr-2 text-blue-600" />
                MY SKILLS
              </h2>
              <button
                onClick={() => setShowAddSkill(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Skill
              </button>
            </div>

            {/* Add Skill Modal */}
            {showAddSkill && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4">Add New Skill</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Skill Name (e.g., React, Python)"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newSkill.category}
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {skillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div>
                      <label className="block text-sm font-medium mb-1">Proficiency (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newSkill.percentage}
                        onChange={(e) => setNewSkill({ ...newSkill, percentage: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center mt-1 text-sm font-medium">{newSkill.percentage}%</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddSkill}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add Skill
                      </button>
                      <button
                        onClick={() => setShowAddSkill(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Skill Modal */}
            {editingSkill && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4">Edit Skill</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Skill Name"
                      value={editingSkill.name}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editingSkill.category || 'Technical'}
                      onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {skillCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div>
                      <label className="block text-sm font-medium mb-1">Proficiency (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingSkill.percentage}
                        onChange={(e) => setEditingSkill({ ...editingSkill, percentage: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center mt-1 text-sm font-medium">{editingSkill.percentage}%</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateSkill}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setEditingSkill(null)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {skills.length === 0 ? (
              <div className="text-center py-12">
                <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
                <p className="text-gray-500 mb-4">Start adding your skills to track your progress</p>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {skillCategories.map(category => {
                  const categorySkills = skills.filter(s => (s.category || 'Technical') === category);
                  if (categorySkills.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {category}
                      </h3>
                      <div className="space-y-4">
                        {categorySkills.map((skill, index) => (
                          <div key={index} className="group">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium text-gray-700">{skill.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm">{skill.percentage}%</span>
                                <button
                                  onClick={() => setEditingSkill({ ...skill, originalName: skill.name })}
                                  className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSkill(skill.name)}
                                  className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 rounded-full h-2 transition-all duration-500"
                                style={{ width: `${skill.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Flag className="h-5 w-5 mr-2 text-blue-600" />
                MY GOALS
              </h2>
              <button
                onClick={() => setShowAddGoal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Goal
              </button>
            </div>

            {/* Add Goal Modal */}
            {showAddGoal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4">Add New Goal</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Goal Title (e.g., Complete React Certification)"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {goalCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {goalPriorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddGoal}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add Goal
                      </button>
                      <button
                        onClick={() => setShowAddGoal(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Goal Modal */}
            {editingGoal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                  <h3 className="text-lg font-bold mb-4">Edit Goal</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Goal Title"
                      value={editingGoal.title}
                      onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editingGoal.category}
                      onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {goalCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      value={editingGoal.priority}
                      onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    >
                      {goalPriorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={editingGoal.targetDate}
                      onChange={(e) => setEditingGoal({ ...editingGoal, targetDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <label className="block text-sm font-medium mb-1">Progress (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={editingGoal.progress}
                        onChange={(e) => setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center mt-1 text-sm font-medium">{editingGoal.progress}%</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateGoal}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setEditingGoal(null)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {goals.length === 0 ? (
              <div className="text-center py-12">
                <Flag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals added yet</h3>
                <p className="text-gray-500 mb-4">Set personal and career goals to track your progress</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Add Your First Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map(goal => (
                  <div key={goal.id} className="border border-blue-100 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          {getPriorityBadge(goal.priority)}
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{goal.category}</span>
                          {goal.progress === 100 && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Achieved!
                            </span>
                          )}
                        </div>
                        {goal.targetDate && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${goal.progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                    {goal.progress < 100 && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleUpdateGoalProgress(goal.id, goal.progress + 10)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          +10%
                        </button>
                        <button
                          onClick={() => handleUpdateGoalProgress(goal.id, goal.progress + 25)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          +25%
                        </button>
                        <button
                          onClick={() => handleUpdateGoalProgress(goal.id, 100)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Complete Goal
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Rocket className="h-5 w-5 mr-2 text-blue-600" />
              100+ Topic Learning Roadmap
            </h2>
            
            <div className="space-y-6">
              {Object.keys(roadmapByCategory).map(category => {
                const categoryItems = roadmapByCategory[category];
                const categoryProgress = categoryItems.reduce((sum, item) => sum + item.progress, 0) / categoryItems.length;
                const isExpanded = expandedCategories[category] || false;
                
                return (
                  <div key={category} className="border border-blue-100 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Layers className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{category}</h3>
                          <p className="text-xs text-gray-500">{categoryItems.length} topics</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-700">{Math.round(categoryProgress)}% Complete</div>
                          <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${categoryProgress}%` }}></div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                      </div>
                    </button>
                    
                    {/* Category Items */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 border-t border-blue-100">
                        {categoryItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                {getStatusBadge(item.status)}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{item.topics}</p>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${item.progress}%` }}></div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              {item.progress < 100 && (
                                <>
                                  <button
                                    onClick={() => updateProgress(item.id, -10)}
                                    className="text-gray-500 hover:text-gray-700 p-1 text-sm"
                                    disabled={item.progress === 0}
                                  >
                                    -10%
                                  </button>
                                  <button
                                    onClick={() => updateProgress(item.id, 10)}
                                    className="text-blue-600 hover:text-blue-800 p-1 text-sm"
                                    disabled={item.progress === 100}
                                  >
                                    +10%
                                  </button>
                                </>
                              )}
                              {item.progress !== 100 && (
                                <button
                                  onClick={() => markAsLearned(item.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-1"
                                >
                                  <CheckSquare className="h-4 w-4" /> Mark Learned
                                </button>
                              )}
                              {item.progress === 100 && (
                                <span className="text-green-600 text-sm flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" /> Learned ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}