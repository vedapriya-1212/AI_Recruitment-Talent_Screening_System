import { useState, useCallback } from 'react';

export type InterviewPhase = 'verification' | 'technical' | 'coding' | 'hr' | 'completed';

export function useInterviewEngine() {
  const [phase, setPhase] = useState<InterviewPhase>('verification');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  
  // Mock Questions
  const questions = [
    "Can you explain the differences between React's useMemo and useCallback hooks?",
    "Describe a time when you had to optimize a slow-performing web application.",
    "How do you handle state management in large scale applications?"
  ];

  const startInterview = useCallback(() => {
    setPhase('technical');
    setCurrentQuestionIndex(0);
  }, []);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('coding');
    }
  }, [currentQuestionIndex, questions.length]);

  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);

  return {
    phase,
    setPhase,
    currentQuestion: questions[currentQuestionIndex],
    currentQuestionIndex,
    totalQuestions: questions.length,
    isListening,
    startInterview,
    nextQuestion,
    toggleListening
  };
}
