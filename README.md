PROJECT ARCHITECTURE:
<img width="2213" height="969" alt="image" src="https://github.com/user-attachments/assets/2d646901-7a6c-4217-80dd-560f170ed2a3" />

Folder Content:
Trained classification model code.

Work Completed:

Developed the classification model to categorize device-related risks into:
- Class 1: Recall
- Class 2: Field Safety Device
- Class 3: Safety Alert
Handled date parsing in datasets.
Added functionality for:
-Risk percentage calculation
-Alerts generation
-Timeline for alert retention (days to be kept in the system)


Outputs of risk prediction.
Documentation of Day 3 progress.
=======
# Predicting Medical Equipment Failure – Hackathon Project

This repository contains our project developed during the 10-day Cognizant NPN AI Hackathon 2025, focused on predicting medical equipment failures using ML models for proactive interventions.

---

## Repository Structure
- Day 1/ – Data collection, initial preprocessing, documentation, and UI glimpse.  
- Day 2/ – Full preprocessing of datasets and Medical Risk Dashboard planning.  
- Day 3/ – Model development, risk classification, and alert handling.  
- (Further days will be updated as progress continues.)  

---

## Daily Progress

### 📂 Day 1 – Data Collection & Preprocessing
- Uploaded 3 CSV datasets: `Devices.csv`, `Events.csv`, `Manufacture.csv`.  
- Preprocessed `Events.csv` (selected key columns, normalized formats).  
- Prepared Day 1 documentation on collection, preprocessing, and planned workflows.  
- Added a draft UI glimpse for the Medical Risk Dashboard.  

---

### 📂 Day 2 – Advanced Preprocessing & UI Planning
- Completed preprocessing of `Devices.csv` and `Manufacture.csv`.  
- Finalized preprocessing of `Events.csv`.  
- Uploaded images of processed datasets.  
- Planned the initial design for the Medical Risk Dashboard UI layout.  

---

### 📂 Day 3 – Model Development
- Built a classification model with 3 output classes:  
  - Class 1: Recall  
  - Class 2: Field Safety Device  
  - Class 3: Safety Alert  
- Implemented date parsing and risk percentage calculation.  
- Added alert mechanisms, including number of days for retention.  
- Structured the UI in React.js and completed its initial development to some extent.  

---

## Next Steps
- Integrate model with the Medical Risk Dashboard UI.  
- Deploy model on cloud for real-time prediction.  
- Extend dataset coverage and improve accuracy.  
main
