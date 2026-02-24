"""
EduPulse AI – Performance Prediction Logic
Calculates performance score, learner category, risk level, and recommendation
"""


def calculate_performance_score(avg_marks: float, attendance: float, improvement_rate: float) -> float:
    """
    Formula:
      performance_score = (0.6 * avg_marks) + (0.3 * attendance) + (0.1 * improvement_rate)
    All inputs are expected in range 0–100.
    """
    score = (0.6 * avg_marks) + (0.3 * attendance) + (0.1 * improvement_rate)
    return round(score, 2)


def classify_learner(score: float) -> str:
    """
    Classify learner based on performance score:
      >= 75  → Fast Learner
      >= 50  → Average Learner
      < 50   → Slow Learner
    """
    if score >= 75:
        return "Fast Learner"
    elif score >= 50:
        return "Average Learner"
    else:
        return "Slow Learner"


def classify_risk(score: float) -> str:
    """
    Risk level based on performance score:
      >= 75  → Low
      >= 50  → Medium
      < 50   → High
    """
    if score >= 75:
        return "Low"
    elif score >= 50:
        return "Medium"
    else:
        return "High"


def generate_recommendation(category: str, risk: str, avg_marks: float, attendance: float) -> str:
    """
    Returns a personalised recommendation string based on learner category and risk level.
    """
    recommendations = {
        ("Fast Learner", "Low"): (
            "Outstanding performance! Consider enrolling in advanced courses, "
            "joining academic competitions, or exploring research projects to maximize your potential."
        ),
        ("Average Learner", "Medium"): (
            "Good effort! Focus on your weaker subjects, create a structured revision plan, "
            "and attend extra tutoring sessions to move to the next level."
        ),
        ("Slow Learner", "High"): (
            "Immediate action required. Schedule counselling sessions, build a daily study plan, "
            "improve attendance, and seek peer support or mentoring to get back on track."
        ),
    }

    # Attendance-specific addendum
    attendance_note = ""
    if attendance < 60:
        attendance_note = " Attendance is critically low — prioritize attending all classes."
    elif attendance < 75:
        attendance_note = " Improve attendance to boost overall performance."

    base = recommendations.get(
        (category, risk),
        "Keep up regular study habits, maintain good attendance, and communicate with your teacher for guidance."
    )
    return base + attendance_note


def predict(avg_marks: float, attendance: float, improvement_rate: float) -> dict:
    """
    End-to-end prediction pipeline.
    Returns a dictionary with performance_score, learner_category, risk_level, and recommendation.
    """
    score = calculate_performance_score(avg_marks, attendance, improvement_rate)
    category = classify_learner(score)
    risk = classify_risk(score)
    recommendation = generate_recommendation(category, risk, avg_marks, attendance)

    return {
        "performance_score": score,
        "learner_category": category,
        "risk_level": risk,
        "recommendation": recommendation,
    }
