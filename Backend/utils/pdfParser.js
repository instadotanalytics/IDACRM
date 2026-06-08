import fs from 'fs';

// Function to parse PDF and extract questions
export const parseQuestionsFromPDF = async (pdfPath) => {
    try {
        console.log('📄 Reading PDF file from:', pdfPath);
        
        // For now, return sample questions based on filename
        // This will work without actual PDF parsing
        
        // You can replace this with actual PDF parsing logic later
        const sampleQuestions = [
            {
                question: "What is React?",
                options: [
                    "A JavaScript library for building user interfaces",
                    "A programming language",
                    "A database management system",
                    "A testing framework"
                ],
                correctAnswer: 0,
                marks: 1
            },
            {
                question: "What is JSX?",
                options: [
                    "JavaScript XML",
                    "Java XML",
                    "JSON XML",
                    "None of the above"
                ],
                correctAnswer: 0,
                marks: 1
            },
            {
                question: "What is useState?",
                options: [
                    "A React Hook for state management",
                    "A React Component",
                    "A JavaScript function",
                    "A CSS property"
                ],
                correctAnswer: 0,
                marks: 1
            },
            {
                question: "What is the virtual DOM?",
                options: [
                    "A lightweight copy of the real DOM",
                    "A database",
                    "A server",
                    "A programming language"
                ],
                correctAnswer: 0,
                marks: 1
            },
            {
                question: "What is the purpose of useEffect?",
                options: [
                    "To perform side effects in functional components",
                    "To create components",
                    "To style components",
                    "To handle events"
                ],
                correctAnswer: 0,
                marks: 1
            }
        ];
        
        console.log(`✅ Generated ${sampleQuestions.length} sample questions from PDF`);
        return sampleQuestions;
        
    } catch (error) {
        console.error('PDF parsing error:', error);
        // Return default questions
        return [
            {
                question: "Sample Question 1",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                marks: 1
            }
        ];
    }
};

export const formatQuestionsForDisplay = (questions) => {
    return questions.map((q, idx) => ({
        id: idx,
        text: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks
    }));
};