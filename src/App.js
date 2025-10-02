import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, Clock, FileText, User, Mail, Phone, Trophy, Search, ArrowLeft, AlertCircle } from 'lucide-react';

const QUESTIONS_BANK = {
  easy: [
    "What is the difference between let, const, and var in JavaScript?",
    "Explain the virtual DOM in React and why it's useful.",
    "What is the purpose of package.json in a Node.js project?",
    "How do you handle asynchronous operations in JavaScript?"
  ],
  medium: [
    "Explain React hooks (useState, useEffect) and when you would use them.",
    "What is middleware in Express.js? Provide an example.",
    "How would you optimize the performance of a React application?",
    "Explain the concept of closures in JavaScript with an example."
  ],
  hard: [
    "Design a scalable REST API architecture for a social media platform. What considerations would you make?",
    "Explain how you would implement real-time features using WebSockets in a Node.js application.",
    "How would you handle authentication and authorization in a full-stack application? Discuss JWT vs sessions.",
    "Describe your approach to database design for a multi-tenant SaaS application."
  ]
};

const DIFFICULTY_CONFIG = {
  easy: { time: 20, label: 'Easy' },
  medium: { time: 60, label: 'Medium' },
  hard: { time: 120, label: 'Hard' }
};

const scoreAnswer = (question, answer, difficulty) => {
  if (!answer || answer.trim().length < 10) return 0;
  const words = answer.toLowerCase().split(' ');
  const keywords = ['react', 'node', 'javascript', 'async', 'api', 'database', 'function', 'component', 'state', 'express', 'middleware', 'performance', 'optimization'];
  const keywordCount = words.filter(w => keywords.includes(w)).length;
  let baseScore = Math.min(100, (answer.length / 50) * 30 + keywordCount * 10);
  if (difficulty === 'easy') baseScore = Math.min(100, baseScore * 1.2);
  else if (difficulty === 'hard') baseScore = Math.min(100, baseScore * 0.8);
  return Math.round(baseScore);
};

const extractTextFromFile = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = {
        name: Math.random() > 0.5 ? 'John Doe' : '',
        email: Math.random() > 0.3 ? 'john.doe@example.com' : '',
        phone: Math.random() > 0.4 ? '+1234567890' : ''
      };
      resolve(mockData);
    }, 1000);
  });
};

const generateSummary = (candidate) => {
  const avgScore = candidate.finalScore;
  let performance = 'Good';
  if (avgScore >= 80) performance = 'Excellent';
  else if (avgScore >= 60) performance = 'Good';
  else if (avgScore >= 40) performance = 'Average';
  else performance = 'Needs Improvement';
  return `${candidate.name} demonstrated ${performance.toLowerCase()} understanding of full-stack development concepts. Score: ${avgScore}/100. ${avgScore >= 60 ? 'Recommended for next round.' : 'May need additional training.'}`;
};

