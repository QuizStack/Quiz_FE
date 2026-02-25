import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setQuizzes } from "../redux/quizSlice";
import axios from "axios";
import { Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";

function QuizListPage() {
  const { quizzes } = useSelector(state => state.quiz);
  const { token, user } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredQuiz, setHoveredQuiz] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ======================
  // FETCH QUIZZES
  // ======================
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(setQuizzes(res.data));
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [dispatch, token]);

  // ======================
  // DELETE QUIZ
  // ======================
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(
          `http://localhost:3000/api/quizzes/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // reload list
        const res = await axios.get("http://localhost:3000/api/quizzes", {
          headers: { Authorization: `Bearer ${token}` }
        });

        dispatch(setQuizzes(res.data));
      } catch (error) {
        alert("Failed to delete quiz");
      }
    }
  };

  // ======================
  // CREATE QUIZ (ADMIN)
  // ======================
  const handleCreateQuiz = async () => {
    const title = prompt("Enter quiz title:");
    if (!title) return;
    
    const description = prompt("Enter description (optional):");

    try {
      await axios.post(
        "http://localhost:3000/api/quizzes",
        { title, description: description || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get("http://localhost:3000/api/quizzes", {
        headers: { Authorization: `Bearer ${token}` }
      });

      dispatch(setQuizzes(res.data));
    } catch (error) {
      alert("Failed to create quiz");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Filter quizzes based on search
  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header Card */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            <div>
              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                margin: "0 0 10px 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                📚 Quiz Dashboard
              </h1>
              <p style={{
                fontSize: "1.1rem",
                color: "#666",
                margin: 0
              }}>
                Welcome back, <strong>{user?.username || user?.email || "Student"}</strong>! 
                You have {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'} available.
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                padding: "12px 30px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 6px rgba(220, 53, 69, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 8px rgba(220, 53, 69, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 6px rgba(220, 53, 69, 0.3)";
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Search and Create Section */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "25px",
          marginBottom: "30px",
          boxShadow: "0 4px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            {/* Search Bar */}
            <div style={{  minWidth: "100px" }}>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "1.2rem",
                  color: "#999"
                }}>
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 5px 10px 45px",
                    borderRadius: "10px",
                    border: "2px solid #e0e0e0",
                    fontSize: "1rem",
                    transition: "all 0.3s",
                    outline: "none"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>
            </div>

            {/* Create Quiz Button (Admin Only) */}
            {user?.admin && (
              <button
                onClick={handleCreateQuiz}
                style={{
                  padding: "15px 30px",
                  background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 6px rgba(40, 167, 69, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 8px rgba(40, 167, 69, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 6px rgba(40, 167, 69, 0.3)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>➕</span>
                Create New Quiz
              </button>
            )}
          </div>
        </div>

        {/* Quiz Grid */}
        {filteredQuizzes.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "60px",
            textAlign: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📭</div>
            <h3 style={{ color: "#666", marginBottom: "10px" }}>
              {searchTerm ? "No matching quizzes found" : "No quizzes available"}
            </h3>
            <p style={{ color: "#999" }}>
              {searchTerm ? "Try a different search term" : 
               user?.admin ? "Click 'Create New Quiz' to get started!" : 
               "Check back later for quizzes."}
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "25px"
          }}>
            {filteredQuizzes.map(quiz => (
              <div
                key={quiz._id}
                onMouseEnter={() => setHoveredQuiz(quiz._id)}
                onMouseLeave={() => setHoveredQuiz(null)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  padding: "10px",
                  boxShadow: hoveredQuiz === quiz._id ? 
                    "0 20px 30px rgba(0,0,0,0.2)" : 
                    "0 10px 20px rgba(0,0,0,0.1)",
                  transition: "all 0.3s",
                  transform: hoveredQuiz === quiz._id ? 
                    "translateY(-5px)" : 
                    "translateY(0)",
               
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  flexDirection: "column",
                 
                }}
              >
                {/* Quiz Icon */}
                <div style={{
                  fontSize: "3rem",
                  marginBottom: "15px",
                  textAlign: "center"
                }}>
                  📝
                </div>

                {/* Quiz Title */}
                <h3 style={{
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  marginBottom: "15px",
                  color: "#333",
                  textAlign: "center",
                  borderBottom: "2px solid #f0f0f0",
                  paddingBottom: "15px"
                }}>
                  {quiz.title}
                </h3>

                {/* Quiz Description (if available) */}
                {quiz.description && (
                  <p style={{
                    color: "#666",
                    marginBottom: "20px",
                    fontSize: "0.95rem",
                    lineHeight: "1.5",
                    flex: 1
                  }}>
                    {quiz.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "auto"
                }}>
                  <Link
                    to={`/quiz/${quiz._id}`}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "8px",
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                      transition: "all 0.3s",
                      border: "none",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    🚀 Start Quiz
                  </Link>

                  {user?.admin && (
                    <button
                      onClick={() => handleDelete(quiz._id)}
                      style={{
                        padding: "12px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.95rem",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 8px rgba(220, 53, 69, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Admin Badge (for admin view) */}
                {user?.admin && (
                  <div style={{
                    marginTop: "15px",
                    padding: "8px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    color: "#666",
                    textAlign: "center"
                  }}>
                    👑 Admin Access
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div style={{
          marginTop: "30px",
          textAlign: "center",
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.9rem"
        }}>
          <p>
            📊 Total Quizzes: {quizzes.length} | 
            👥 Active Users: 1 | 
            {user?.admin ? " 👑 Admin Mode" : " 🎓 Student Mode"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default QuizListPage;