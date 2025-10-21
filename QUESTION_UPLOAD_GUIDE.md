# Question Bulk Upload Guide

The admin interface supports two methods for bulk uploading questions:

## 1. CSV/Excel Upload

Upload structured data in CSV or Excel format with the following columns:

### Required Columns:

- `question`: The question text
- `type`: Question type (multiple_choice, true_false, short_answer, essay, fill_blanks)
- `correct_answer`: The correct answer

### Optional Columns:

- `options`: For multiple choice questions, JSON array of options or comma-separated values
- `explanation`: Explanation for the correct answer
- `points`: Point value (defaults to 1)
- `order`: Question order (auto-assigned if not provided)

### Example CSV Format:

```csv
question,type,options,correct_answer,explanation,points,order
"What is the capital of France?",multiple_choice,"[""Paris"",""London"",""Berlin"",""Madrid""]","Paris","Paris is the capital and most populous city of France.",1,1
"The Earth is round. True or False?",true_false,,"true","Scientific evidence confirms the Earth is an oblate spheroid.",1,2
"Explain the process of photosynthesis.",essay,,,"Photosynthesis is the process by which plants convert light energy into chemical energy.",5,3
"What is 2 + 2?",short_answer,,"4","Basic arithmetic operation.",1,4
```

## 2. Document Upload (AI-Powered)

Upload PDF, DOCX, or TXT files containing questions. The system will:

- Extract text from the document
- Parse questions using pattern recognition
- Automatically create multiple choice questions
- Extract options and identify correct answers marked with \*\*

### Document Format Guidelines:

- Format questions as "Question X: Question text"
- Format options as "a) Option text", "b) Option text", etc.
- Mark the correct answer with \*\* at the end of the option line
- Separate questions with blank lines
- Supports 3-4 options per question

### Example Document Text:

```
Question 1:
What type of dressing is most appropriate for a blister?
a) Hydrocolloid or foam dressing **
b) No dressing
c) Silver dressing

Question 2:
When do you observe P waves appearing before the QRS complex?
a) Fibrillation
b) Afibrillation
c) Flat asystole
d) Continuous fluctuation **

Question 3:
The Working Time Directive falls under which policy area?
a) Equality and diversity
b) Freedom of info
c) Health and safety **
d) Human resource
```

## Usage Instructions:

1. Select an exam from the dropdown
2. Choose upload type (CSV/Excel or Document)
3. Click "Choose File" and select your file
4. Click "Upload" to process the questions
5. Questions will be automatically added to the selected exam with proper ordering

## Notes:

- CSV/Excel uploads provide precise control over question structure
- Document uploads are convenient for existing question banks but may require manual review
- All uploaded questions are automatically ordered after existing questions
- Invalid rows in CSV files are skipped with error logging