function App() {
  const [activeTab, setActiveTab] = useState('interviewee');
  const [candidates, setCandidates] = useState([]);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [interviewState, setInterviewState] = useState('upload');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [missingFields, setMissingFields] = useState([]);
  const [collectingField, setCollectingField] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedCandidates = JSON.parse(sessionStorage.getItem('candidates') || '[]');
    const savedCurrentCandidate = JSON.parse(sessionStorage.getItem('currentCandidate') || 'null');
    const savedMessages = JSON.parse(sessionStorage.getItem('messages') || '[]');
    const savedInterviewState = sessionStorage.getItem('interviewState') || 'upload';
    const savedCurrentQuestion = parseInt(sessionStorage.getItem('currentQuestion') || '0');
    const savedTimeLeft = parseInt(sessionStorage.getItem('timeLeft') || '0');
    if (savedCandidates.length > 0) setCandidates(savedCandidates);
    if (savedCurrentCandidate && savedInterviewState !== 'completed') {
      setShowWelcomeBack(true);
      setCurrentCandidate(savedCurrentCandidate);
      setMessages(savedMessages);
      setInterviewState(savedInterviewState);
      setCurrentQuestion(savedCurrentQuestion);
      setTimeLeft(savedTimeLeft);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('candidates', JSON.stringify(candidates));
    sessionStorage.setItem('currentCandidate', JSON.stringify(currentCandidate));
    sessionStorage.setItem('messages', JSON.stringify(messages));
    sessionStorage.setItem('interviewState', interviewState);
    sessionStorage.setItem('currentQuestion', currentQuestion.toString());
    sessionStorage.setItem('timeLeft', timeLeft.toString());
  }, [candidates, currentCandidate, messages, interviewState, currentQuestion, timeLeft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (interviewState === 'interview' && timeLeft > 0 && currentCandidate && currentCandidate.questions && currentCandidate.questions[currentQuestion]) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    
    if (timeLeft === 0 && interviewState === 'interview' && currentCandidate && currentCandidate.questions && currentCandidate.questions[currentQuestion]) {
      handleAutoSubmit();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewState, timeLeft, currentQuestion, currentCandidate]);

  const addMessage = (text, sender, type = 'text') => {
    setMessages(prev => [...prev, { text, sender, type, timestamp: Date.now() }]);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.match(/\.(pdf|docx)$/i)) {
      addMessage('Please upload a PDF or DOCX file.', 'ai', 'error');
      return;
    }
    setUploadedFile(file);
    addMessage(`Uploaded: ${file.name}`, 'user', 'file');
    addMessage('Processing your resume...', 'ai');
    try {
      const extractedData = await extractTextFromFile(file);
      const missing = [];
      if (!extractedData.name) missing.push('name');
      if (!extractedData.email) missing.push('email');
      if (!extractedData.phone) missing.push('phone');
      const candidate = {
        id: Date.now(),
        ...extractedData,
        fileName: file.name,
        questions: [],
        finalScore: 0,
        status: 'in-progress',
        startTime: Date.now()
      };
      setCurrentCandidate(candidate);
      if (missing.length > 0) {
        setMissingFields(missing);
        setCollectingField(missing[0]);
        setInterviewState('collect-info');
        addMessage(`I extracted some information from your resume. However, I need your ${missing[0]}. Please provide it:`, 'ai');
      } else {
        addMessage(`Great! I found all your details:\n• Name: ${extractedData.name}\n• Email: ${extractedData.email}\n• Phone: ${extractedData.phone}`, 'ai');
        startInterview(candidate);
      }
    } catch (error) {
      addMessage('Error processing resume. Please try again.', 'ai', 'error');
    }
  };

  const handleCollectInfo = (value) => {
    if (!value.trim()) return;
    const fieldIndex = missingFields.indexOf(collectingField);
    setCurrentCandidate(prev => ({ ...prev, [collectingField]: value }));
    addMessage(value, 'user');
    addMessage(`Thank you! Got your ${collectingField}.`, 'ai');
    if (fieldIndex < missingFields.length - 1) {
      const nextField = missingFields[fieldIndex + 1];
      setCollectingField(nextField);
      addMessage(`Now, please provide your ${nextField}:`, 'ai');
    } else {
      const updatedCandidate = { ...currentCandidate, [collectingField]: value };
      setCurrentCandidate(updatedCandidate);
      addMessage('Perfect! All information collected. Starting interview in 3 seconds...', 'ai');
      setTimeout(() => startInterview(updatedCandidate), 3000);
    }
    setInputValue('');
  };

  const startInterview = (candidate) => {
    setInterviewState('interview');
    addMessage('Welcome to your Full Stack Developer interview! You will answer 6 questions: 2 Easy, 2 Medium, and 2 Hard.', 'ai');
    setTimeout(() => askQuestion(0, candidate), 2000);
  };

  const askQuestion = (questionIndex, candidate) => {
    const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
    const difficulty = difficulties[questionIndex];
    const questionPool = QUESTIONS_BANK[difficulty];
    const question = questionPool[Math.floor(Math.random() * questionPool.length)];
    const updatedCandidate = {
      ...candidate,
      questions: [...(candidate.questions || []), { question, difficulty, answer: '', score: 0, timeSpent: 0 }]
    };
    setCurrentCandidate(updatedCandidate);
    setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
    addMessage(`Question ${questionIndex + 1}/6 (${DIFFICULTY_CONFIG[difficulty].label} - ${DIFFICULTY_CONFIG[difficulty].time}s):\n${question}`, 'ai', 'question');
  };

  const handleAutoSubmit = () => {
    if (interviewState !== 'interview' || !currentCandidate || !currentCandidate.questions || !currentCandidate.questions[currentQuestion]) return;
    addMessage(inputValue || 'No answer provided', 'user');
    addMessage('Time\'s up! Moving to next question...', 'ai', 'warning');
    const score = scoreAnswer(currentCandidate.questions[currentQuestion].question, inputValue, currentCandidate.questions[currentQuestion].difficulty);
    submitAnswer(inputValue, score);
  };

  const handleAnswerSubmit = () => {
    if (!inputValue.trim() || interviewState !== 'interview') return;
    addMessage(inputValue, 'user');
    const score = scoreAnswer(currentCandidate.questions[currentQuestion].question, inputValue, currentCandidate.questions[currentQuestion].difficulty);
    addMessage(`Answer recorded! Score: ${score}/100`, 'ai', 'success');
    submitAnswer(inputValue, score);
  };

  const submitAnswer = (answer, score) => {
    const updatedQuestions = [...currentCandidate.questions];
    updatedQuestions[currentQuestion] = {
      ...updatedQuestions[currentQuestion],
      answer,
      score,
      timeSpent: DIFFICULTY_CONFIG[updatedQuestions[currentQuestion].difficulty].time - timeLeft
    };
    const updatedCandidate = { ...currentCandidate, questions: updatedQuestions };
    setCurrentCandidate(updatedCandidate);
    setInputValue('');
    clearInterval(timerRef.current);
    if (currentQuestion < 5) {
      setCurrentQuestion(prev => prev + 1);
      setTimeout(() => askQuestion(currentQuestion + 1, updatedCandidate), 2000);
    } else {
      completeInterview(updatedCandidate);
    }
  };

  const completeInterview = (candidate) => {
    const totalScore = candidate.questions.reduce((sum, q) => sum + q.score, 0);
    const finalScore = Math.round(totalScore / 6);
    const summary = generateSummary({ ...candidate, finalScore });
    const completedCandidate = { ...candidate, finalScore, summary, status: 'completed', endTime: Date.now() };
    setCandidates(prev => [...prev, completedCandidate]);
    setCurrentCandidate(completedCandidate);
    setInterviewState('completed');
    addMessage(`Interview completed! Your final score: ${finalScore}/100`, 'ai', 'success');
    addMessage(summary, 'ai');
  };

  const handleSendMessage = () => {
    if (interviewState === 'collect-info') {
      handleCollectInfo(inputValue);
    } else if (interviewState === 'interview') {
      handleAnswerSubmit();
    }
  };

  const resetInterview = () => {
    setCurrentCandidate(null);
    setMessages([]);
    setInterviewState('upload');
    setCurrentQuestion(0);
    setTimeLeft(0);
    setUploadedFile(null);
    setMissingFields([]);
    setCollectingField(null);
    sessionStorage.clear();
  };

  const continueInterview = () => {
    setShowWelcomeBack(false);
    if (interviewState === 'interview') {
      const difficulties = ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'];
      const difficulty = difficulties[currentQuestion];
      if (timeLeft === 0) {
        setTimeLeft(DIFFICULTY_CONFIG[difficulty].time);
      }
    }
  };

  const filteredCandidates = candidates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {showWelcomeBack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
            <p className="text-gray-600 mb-6">You have an unfinished interview. Would you like to continue where you left off?</p>
            <div className="flex gap-3">
              <button onClick={continueInterview} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">Continue</button>
              <button onClick={() => { setShowWelcomeBack(false); resetInterview(); }} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">Start Fresh</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">AI Interview Assistant</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('interviewee')} className={`px-6 py-2 rounded-t-lg font-medium transition ${activeTab === 'interviewee' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Interviewee</button>
            <button onClick={() => setActiveTab('interviewer')} className={`px-6 py-2 rounded-t-lg font-medium transition ${activeTab === 'interviewer' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>Interviewer Dashboard</button>
          </div>
        </div>
      </div>
      {activeTab === 'interviewee' && (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <h2 className="text-xl font-semibold">Interview Chat</h2>
              {interviewState === 'interview' && (
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-mono">Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                  <span className="ml-4">Question {currentQuestion + 1}/6</span>
                </div>
              )}
            </div>
            <div className="h-96 overflow-y-auto p-4 bg-gray-50">
              {interviewState === 'upload' && messages.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Your Interview!</h3>
                  <p className="text-gray-600 mb-6">Upload your resume (PDF or DOCX) to get started</p>
                  <label className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition">
                    <Upload className="w-5 h-5 inline mr-2" />Upload Resume
                    <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : msg.type === 'error' ? 'bg-red-100 text-red-800' : msg.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-white text-gray-800 shadow'}`}>
                    {msg.type === 'question' && <AlertCircle className="w-5 h-5 inline mr-2" />}
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {(interviewState === 'collect-info' || interviewState === 'interview') && (
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={interviewState === 'collect-info' ? `Enter your ${collectingField}...` : 'Type your answer...'} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={handleSendMessage} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            )}
            {interviewState === 'completed' && (
              <div className="p-4 bg-white border-t text-center">
                <button onClick={resetInterview} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium">Start New Interview</button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'interviewer' && (
        <div className="container mx-auto px-4 py-6">
          {!selectedCandidate ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <h2 className="text-xl font-semibold">Candidates ({filteredCandidates.length})</h2>
                </div>
                {filteredCandidates.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No candidates yet. Complete an interview to see results here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCandidates.map((candidate) => (
                          <tr key={candidate.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <User className="w-5 h-5 text-gray-400 mr-2" />
                                <span className="font-medium text-gray-900">{candidate.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-gray-600"><Mail className="w-4 h-4 inline mr-1" />{candidate.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-600"><Phone className="w-4 h-4 inline mr-1" />{candidate.phone}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${candidate.finalScore >= 80 ? 'bg-green-100 text-green-800' : candidate.finalScore >= 60 ? 'bg-blue-100 text-blue-800' : candidate.finalScore >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{candidate.finalScore}/100</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button onClick={() => setSelectedCandidate(candidate)} className="text-blue-600 hover:text-blue-800 font-medium">View Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCandidate(null)} className="hover:bg-white hover:bg-opacity-20 p-2 rounded"><ArrowLeft className="w-5 h-5" /></button>
                  <h2 className="text-xl font-semibold">{selectedCandidate.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedCandidate.finalScore}/100</div>
                  <div className="text-sm opacity-90">Final Score</div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Mail className="w-4 h-4 inline text-gray-500 mr-2" /><span className="text-gray-700">{selectedCandidate.email}</span></div>
                    <div><Phone className="w-4 h-4 inline text-gray-500 mr-2" /><span className="text-gray-700">{selectedCandidate.phone}</span></div>
                    <div><FileText className="w-4 h-4 inline text-gray-500 mr-2" /><span className="text-gray-700">{selectedCandidate.fileName}</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Summary</h3>
                  <p className="text-gray-700">{selectedCandidate.summary}</p>
                </div>
                <h3 className="font-semibold text-gray-800 mb-4">Interview Responses</h3>
                <div className="space-y-4">
                  {selectedCandidate.questions.map((q, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-700">Question {idx + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${q.difficulty === 'easy' ? 'bg-green-100 text-green-800' : q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{q.difficulty.toUpperCase()}</span>
                      </div>
                      <p className="text-gray-800 mb-3 font-medium">{q.question}</p>
                      <div className="bg-gray-50 rounded p-3 mb-2">
                        <p className="text-sm text-gray-600 mb-1">Answer:</p>
                        <p className="text-gray-800">{q.answer || 'No answer provided'}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Time spent: {q.timeSpent}s / {DIFFICULTY_CONFIG[q.difficulty].time}s</span>
                        <span className={`font-semibold ${q.score >= 80 ? 'text-green-600' : q.score >= 60 ? 'text-blue-600' : q.score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>Score: {q.score}/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;