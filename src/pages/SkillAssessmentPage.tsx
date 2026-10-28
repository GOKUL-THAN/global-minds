import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Button } from '../components/ui/Button';
import { usePageMeta } from '../hooks/usePageMeta';

// ── Quiz Topics ────────────────────────────────────────────
const quizTopics = [
  { id: 'cloud', title: 'Cloud Computing', icon: '☁️', questions: 10, duration: '10 min', level: 'Beginner' },
  { id: 'python', title: 'Python Basics', icon: '🐍', questions: 10, duration: '10 min', level: 'Beginner' },
  { id: 'devops', title: 'DevOps Concepts', icon: '🔧', questions: 10, duration: '10 min', level: 'Intermediate' },
  { id: 'webdev', title: 'Web Development', icon: '💻', questions: 10, duration: '10 min', level: 'Beginner' },
  { id: 'datasci', title: 'Data Science', icon: '📊', questions: 10, duration: '10 min', level: 'Intermediate' },
  { id: 'testing', title: 'Software Testing', icon: '🧪', questions: 10, duration: '10 min', level: 'Beginner' },
];

// ── Quiz Questions ─────────────────────────────────────────
const quizBank: Record<string, { question: string; options: string[]; correct: number; explanation: string }[]> = {
  cloud: [
    { question: 'What does IaaS stand for in cloud computing?', options: ['Internet as a Service', 'Infrastructure as a Service', 'Integration as a Service', 'Interface as a Service'], correct: 1, explanation: 'IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet, including servers, storage, and networking.' },
    { question: 'Which AWS service is primarily used for object storage?', options: ['EC2', 'RDS', 'S3', 'Lambda'], correct: 2, explanation: 'Amazon S3 (Simple Storage Service) is AWS\'s object storage service designed to store and retrieve any amount of data.' },
    { question: 'What is the purpose of a CDN (Content Delivery Network)?', options: ['To manage databases', 'To deliver content faster by caching it closer to users', 'To process serverless functions', 'To monitor application logs'], correct: 1, explanation: 'A CDN distributes content across multiple geographically distributed servers to reduce latency for end users.' },
    { question: 'Which cloud deployment model is exclusive to a single organisation?', options: ['Public Cloud', 'Hybrid Cloud', 'Private Cloud', 'Community Cloud'], correct: 2, explanation: 'A Private Cloud is exclusively used by a single organisation, offering greater control and security.' },
    { question: 'What is auto-scaling in cloud computing?', options: ['Manually adding servers', 'Automatically adjusting compute resources based on demand', 'Scaling database queries', 'Backing up data automatically'], correct: 1, explanation: 'Auto-scaling automatically increases or decreases compute capacity based on application demand.' },
    { question: 'Which of the following is a Google Cloud service for running containers?', options: ['EKS', 'AKS', 'GKE', 'ECS'], correct: 2, explanation: 'GKE (Google Kubernetes Engine) is Google Cloud\'s managed Kubernetes service for running containerised applications.' },
    { question: 'What does "serverless" mean in cloud computing?', options: ['No server is used', 'Developers don\'t manage servers; cloud provider handles infrastructure', 'Only local servers are used', 'Servers are shared publicly'], correct: 1, explanation: 'Serverless computing means developers write functions without managing the underlying infrastructure — the cloud provider handles it.' },
    { question: 'Which AWS service provides managed relational databases?', options: ['DynamoDB', 'S3', 'RDS', 'SQS'], correct: 2, explanation: 'Amazon RDS (Relational Database Service) provides managed relational databases like MySQL, PostgreSQL, and Oracle.' },
    { question: 'What is a VPC in AWS?', options: ['Virtual Private Container', 'Virtual Personal Computer', 'Virtual Private Cloud', 'Virtual Proxy Connection'], correct: 2, explanation: 'A VPC (Virtual Private Cloud) lets you provision an isolated section of AWS Cloud where you can launch resources in a virtual network.' },
    { question: 'What is the primary benefit of cloud computing?', options: ['Higher upfront hardware costs', 'Pay-as-you-go pricing and scalability', 'Requires physical data centre management', 'Limited geographical access'], correct: 1, explanation: 'Cloud computing offers pay-as-you-go pricing, eliminating large upfront capital expenses and allowing on-demand scalability.' },
  ],
  python: [
    { question: 'Which keyword is used to define a function in Python?', options: ['func', 'function', 'def', 'lambda'], correct: 2, explanation: 'In Python, the "def" keyword is used to define a function.' },
    { question: 'What is the output of: print(type([]))?', options: ["<class 'dict'>", "<class 'list'>", "<class 'tuple'>", "<class 'set'>"], correct: 1, explanation: '[] creates an empty list in Python, so type([]) returns <class \'list\'>.' },
    { question: 'Which of these is an immutable data type in Python?', options: ['List', 'Dictionary', 'Tuple', 'Set'], correct: 2, explanation: 'Tuples are immutable in Python — once created, their elements cannot be changed.' },
    { question: 'How do you start a comment in Python?', options: ['//', '/* */', '#', '--'], correct: 2, explanation: 'Python uses the # symbol to start a single-line comment.' },
    { question: 'What does the "len()" function do in Python?', options: ['Returns the last element', 'Returns the length of an object', 'Deletes an element', 'Converts to list'], correct: 1, explanation: 'len() returns the number of items in an object such as a string, list, or dictionary.' },
    { question: 'Which Python library is commonly used for data analysis?', options: ['NumPy', 'Pandas', 'Flask', 'Django'], correct: 1, explanation: 'Pandas is the primary Python library for data manipulation and analysis.' },
    { question: 'What is the correct way to open a file in Python for reading?', options: ["open('file.txt', 'w')", "open('file.txt', 'r')", "open('file.txt', 'a')", "read('file.txt')"], correct: 1, explanation: 'open() with mode \'r\' opens a file for reading in Python.' },
    { question: 'What is a Python decorator?', options: ['A type of loop', 'A function that modifies another function', 'A CSS-like styling feature', 'A method to sort lists'], correct: 1, explanation: 'A decorator is a function that takes another function and extends or modifies its behaviour without changing the source code.' },
    { question: 'Which of the following correctly creates a dictionary in Python?', options: ["[1, 2, 3]", "{'key': 'value'}", "(1, 2, 3)", "{1, 2, 3}"], correct: 1, explanation: "Dictionaries are created with curly braces and key-value pairs: {'key': 'value'}." },
    { question: 'What does "pip" stand for in Python?', options: ['Python Install Package', 'Pip Installs Packages', 'Package Import Protocol', 'Python Index Package'], correct: 1, explanation: '"Pip Installs Packages" (or sometimes "Pip Installs Python") is the recursive acronym for pip, Python\'s package manager.' },
  ],
  devops: [
    { question: 'What does CI/CD stand for?', options: ['Code Integration / Code Deployment', 'Continuous Integration / Continuous Deployment', 'Container Integration / Container Delivery', 'Cloud Infrastructure / Cloud Deployment'], correct: 1, explanation: 'CI/CD stands for Continuous Integration and Continuous Deployment/Delivery — a practice of automating build, test, and deployment pipelines.' },
    { question: 'Which tool is primarily used for containerisation?', options: ['Ansible', 'Terraform', 'Docker', 'Jenkins'], correct: 2, explanation: 'Docker is the leading platform for containerising applications, allowing them to run consistently across environments.' },
    { question: 'What is Kubernetes used for?', options: ['Version control', 'Container orchestration', 'Infrastructure provisioning', 'Log management'], correct: 1, explanation: 'Kubernetes is an open-source system for automating the deployment, scaling, and management of containerised applications.' },
    { question: 'Which DevOps tool is used for infrastructure as code (IaC)?', options: ['Git', 'Jenkins', 'Terraform', 'Nagios'], correct: 2, explanation: 'Terraform by HashiCorp is the most widely used tool for writing infrastructure as code across cloud providers.' },
    { question: 'What is a Dockerfile?', options: ['A JSON configuration for Kubernetes', 'A text file containing instructions to build a Docker image', 'A CI/CD pipeline configuration', 'An Ansible playbook'], correct: 1, explanation: 'A Dockerfile is a text file containing a set of instructions to build a Docker container image.' },
    { question: 'Which source control platform is most commonly used in DevOps pipelines?', options: ['SVN', 'Git', 'CVS', 'Perforce'], correct: 1, explanation: 'Git is the most widely used version control system in DevOps workflows, with platforms like GitHub and GitLab.' },
    { question: 'What does "shift-left testing" mean in DevOps?', options: ['Moving testing to production', 'Running tests only at the end of deployment', 'Integrating testing earlier in the development cycle', 'Deleting old tests'], correct: 2, explanation: '"Shift-left" means introducing testing earlier in the SDLC — during development rather than after — to catch bugs sooner.' },
    { question: 'What is Ansible primarily used for?', options: ['Container orchestration', 'Configuration management and automation', 'Monitoring', 'Load balancing'], correct: 1, explanation: 'Ansible is a configuration management and automation tool used to provision and configure servers.' },
    { question: 'Which command is used to build a Docker image?', options: ['docker run', 'docker build', 'docker pull', 'docker create'], correct: 1, explanation: '"docker build" creates a Docker image from a Dockerfile.' },
    { question: 'What is a Helm chart in Kubernetes?', options: ['A monitoring dashboard', 'A package manager for Kubernetes applications', 'A Docker container', 'A networking plugin'], correct: 1, explanation: 'Helm is a package manager for Kubernetes that uses "charts" to define, install, and manage Kubernetes applications.' },
  ],
  webdev: [
    { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Transfer Markup Language', 'Hyper Text Machine Language'], correct: 0, explanation: 'HTML stands for HyperText Markup Language — the standard language for creating web pages.' },
    { question: 'Which CSS property is used to change text color?', options: ['font-color', 'text-color', 'color', 'foreground'], correct: 2, explanation: 'The CSS "color" property sets the color of text.' },
    { question: 'What does the "async" keyword do in JavaScript?', options: ['Makes a function synchronous', 'Makes a function return a Promise', 'Stops code execution', 'Creates a new thread'], correct: 1, explanation: 'The "async" keyword declares an asynchronous function that implicitly returns a Promise.' },
    { question: 'Which HTTP method is used to submit form data to a server?', options: ['GET', 'POST', 'PUT', 'DELETE'], correct: 1, explanation: 'The POST method sends data to the server, commonly used for form submissions.' },
    { question: 'What is React?', options: ['A CSS framework', 'A JavaScript library for building user interfaces', 'A backend framework', 'A database query language'], correct: 1, explanation: 'React is a JavaScript library developed by Meta for building component-based user interfaces.' },
    { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style Syntax', 'Coded Style Sheets', 'Cascaded Syntax Sheets'], correct: 0, explanation: 'CSS stands for Cascading Style Sheets — used to style and layout web pages.' },
    { question: 'What is the DOM in web development?', options: ['Document Object Model', 'Data Object Management', 'Display Object Model', 'Domain Object Map'], correct: 0, explanation: 'The DOM (Document Object Model) is a programming interface for HTML/XML documents, representing the page as a tree structure.' },
    { question: 'Which tag is used to create a hyperlink in HTML?', options: ['<link>', '<href>', '<a>', '<url>'], correct: 2, explanation: 'The <a> (anchor) tag is used to create hyperlinks in HTML.' },
    { question: 'What is Node.js?', options: ['A browser plugin', 'A JavaScript runtime built on Chrome\'s V8 engine', 'A CSS preprocessor', 'A database'], correct: 1, explanation: 'Node.js is a JavaScript runtime environment that allows running JavaScript code on the server side.' },
    { question: 'What does API stand for?', options: ['Application Program Interface', 'Application Programming Interface', 'Advanced Program Integration', 'Application Protocol Interface'], correct: 1, explanation: 'API stands for Application Programming Interface — a set of rules that allows different applications to communicate.' },
  ],
  datasci: [
    { question: 'What is the purpose of Exploratory Data Analysis (EDA)?', options: ['To deploy machine learning models', 'To understand the data through statistics and visualisation', 'To clean the production database', 'To write SQL queries'], correct: 1, explanation: 'EDA involves analysing datasets to summarise their main characteristics, often using visual methods.' },
    { question: 'Which Python library is used for machine learning?', options: ['Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'], correct: 2, explanation: 'Scikit-learn is the most widely used Python library for machine learning algorithms.' },
    { question: 'What is overfitting in machine learning?', options: ['When a model performs well on training data but poorly on new data', 'When a model performs poorly on training data', 'When the dataset is too large', 'When the model trains too fast'], correct: 0, explanation: 'Overfitting occurs when a model learns the training data too well, including noise, causing poor generalisation.' },
    { question: 'What does "supervised learning" mean?', options: ['Learning without labelled data', 'Learning with labelled input-output pairs', 'Learning from reinforcement signals', 'Learning from cluster analysis'], correct: 1, explanation: 'In supervised learning, the model is trained on labelled data where the correct output is provided for each input.' },
    { question: 'What is a confusion matrix used for?', options: ['Visualising decision trees', 'Evaluating classification model performance', 'Plotting regression lines', 'Normalising data'], correct: 1, explanation: 'A confusion matrix is a table used to evaluate the performance of a classification algorithm.' },
    { question: 'Which algorithm is commonly used for classification and regression?', options: ['K-Means', 'DBSCAN', 'Random Forest', 'PCA'], correct: 2, explanation: 'Random Forest is an ensemble learning method used for both classification and regression tasks.' },
    { question: 'What is "feature engineering"?', options: ['Writing software features', 'Creating or transforming variables to improve model performance', 'Optimising SQL queries', 'Designing neural network layers'], correct: 1, explanation: 'Feature engineering involves creating new input variables from existing data to improve machine learning model performance.' },
    { question: 'What does "NLP" stand for?', options: ['Non-Linear Programming', 'Natural Language Processing', 'Neural Learning Protocol', 'Numeric Learning Pipeline'], correct: 1, explanation: 'NLP (Natural Language Processing) is a field of AI focused on interactions between computers and human language.' },
    { question: 'Which tool is commonly used for data visualisation in Python?', options: ['Django', 'Flask', 'Seaborn', 'FastAPI'], correct: 2, explanation: 'Seaborn is a Python data visualisation library built on top of Matplotlib, providing a high-level interface for drawing statistical graphics.' },
    { question: 'What is the "train-test split" in machine learning?', options: ['Splitting code into modules', 'Dividing data into training and testing sets to evaluate model performance', 'Splitting a database table', 'Dividing features into numeric and categorical'], correct: 1, explanation: 'Train-test split divides data so the model learns from the training set and is evaluated on unseen test data.' },
  ],
  testing: [
    { question: 'What is the primary goal of software testing?', options: ['To write more code', 'To find defects and ensure software quality', 'To deploy the application', 'To design the database'], correct: 1, explanation: 'The primary goal of software testing is to identify defects and ensure the software meets its requirements and quality standards.' },
    { question: 'What is the difference between functional and non-functional testing?', options: ['No difference', 'Functional tests verify features; non-functional tests verify performance, security etc.', 'Non-functional tests verify features; functional tests verify performance', 'Functional tests are automated; non-functional are manual'], correct: 1, explanation: 'Functional testing verifies the application behaves as specified. Non-functional testing checks performance, security, usability, etc.' },
    { question: 'What is Selenium?', options: ['A database tool', 'A web automation testing framework', 'A CI/CD tool', 'A load testing tool'], correct: 1, explanation: 'Selenium is an open-source suite of tools for automating web browsers, widely used for regression testing.' },
    { question: 'What is a "test case"?', options: ['A bug report', 'A set of conditions under which a tester evaluates a feature', 'A deployment script', 'A unit of code'], correct: 1, explanation: 'A test case is a set of conditions, inputs, and expected outcomes used to determine if a feature works correctly.' },
    { question: 'What does UAT stand for?', options: ['Universal Application Testing', 'User Acceptance Testing', 'Unified Automated Testing', 'Unit API Testing'], correct: 1, explanation: 'UAT (User Acceptance Testing) is the final phase where real users test the software to ensure it meets business requirements.' },
    { question: 'What is regression testing?', options: ['Testing new features only', 'Re-testing previously passed tests after code changes to ensure nothing is broken', 'Performance testing', 'Security testing'], correct: 1, explanation: 'Regression testing re-runs existing tests after code changes to ensure that previously working functionality still works.' },
    { question: 'What is API testing?', options: ['Testing the visual UI', 'Testing the application programming interface for functionality and reliability', 'Testing hardware', 'Testing mobile apps'], correct: 1, explanation: 'API testing validates that APIs work correctly, return expected results, and handle errors gracefully.' },
    { question: 'Which tool is used for performance testing?', options: ['Selenium', 'JMeter', 'Postman', 'TestNG'], correct: 1, explanation: 'Apache JMeter is an open-source tool designed for performance testing and measuring application behaviour under load.' },
    { question: 'What is the "Bug Life Cycle"?', options: ['The lifespan of a software application', 'The stages a bug goes through from discovery to closure', 'The number of bugs in a release', 'The time taken to fix a bug'], correct: 1, explanation: 'The Bug Life Cycle defines the different stages a defect goes through: New → Assigned → Open → Fixed → Retested → Closed.' },
    { question: 'What is Black Box Testing?', options: ['Testing internal code structure', 'Testing without knowledge of internal implementation', 'Testing database queries only', 'Testing server-side code'], correct: 1, explanation: 'Black Box Testing tests the software based on input/output without knowledge of internal code structure or implementation.' },
  ],
};

type QuizState = 'select' | 'quiz' | 'result';

interface Answer { questionIndex: number; selected: number; correct: boolean }

function ScoreBadge({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  if (pct >= 80) return <span className="text-green-600 font-bold">Excellent!</span>;
  if (pct >= 60) return <span className="text-brand-600 font-bold">Good</span>;
  if (pct >= 40) return <span className="text-orange-600 font-bold">Average</span>;
  return <span className="text-red-600 font-bold">Needs Improvement</span>;
}

function CourseRecommendation({ topicId, score, total }: { topicId: string; score: number; total: number }) {
  const pct = (score / total) * 100;
  const topic = quizTopics.find(t => t.id === topicId);
  const courseMap: Record<string, { title: string; href: string }> = {
    cloud: { title: 'AWS / Cloud', href: '/courses/aws-training' },
    python: { title: 'Python (Data Science)', href: '/courses/data-science' },
    devops: { title: 'Full Stack Development', href: '/courses/full-stack-development' },
    webdev: { title: 'Full Stack Development', href: '/courses/full-stack-development' },
    datasci: { title: 'Data Science', href: '/courses/data-science' },
    testing: { title: 'Software Testing', href: '/courses/software-testing' },
  };
  const course = courseMap[topicId];
  return (
    <div className="bg-brand-50 rounded-2xl p-6 border border-brand-200">
      <h3 className="font-semibold text-surface-900 mb-2">Recommended Next Step</h3>
      {pct >= 80 ? (
        <p className="text-surface-700 font-medium text-sm mb-4 leading-relaxed">
          You have a strong foundation in {topic?.title}. Take the advanced course to become an expert.
        </p>
      ) : pct >= 50 ? (
        <p className="text-surface-700 font-medium text-sm mb-4 leading-relaxed">
          You have a basic understanding. Our {topic?.title} course will fill the gaps and make you job-ready.
        </p>
      ) : (
        <p className="text-surface-700 font-medium text-sm mb-4 leading-relaxed">
          This is a great starting point! Our beginner-friendly {topic?.title} course is perfect for you.
        </p>
      )}
      <div className="flex gap-3">
        {course && (
          <Link to={course.href}>
            <Button size="sm">Explore {course.title}</Button>
          </Link>
        )}
        <Link to="/demo-class">
          <Button size="sm" variant="secondary">Book Free Demo</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SkillAssessmentPage() {
  usePageMeta({
    title: 'Free Skill Assessment Quiz',
    description: 'Test your IT knowledge with Global Minds Academy\'s free skill assessment quizzes. Get instant results and course recommendations.',
  });

  const [state, setState] = useState<QuizState>('select');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const questions = selectedTopic ? quizBank[selectedTopic] : [];
  const score = answers.filter(a => a.correct).length;

  const handleStart = (topicId: string) => {
    setSelectedTopic(topicId);
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setState('quiz');
  };

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === questions[currentQ].correct;
    const newAnswers = [...answers, { questionIndex: currentQ, selected: selectedOption, correct }];
    setAnswers(newAnswers);
    if (currentQ + 1 >= questions.length) {
      setState('result');
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleReset = () => {
    setState('select');
    setSelectedTopic('');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="page-hero-premium py-16 relative overflow-hidden">
        <div className="container-xl relative z-10">
          <Breadcrumbs items={[{ label: 'Skill Assessment' }]} className="mb-4" />
          <div className="page-hero-badge mb-4">
            Interactive Knowledge Check • 100% Free
          </div>
          <h1 className="page-hero-title mb-4">
            Free <span className="page-hero-highlight">Skill Assessment</span>
          </h1>
          <p className="page-hero-desc text-xl max-w-2xl leading-relaxed">
            Test your existing knowledge, identify your skill gaps, and get personalised course recommendations — all in 10 minutes or less.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <div className="page-hero-chip">6 Tech Domains</div>
            <div className="page-hero-chip">Instant Score & Feedback</div>
            <div className="page-hero-chip">Tailored Course Guidance</div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container-xl max-w-4xl">

          {/* Topic Selection */}
          {state === 'select' && (
            <>
              <div className="text-center mb-10">
                <h2 className="display-sm mb-3">Choose a Topic to Assess</h2>
                <p className="text-surface-600 font-medium">Each quiz has 10 questions and takes about 10 minutes. Results are instant.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {quizTopics.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleStart(topic.id)}
                    className="text-left p-6 bg-white border-2 border-surface-200 rounded-2xl hover:border-brand-500 hover:shadow-card-md transition-all group"
                  >
                    <div className="text-3xl mb-3">{topic.icon}</div>
                    <h3 className="font-display font-bold text-surface-900 group-hover:text-brand-700 mb-1">{topic.title}</h3>
                    <p className="text-sm text-surface-600 font-medium mb-3">{topic.questions} questions · {topic.duration}</p>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      topic.level === 'Beginner' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {topic.level}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-10 bg-surface-50 border border-surface-200 rounded-2xl p-6 text-center">
                <p className="text-surface-700 font-medium mb-4">Want a personalised career assessment by an expert counsellor?</p>
                <Link to="/contact">
                  <Button variant="secondary">Talk to a Career Advisor</Button>
                </Link>
              </div>
            </>
          )}

          {/* Quiz */}
          {state === 'quiz' && questions.length > 0 && (
            <div className="max-w-2xl mx-auto">
              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-surface-800">
                    Question {currentQ + 1} of {questions.length}
                  </span>
                  <button onClick={handleReset} className="text-sm font-semibold text-surface-600 hover:text-surface-900 flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Change topic
                  </button>
                </div>
                <div className="w-full bg-surface-100 rounded-full h-2">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-2xl border border-surface-200 p-8 shadow-card-sm">
                <h2 className="font-display font-bold text-xl text-surface-900 mb-6">
                  {questions[currentQ].question}
                </h2>
                <div className="space-y-3 mb-6">
                  {questions[currentQ].options.map((option, idx) => {
                    let cls = 'w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all ';
                    if (selectedOption === null) {
                      cls += 'border-surface-200 hover:border-brand-500 hover:bg-brand-50 cursor-pointer text-surface-900';
                    } else if (idx === questions[currentQ].correct) {
                      cls += 'border-green-600 bg-green-50 text-green-900 font-semibold';
                    } else if (idx === selectedOption) {
                      cls += 'border-red-500 bg-red-50 text-red-900 font-semibold';
                    } else {
                      cls += 'border-surface-200 bg-surface-50 text-surface-500 cursor-default';
                    }
                    return (
                      <button key={idx} className={cls} onClick={() => handleAnswer(idx)}>
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            selectedOption !== null && idx === questions[currentQ].correct
                              ? 'border-green-600 bg-green-600 text-white'
                              : selectedOption === idx && idx !== questions[currentQ].correct
                                ? 'border-red-500 bg-red-500 text-white'
                                : 'border-surface-300'
                          }`}>
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span>{option}</span>
                          {selectedOption !== null && idx === questions[currentQ].correct && (
                            <CheckCircle className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />
                          )}
                          {selectedOption === idx && idx !== questions[currentQ].correct && (
                            <XCircle className="w-4 h-4 text-red-600 ml-auto flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-900 font-medium">
                      <strong className="font-bold">Explanation:</strong> {questions[currentQ].explanation}
                    </p>
                  </div>
                )}

                <Button onClick={handleNext} disabled={selectedOption === null} fullWidth>
                  {currentQ + 1 >= questions.length ? 'View Results' : 'Next Question'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {state === 'result' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-surface-200 p-8 shadow-card-lg text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-6 relative">
                  <Award className="w-12 h-12 text-brand-600" />
                </div>
                <h2 className="font-display font-bold text-3xl text-surface-900 mb-2">
                  {score} / {questions.length}
                </h2>
                <div className="text-xl mb-2">
                  <ScoreBadge score={score} total={questions.length} />
                </div>
                <p className="text-surface-600 font-medium mb-6">
                  You answered {score} out of {questions.length} questions correctly ({Math.round((score / questions.length) * 100)}%).
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Button onClick={() => handleStart(selectedTopic)} variant="secondary">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry Quiz
                  </Button>
                  <Button onClick={handleReset}>
                    Try Another Topic
                  </Button>
                </div>
              </div>

              {/* Answer Review */}
              <div className="mb-8">
                <h3 className="font-display font-bold text-xl mb-4">Answer Review</h3>
                <div className="space-y-4">
                  {answers.map((a, i) => (
                    <div
                      key={i}
                      className={`rounded-xl p-4 border ${a.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
                    >
                      <div className="flex items-start gap-3">
                        {a.correct
                          ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <p className="text-sm font-medium text-surface-900 mb-1">{questions[i].question}</p>
                          <p className="text-xs text-surface-600">
                            Your answer: <span className={a.correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                              {questions[i].options[a.selected]}
                            </span>
                          </p>
                          {!a.correct && (
                            <p className="text-xs text-surface-600 mt-0.5">
                              Correct answer: <span className="text-green-700 font-medium">{questions[i].options[questions[i].correct]}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendation */}
              <CourseRecommendation topicId={selectedTopic} score={score} total={questions.length} />

              {/* Share score */}
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 bg-surface-50 rounded-xl px-4 py-3">
                  <TrendingUp className="w-4 h-4 text-brand-500" />
                  <span className="text-sm text-surface-600">
                    Scored <strong>{Math.round((score / questions.length) * 100)}%</strong> in {quizTopics.find(t => t.id === selectedTopic)?.title} skill assessment
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
