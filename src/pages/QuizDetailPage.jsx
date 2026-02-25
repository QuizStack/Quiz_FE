import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

function QuizDetailPage() {
  const { id } = useParams();
  const { token, user } = useSelector((state) => state.auth);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Form thêm / sửa
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [form, setForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
  });

  const isAdmin = user?.admin === true;

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/questions/quiz/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, [id, token]);

  useEffect(() => {
    if (token) fetchQuestions();
  }, [id, token, fetchQuestions]);

  // ─── Form handlers ────────────────────────────────────────
  const handleTextChange = (e) => {
    setForm((prev) => ({ ...prev, text: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const newOpts = [...prev.options];
      newOpts[index] = value;
      return { ...prev, options: newOpts };
    });
  };

  const handleCorrectIndexChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setForm((prev) => ({ ...prev, correctAnswerIndex: isNaN(val) ? 0 : val }));
  };

  const resetForm = () => {
    setForm({
      text: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    });
    setIsEditing(false);
    setEditingQuestionId(null);
  };

  const startEdit = (q) => {
    setForm({
      text: q.text,
      options: [...q.options],
      correctAnswerIndex: q.correctAnswerIndex,
    });
    setIsEditing(true);
    setEditingQuestionId(q._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.text.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }
    if (form.options.some((opt) => !opt.trim())) {
      alert("Vui lòng điền đầy đủ các lựa chọn");
      return;
    }
    if (
      form.correctAnswerIndex < 0 ||
      form.correctAnswerIndex >= form.options.length
    ) {
      alert("Chỉ số đáp án đúng không hợp lệ");
      return;
    }

    const payload = {
      quizId: id,
      text: form.text.trim(),
      options: form.options.map((o) => o.trim()),
      correctAnswerIndex: form.correctAnswerIndex,
    };

    try {
      if (isEditing) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/questions/${editingQuestionId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/questions`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (qId) => {
    if (!window.confirm("Xác nhận xóa câu hỏi này?")) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/questions/${qId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (err) {
      alert("Lỗi xóa: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
      alert("Bài quiz chưa có câu hỏi nào.");
      return;
    }
    
    let calculatedScore = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswerIndex) calculatedScore++;
    });
    
    setScore(calculatedScore);
    setShowResults(true);
    
    const percent = Math.round((calculatedScore / questions.length) * 100);
    console.log(`Quiz completed with ${percent}% score`);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "#28a745";
    if (percentage >= 60) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div style={{
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "40px 20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "15px",
        padding: "30px",
        marginBottom: "30px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "700", margin: "0 0 10px 0" }}>
          📝 Quiz Questions
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: "0.9", margin: 0 }}>
          {questions.length} {questions.length === 1 ? 'question' : 'questions'} available
        </p>
      </div>

      {/* Admin Form */}
      {isAdmin && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "30px",
          marginBottom: "30px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0"
        }}>
          <h3 style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            marginBottom: "25px",
            color: "#333",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{
              backgroundColor: isEditing ? "#ffc107" : "#28a745",
              color: "white",
              padding: "5px 15px",
              borderRadius: "20px",
              fontSize: "0.9rem"
            }}>
              {isEditing ? "✏️ EDITING" : "➕ NEW QUESTION"}
            </span>
          </h3>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555",
              fontSize: "0.95rem"
            }}>
              Question Text:
            </label>
            <textarea
              rows="3"
              value={form.text}
              onChange={handleTextChange}
              placeholder="Enter your question here..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                fontSize: "1rem",
                transition: "border-color 0.3s",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555",
              fontSize: "0.95rem"
            }}>
              Options:
            </label>
            {form.options.map((opt, idx) => (
              <div key={idx} style={{ marginBottom: "10px", position: "relative" }}>
                <span style={{
                  position: "absolute",
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: idx === form.correctAnswerIndex ? "#28a745" : "#6c757d",
                  color: "white",
                  width: "24px",
                  height: "24px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 45px",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "1rem",
                    backgroundColor: idx === form.correctAnswerIndex ? "#f0fff4" : "white",
                    transition: "all 0.3s",
                    outline: "none"
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#555",
              fontSize: "0.95rem"
            }}>
              Correct Answer Index (0-{form.options.length - 1}):
            </label>
            <input
              type="number"
              min="0"
              max={form.options.length - 1}
              value={form.correctAnswerIndex}
              onChange={handleCorrectIndexChange}
              style={{
                padding: "10px",
                width: "100px",
                borderRadius: "8px",
                border: "2px solid #e0e0e0",
                fontSize: "1rem",
                textAlign: "center"
              }}
            />
            <small style={{ marginLeft: "15px", color: "#6c757d" }}>
              (0 = first option, 1 = second, etc.)
            </small>
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={handleSave}
              style={{
                padding: "12px 30px",
                backgroundColor: isEditing ? "#ffc107" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "transform 0.2s, opacity 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
            >
              {isEditing ? "💾 Save Changes" : "➕ Add Question"}
            </button>

            {isEditing && (
              <button
                onClick={resetForm}
                style={{
                  padding: "12px 30px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "transform 0.2s, opacity 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                ❌ Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div style={{
          backgroundColor: "white",
          borderRadius: "15px",
          padding: "60px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>📭</div>
          <h3 style={{ color: "#666", marginBottom: "10px" }}>No Questions Yet</h3>
          <p style={{ color: "#999" }}>
            {isAdmin ? "Use the form above to add your first question!" : "Check back later for questions."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {questions.map((q, index) => {
            const isCorrect = showResults && answers[q._id] === q.correctAnswerIndex;
            
            return (
              <div
                key={q._id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  border: showResults ? 
                    (isCorrect ? "3px solid #28a745" : "3px solid #dc3545") : 
                    "1px solid #e0e0e0",
                  transition: "transform 0.2s",
                  position: "relative"
                }}
              >
                {/* Question Number Badge */}
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "20px",
                  backgroundColor: "#667eea",
                  color: "white",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}>
                  Question {index + 1}
                </div>

                {/* Question Text */}
                <h4 style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  margin: "10px 0 20px 0",
                  color: "#333",
                  lineHeight: "1.5"
                }}>
                  {q.text}
                </h4>

                {/* Options */}
                <div style={{ marginLeft: "10px" }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q._id] === optIdx;
                    const isCorrectAnswer = showResults && optIdx === q.correctAnswerIndex;
                    
                    let optionStyle = {
                      padding: "12px 15px",
                      marginBottom: "8px",
                      borderRadius: "8px",
                      border: "2px solid #e0e0e0",
                      cursor: isAdmin ? "default" : "pointer",
                      transition: "all 0.2s",
                      backgroundColor: "white"
                    };

                    if (!isAdmin && !showResults) {
                      if (isSelected) {
                        optionStyle.backgroundColor = "#e3f2fd";
                        optionStyle.borderColor = "#2196f3";
                      } else {
                        optionStyle.backgroundColor = "#f8f9fa";
                      }
                    }

                    if (showResults) {
                      if (isCorrectAnswer) {
                        optionStyle.backgroundColor = "#d4edda";
                        optionStyle.borderColor = "#28a745";
                      } else if (isSelected && !isCorrectAnswer) {
                        optionStyle.backgroundColor = "#f8d7da";
                        optionStyle.borderColor = "#dc3545";
                      }
                    }

                    return (
                      <div
                        key={optIdx}
                        onClick={() => {
                          if (!isAdmin && !showResults) {
                            setAnswers((prev) => ({ ...prev, [q._id]: optIdx }));
                          }
                        }}
                        style={optionStyle}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "14px",
                            backgroundColor: isSelected ? "#2196f3" : "#e0e0e0",
                            color: isSelected ? "white" : "#666",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "600",
                            fontSize: "0.9rem"
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span style={{ flex: 1 }}>{opt}</span>
                          {showResults && isCorrectAnswer && (
                            <span style={{ color: "#28a745", fontWeight: "600" }}>✓ Correct</span>
                          )}
                          {showResults && isSelected && !isCorrectAnswer && (
                            <span style={{ color: "#dc3545", fontWeight: "600" }}>✗ Wrong</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => startEdit(q)}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#ffc107",
                        color: "#333",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                      onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q._id)}
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "500",
                        transition: "transform 0.2s"
                      }}
                      onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                      onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Button & Results */}
      {questions.length > 0 && !isAdmin && (
        <div id="results-section">
          {!showResults ? (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <button
                onClick={handleSubmit}
                style={{
                  padding: "15px 50px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "30px",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(40, 167, 69, 0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s"
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
                🚀 Submit Quiz
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "30px",
              marginTop: "40px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              background: `linear-gradient(135deg, ${getScoreColor((score/questions.length)*100)}20 0%, white 100%)`
            }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "20px", color: "#333" }}>
                🎉 Your Results
              </h2>
              
              <div style={{
                width: "150px",
                height: "150px",
                borderRadius: "75px",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "700",
                color: "white",
                background: `linear-gradient(135deg, ${getScoreColor((score/questions.length)*100)}, ${getScoreColor((score/questions.length)*100)}dd)`,
                boxShadow: `0 4px 6px ${getScoreColor((score/questions.length)*100)}40`
              }}>
                {Math.round((score / questions.length) * 100)}%
              </div>
              
              <p style={{ fontSize: "1.3rem", marginBottom: "10px", color: "#555" }}>
                You got <strong style={{ color: getScoreColor((score/questions.length)*100) }}>{score}</strong> out of <strong>{questions.length}</strong> correct
              </p>
              
              <p style={{ fontSize: "1.1rem", color: "#666" }}>
                {score === questions.length ? "🌟 Perfect score! Excellent work!" :
                 score >= questions.length * 0.8 ? "👍 Great job! Well done!" :
                 score >= questions.length * 0.6 ? "📚 Good effort! Keep practicing!" :
                 "💪 Keep studying! You'll do better next time!"}
              </p>
              
              <button
                onClick={() => {
                  setShowResults(false);
                  setAnswers({});
                }}
                style={{
                  marginTop: "20px",
                  padding: "10px 30px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizDetailPage;