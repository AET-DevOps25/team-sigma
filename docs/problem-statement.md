# 📝 Problem Statement

## **⚠️ Deadline for submission: 16 May 2025**

---

## 1\. Team Information

### Team Members:

* Maria Pospelova  
* Simon Huang  
* Alexander Steinhauer

---

## 2\. Problem Statement (max. 5 sentences)

**Our application supports students in preparing for exams by transforming lecture slides into personalized study aids.**  
It offers concise summaries of slide content and provides an interactive AI-powered tutor that answers questions, quizzes students, and adapts to their learning pace.

**Main functionality:**

* Converts slides into digestible summaries  
* Enables active recall through quizzes and flashcards  
* Offers a conversational AI tutor for clarification and guidance

**Intended users:**

* University and high school students preparing for exams

**GenAI integration:**  
We use GenAI to generate accurate, context-aware summaries and to power the smart tutor, which provides personalized explanations, identifies knowledge gaps, and adapts study material based on user interaction.

---

## 3\. High-Level Functional Points

Our application will provide the following main functional requirements.

* User can sign up, log in  
* User can upload lecture slides  
* Create AI based summary out of lecture slides  
* Chatbot for each uploaded lecture to clarify lecture concepts  
* Create AI based quizzes for lecture slides  
* User can view all lecture slides they have ever uploaded and chat with respective bots  
* Users should be able to share and add material to the same lecture

---

## 4\. Initial System Structure (Text and Diagram)

* **Server:** Spring Boot REST API  
* **Client:** React v19 \+ Vite \+ Tailwind \+ Tanstack Router \+ Clerk  
* **GenAI Service:** Python, LangChain microservice  
* **Database:** PostgreSQL \+ Weaviate (Vector DB)  
* **Authentication/Usermanagement:** with Clerk

Include a first UML diagram (Component Diagram / Subsystem Decomposition). You can use tools like [PlantUML](https://plantuml.com/) or embed an image.

---

## 📅 Important Notes

* This is your first version. You will be allowed to adjust your design later.  
* This document must be stored in your team’s GitHub repository (e.g., `/docs/initial_concept.md`).

